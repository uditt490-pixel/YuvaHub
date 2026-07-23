import { Queue } from "bullmq";
import { connection } from "./connection";

export const resumeParserQueue = new Queue("resume-parser", { connection });
