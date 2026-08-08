import { Request, Response } from "express";
import { jsPDF } from "jspdf";
import { dbCommand, dbQuery } from "../db.js";
import { AppError } from "../../lib/AppError.js";
import { safeObjectId, parsePagination } from "../../lib/utils.js";
import { sendPaginated, sendSuccess, sendError } from "../../lib/apiResponse.js";

export const handleListResumes = async (req: any, res: any) => {
  try {
    const user = req.user;
    if (!user || !user.uid) return sendError(res, "Unauthorized", 401);
    if (!dbQuery) return sendError(res, "Database unavailable", 503);

    const { page, limit, skip } = parsePagination(req.query);
    const resumesCol = dbQuery.collection("resumes");
    const filter = { userId: user.uid };
    const [list, total] = await Promise.all([
      resumesCol.find(filter).sort({ isDefault: -1, uploadedAt: -1 }).skip(skip).limit(limit).toArray(),
      resumesCol.countDocuments(filter)
    ]);
    const formatted = list.map((r: any) => ({ ...r, id: r._id.toString() }));
    return sendPaginated(res, formatted, page, limit, total);
  } catch (err: any) {
    console.error("[Resumes] List error:", err);
    return sendError(res, err.message || "Failed to list resumes", 500);
  }
};

export const handleCreateResume = async (req: any, res: any) => {
  const user = req.user;
  if (!user || !user.uid) throw AppError.unauthorized("Unauthorized");
  if (!dbCommand) throw AppError.serviceUnavailable("Database unavailable");

  const { displayName, originalFileName, fileUrl, publicId } = req.body || {};
  if (!fileUrl) {
    throw AppError.badRequest("Missing required fileUrl");
  }

  const resumesCol = dbCommand.collection("resumes");
  const usersCol = dbCommand.collection("users");

  const existingCount = await resumesCol.countDocuments({ userId: user.uid });
  const isDefault = existingCount === 0 || req.body.isDefault === true;

  if (isDefault) {
    await resumesCol.updateMany({ userId: user.uid }, { $set: { isDefault: false } });
  }

  const now = new Date();
  const newResume = {
    userId: user.uid,
    displayName: (displayName && displayName.trim()) || (originalFileName && originalFileName.trim()) || "Untitled Resume",
    originalFileName: (originalFileName && originalFileName.trim()) || "resume.pdf",
    fileUrl,
    publicId: publicId || "",
    uploadedAt: now,
    updatedAt: now,
    isDefault
  };

  const result = await resumesCol.insertOne(newResume);
  const insertedId = result.insertedId.toString();

  if (isDefault) {
    await usersCol.updateOne(
      { uid: user.uid },
      { $set: { resumeUrl: fileUrl, resumePublicId: publicId || "", updatedAt: now } }
    );
  }

  return sendSuccess(res, { resume: { ...newResume, id: insertedId } }, 201);
};

export const handleRenameResume = async (req: any, res: any) => {
  const user = req.user;
  if (!user || !user.uid) throw AppError.unauthorized("Unauthorized");
  if (!dbCommand) throw AppError.serviceUnavailable("Database unavailable");

  const { id } = req.params;
  const { displayName } = req.body || {};

  if (!displayName || !displayName.trim()) {
    throw AppError.badRequest("displayName is required");
  }

  const resumesCol = dbCommand.collection("resumes");
  const oid = safeObjectId(id);
  const query = oid
    ? { _id: oid, userId: user.uid }
    : { _id: id, userId: user.uid };

  const target = await resumesCol.findOne(query);
  if (!target) {
    throw AppError.notFound("Resume not found or unauthorized");
  }

  const now = new Date();
  await resumesCol.updateOne(query, { $set: { displayName: displayName.trim(), updatedAt: now } });

  const updated = await resumesCol.findOne(query);
  return sendSuccess(res, { resume: { ...updated, id: updated._id.toString() } });
};

export const handleDeleteResume = async (req: any, res: any) => {
  const user = req.user;
  if (!user || !user.uid) throw AppError.unauthorized("Unauthorized");
  if (!dbCommand) throw AppError.serviceUnavailable("Database unavailable");

  const { id } = req.params;
  const resumesCol = dbCommand.collection("resumes");
  const usersCol = dbCommand.collection("users");

  const oid = safeObjectId(id);
  const query = oid
    ? { _id: oid, userId: user.uid }
    : { _id: id, userId: user.uid };

  const target = await resumesCol.findOne(query);
  if (!target) {
    throw AppError.notFound("Resume not found or unauthorized");
  }

  await resumesCol.deleteOne(query);

  if (target.isDefault) {
    const remaining = await resumesCol.find({ userId: user.uid }).sort({ updatedAt: -1, uploadedAt: -1 }).toArray();
    if (remaining.length > 0) {
      const nextDefault = remaining[0];
      await resumesCol.updateOne({ _id: nextDefault._id }, { $set: { isDefault: true, updatedAt: new Date() } });
      await usersCol.updateOne({ uid: user.uid }, { $set: { resumeUrl: nextDefault.fileUrl, resumePublicId: nextDefault.publicId || "", updatedAt: new Date() } });
    } else {
      await usersCol.updateOne({ uid: user.uid }, { $set: { resumeUrl: "", resumePublicId: "", updatedAt: new Date() } });
    }
  }

  return sendSuccess(res, { message: "Resume deleted successfully" });
};

export const handleSetDefaultResume = async (req: any, res: any) => {
  const user = req.user;
  if (!user || !user.uid) throw AppError.unauthorized("Unauthorized");
  if (!dbCommand) throw AppError.serviceUnavailable("Database unavailable");

  const { id } = req.params;
  const resumesCol = dbCommand.collection("resumes");
  const usersCol = dbCommand.collection("users");

  const oid = safeObjectId(id);
  const query = oid
    ? { _id: oid, userId: user.uid }
    : { _id: id, userId: user.uid };

  const target = await resumesCol.findOne(query);
  if (!target) {
    throw AppError.notFound("Resume not found or unauthorized");
  }

  const now = new Date();
  await resumesCol.updateMany({ userId: user.uid }, { $set: { isDefault: false } });
  await resumesCol.updateOne(query, { $set: { isDefault: true, updatedAt: now } });

  await usersCol.updateOne({ uid: user.uid }, { $set: { resumeUrl: target.fileUrl, resumePublicId: target.publicId || "", updatedAt: now } });

  const updated = await resumesCol.findOne(query);
  return sendSuccess(res, { resume: { ...updated, id: updated._id.toString() } });
};

export const handleExportResumeToPDF = async (req: any, res: any) => {
  try {
    const user = req.user;
    if (!user || !user.uid) return sendError(res, "Unauthorized", 401);
    if (!dbQuery) return sendError(res, "Database unavailable", 503);

    const usersCol = dbQuery.collection("users");
    const userProfile = await usersCol.findOne({ uid: user.uid });

    if (!userProfile) {
      return sendError(res, "User profile not found", 404);
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter"
    });

    const margin = 40;
    let y = 60;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const writeText = (text: string, fontSize = 10, fontStyle = "normal", color = [0, 0, 0], indent = 0) => {
      if (!text) return;
      doc.setFont("helvetica", fontStyle as any);
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(String(text), pageWidth - (margin * 2) - indent);
      
      for (const line of lines) {
        if (y + 16 > pageHeight - margin) {
          doc.addPage();
          y = 60;
        }
        doc.text(line, margin + indent, y);
        y += 16;
      }
    };

    // Name
    const name = userProfile.name || "Unknown User";
    writeText(name, 24, "bold", [17, 24, 39], 0);
    y += 10;

    // Contact Info (optional addition)
    if (userProfile.email) {
      writeText(userProfile.email, 10, "normal", [75, 85, 99], 0);
      y += 20;
    }

    // Education
    if (userProfile.education && Array.isArray(userProfile.education) && userProfile.education.length > 0) {
      writeText("Education", 16, "bold", [31, 41, 55], 0);
      y += 5;
      for (const edu of userProfile.education) {
        writeText(`${edu.degree || ""} - ${edu.institution || ""}`, 12, "bold", [0, 0, 0], 10);
        writeText(`${edu.dates || ""}`, 10, "italic", [75, 85, 99], 10);
        if (edu.gpa) {
          writeText(`GPA: ${edu.gpa}`, 10, "normal", [55, 65, 81], 10);
        }
        y += 10;
      }
    }

    // Experience
    if (userProfile.workExperience && Array.isArray(userProfile.workExperience) && userProfile.workExperience.length > 0) {
      writeText("Experience", 16, "bold", [31, 41, 55], 0);
      y += 5;
      for (const exp of userProfile.workExperience) {
        writeText(`${exp.role || ""} at ${exp.company || ""}`, 12, "bold", [0, 0, 0], 10);
        writeText(`${exp.dates || ""}`, 10, "italic", [75, 85, 99], 10);
        if (exp.impact) {
          writeText(exp.impact, 10, "normal", [55, 65, 81], 10);
        }
        y += 10;
      }
    }

    // Skills
    if (userProfile.skills && Array.isArray(userProfile.skills) && userProfile.skills.length > 0) {
      writeText("Skills", 16, "bold", [31, 41, 55], 0);
      y += 5;
      const skillsText = userProfile.skills.join(", ");
      writeText(skillsText, 10, "normal", [55, 65, 81], 10);
      y += 10;
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.pdf"`);
    res.status(200).send(pdfBuffer);
    
  } catch (err: any) {
    console.error("[Resumes] Export to PDF error:", err);
    return sendError(res, err.message || "Failed to export resume to PDF", 500);
  }
};

