/**
 * Application Worker
 *
 * Consumes application queue jobs.
 *
 * Responsibilities:
 * - Generate AI application drafts
 * - Prepare application metadata
 * - Trigger future application workflows
 */


import { Worker, Job } from "bullmq";
import { connection } from "../queues/connection";
import { ApplicationJobData } from "../queues/applicationQueue";


async function processApplicationJob(
  job: Job<ApplicationJobData>
) {

  const data = job.data;


  console.log(
    `[ApplicationWorker] Processing ${data.action}`
  );


  switch (data.action) {


    case "generate_draft": {

      /**
       * Future integration:
       * Gemini/OpenAI application writer
       *
       * Example:
       *
       * generateApplicationDraft(
       *    profile,
       *    opportunity
       * )
       */


      console.log(
        `Generating draft for ${data.opportunityTitle}`
      );


      return {
        success: true,
        type: "draft",
        message:
          "Application draft generation completed",
      };
    }



    case "prepare_application": {

      console.log(
        `Preparing application package for ${data.userId}`
      );


      return {
        success: true,
        type: "prepared",
      };
    }



    case "send_application": {


      /**
       * Future:
       * - email service
       * - external application APIs
       * - notification system
       */


      console.log(
        `Sending application for ${data.opportunityId}`
      );


      return {
        success: true,
        type: "sent",
      };
    }



    default:

      throw new Error(
        `Unknown application action: ${data.action}`
      );
  }
}



export const applicationWorker =
  new Worker<ApplicationJobData>(
    "application-processing",
    processApplicationJob,
    {
      connection: connection as any,
      concurrency: 5,
    }
  );



applicationWorker.on(
  "completed",
  (job) => {

    console.log(
      `[ApplicationWorker] Job ${job.id} completed`
    );

  }
);



applicationWorker.on(
  "failed",
  (job, error) => {

    console.error(
      `[ApplicationWorker] Job ${job?.id} failed`,
      error
    );

  }
);

let applicationWorkerErrorLogged = false;
applicationWorker.on("error", (err) => {
  if (!applicationWorkerErrorLogged) {
    console.warn('[ApplicationWorker] Redis connection offline. Worker listening paused.');
    applicationWorkerErrorLogged = true;
  }
});