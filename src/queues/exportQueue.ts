import { Queue } from "bullmq";
import { connection } from "./connection";

export const exportQueue = new Queue("exportQueue", { connection: connection as any });
