import { Queue } from "bullmq";
import { connection } from "./connection";
import { QueueName } from "./queueNames.js";

export const resumeParserQueue = new Queue(QueueName.RESUME, { connection });
