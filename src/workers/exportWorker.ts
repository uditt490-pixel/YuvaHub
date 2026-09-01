import { Worker, Job } from "bullmq";
import { connection } from "../queues/connection";
import { exportQueue } from "../queues/exportQueue";
import { logger } from "../utils/logger";
import { dbQuery, dbCommand } from "../api/db";
import { ExportHistory } from "../models/exportHistorySchema";
import { getSocketIO } from "../api/socketInstance";
import { enqueueEmail } from "../queues/emailQueue";
import { v2 as cloudinary } from "cloudinary";
import { jsPDF } from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";
import { Readable } from "stream";

export const exportWorker = new Worker(
  "exportQueue",
  async (job: Job) => {
    const { exportId, userId, format, sections } = job.data;
    logger.info({ exportId, userId }, "Starting export job processing");

    try {
      // 1. Mark as processing
      await dbCommand.collection("exporthistories").updateOne(
        { _id: exportId },
        { $set: { status: "processing" } }
      );

      // 2. Fetch data
      let exportData: any = {};
      
      if (sections.includes("profile")) {
        const user = await dbQuery.collection("users").findOne({ uid: userId });
        exportData.profile = user || {};
      }

      if (sections.includes("applications")) {
        const apps = await dbQuery.collection("applications").find({ userId }).toArray();
        exportData.applications = apps || [];
      }

      if (sections.includes("bookmarks")) {
        const watchlists = await dbQuery.collection("watchlists").find({ userId }).toArray();
        exportData.bookmarks = watchlists || [];
      }

      // 3. Generate File Buffer
      let fileBuffer: Buffer;
      let fileExtension = format;
      let contentType = "";

      if (format === "json") {
        fileBuffer = Buffer.from(JSON.stringify(exportData, null, 2), "utf-8");
        contentType = "application/json";
      } else if (format === "csv") {
        let csvContent = "";
        
        if (sections.includes("profile") && exportData.profile) {
          csvContent += "--- Profile Data ---\n";
          csvContent += "Name,Email,Reputation,Level\n";
          csvContent += `"${exportData.profile.name || ""}","${exportData.profile.email || ""}",${exportData.profile.reputation_score || 0},${exportData.profile.level || 1}\n\n`;
        }

        if (sections.includes("applications") && exportData.applications.length > 0) {
          csvContent += "--- Applications ---\n";
          csvContent += "Title,Company,Status,Applied At\n";
          exportData.applications.forEach((app: any) => {
            csvContent += `"${app.opportunityTitle || ""}","${app.companyName || ""}","${app.status || ""}","${app.appliedAt || ""}"\n`;
          });
          csvContent += "\n";
        }

        if (sections.includes("bookmarks") && exportData.bookmarks.length > 0) {
          csvContent += "--- Bookmarks ---\n";
          csvContent += "Item ID,Type,Added At\n";
          exportData.bookmarks.forEach((bm: any) => {
            csvContent += `"${bm.itemId || ""}","${bm.itemType || ""}","${bm.createdAt || ""}"\n`;
          });
        }

        fileBuffer = Buffer.from(csvContent, "utf-8");
        contentType = "text/csv";
      } else if (format === "pdf") {
        const doc = new jsPDF();
        let yPos = 20;
        
        doc.setFontSize(22);
        doc.text("YuvaHub Data Export", 14, yPos);
        yPos += 10;
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, yPos);
        yPos += 15;

        if (sections.includes("profile") && exportData.profile) {
          doc.setFontSize(16);
          doc.text("Profile Information", 14, yPos);
          yPos += 10;
          doc.setFontSize(12);
          doc.text(`Name: ${exportData.profile.name || "N/A"}`, 14, yPos);
          yPos += 7;
          doc.text(`Email: ${exportData.profile.email || "N/A"}`, 14, yPos);
          yPos += 7;
          doc.text(`Reputation: ${exportData.profile.reputation_score || 0}`, 14, yPos);
          yPos += 7;
          doc.text(`Level: ${exportData.profile.level || 1}`, 14, yPos);
          yPos += 15;
        }

        if (sections.includes("applications") && exportData.applications.length > 0) {
          const appData = exportData.applications.map((app: any) => [
            app.opportunityTitle || "N/A",
            app.companyName || "N/A",
            app.status || "N/A",
            app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "N/A"
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['Opportunity', 'Company', 'Status', 'Date Applied']],
            body: appData,
            theme: 'striped',
            headStyles: { fillColor: [181, 107, 55] }, // YuvaHub Brand Color
          });
          
          yPos = (doc as any).lastAutoTable.finalY + 15;
        }

        if (sections.includes("bookmarks") && exportData.bookmarks.length > 0) {
          const bmData = exportData.bookmarks.map((bm: any) => [
            bm.itemType || "N/A",
            bm.itemId || "N/A",
            bm.createdAt ? new Date(bm.createdAt).toLocaleDateString() : "N/A"
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['Type', 'ID', 'Bookmarked On']],
            body: bmData,
            theme: 'striped',
            headStyles: { fillColor: [181, 107, 55] },
          });
        }

        fileBuffer = Buffer.from(doc.output('arraybuffer'));
        contentType = "application/pdf";
      } else {
        throw new Error("Unsupported format");
      }

      // 4. Upload to Cloudinary
      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `yuvahub/exports/${userId}`,
            resource_type: "raw", // use 'raw' for non-image files
            public_id: `export_${exportId}.${fileExtension}`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        Readable.from(fileBuffer).pipe(uploadStream);
      });

      const fileUrl = uploadResult.secure_url;

      // 5. Update status
      await dbCommand.collection("exporthistories").updateOne(
        { _id: exportId },
        { 
          $set: { 
            status: "completed", 
            fileUrl, 
            completedAt: new Date() 
          } 
        }
      );

      // 6. Notify user via socket
      const io = getSocketIO();
      if (io) {
        io.to(`dm_${userId}`).emit("export_ready", { exportId, fileUrl, format });
      }

      // 7. Enqueue email
      const user = await dbQuery.collection("users").findOne({ uid: userId });
      if (user && user.email) {
        await enqueueEmail({
          to: user.email,
          subject: "Your Data Export is Ready - YuvaHub",
          body: `Hi ${user.name || "there"},\n\nYour requested data export (${format.toUpperCase()}) is now ready for download.\n\nYou can download it here: ${fileUrl}\n\nThanks,\nThe YuvaHub Team`,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Your Data Export is Ready</h2>
              <p>Hi ${user.name || "there"},</p>
              <p>Your requested data export (${format.toUpperCase()}) is now ready for download.</p>
              <p><a href="${fileUrl}" style="background: #2563EB; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Download File</a></p>
              <p>Thanks,<br/>The YuvaHub Team</p>
            </div>
          `
        });
      }

    } catch (err: any) {
      logger.error({ err, exportId }, "Error processing export job");
      await dbCommand.collection("exporthistories").updateOne(
        { _id: exportId },
        { $set: { status: "failed", errorMessage: err.message, completedAt: new Date() } }
      );
      
      const io = getSocketIO();
      if (io) {
        io.to(`dm_${userId}`).emit("export_failed", { exportId, error: err.message });
      }
    }
  },
  { connection: connection as any }
);

export const closeExportWorker = async () => {
  await exportWorker.close();
};
