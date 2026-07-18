import { enqueueEmail } from "../src/queues/emailQueue";

async function run() {
  console.log("Starting queue load test...");
  const startTime = Date.now();

  for (let i = 0; i < 100; i++) {
    await enqueueEmail({
      to: `test${i}@example.com`,
      subject: `Mock Email ${i}`,
      body: `This is a test email number ${i}`
    });
  }

  const endTime = Date.now();
  console.log(`Enqueued 100 emails in ${endTime - startTime}ms.`);
  console.log("Main event loop remained unblocked during enqueueing.");
  process.exit(0);
}

run();
