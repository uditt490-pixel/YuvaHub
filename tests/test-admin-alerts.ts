import assert from "node:assert";
import { sendAdminAlert } from "../src/services/adminAlertService.js";

async function runTest() {
  console.log("Starting test-admin-alerts.ts...");

  // Setup environment for testing multiple admins
  process.env.VITE_ADMIN_EMAILS = "maintainer1@yuvahub.com, maintainer2@yuvahub.com";
  
  const mockJob = {
    id: "job_999",
    data: { domain: "fail-domain.com" },
    attemptsMade: 5
  };
  
  const mockError = new Error("Simulated worker timeout");

  let enqueuedEmails: any[] = [];
  const mockEnqueueEmail = async (data: any) => {
    enqueuedEmails.push(data);
    return { id: "mock_email_" + Date.now() };
  };

  console.log("Triggering sendAdminAlert with mock enqueue...");
  await sendAdminAlert("TestWorker", mockJob, mockError, mockEnqueueEmail as any);

  try {
    assert.strictEqual(enqueuedEmails.length, 2, "Should have enqueued exactly 2 emails for 2 admins");
    
    // Verify recipients
    assert.strictEqual(enqueuedEmails[0].to, "maintainer1@yuvahub.com");
    assert.strictEqual(enqueuedEmails[1].to, "maintainer2@yuvahub.com");
    
    // Verify text body
    assert.ok(enqueuedEmails[0].body.includes("TestWorker Job Failed!"), "Text should contain worker name");
    assert.ok(enqueuedEmails[0].body.includes("fail-domain.com"), "Text should contain domain");
    assert.ok(enqueuedEmails[0].body.includes("Simulated worker timeout"), "Text should contain error message");

    // Verify HTML body generated from emailTemplates.ts
    assert.ok(enqueuedEmails[0].html.includes("job_999"), "HTML should contain job ID");
    assert.ok(enqueuedEmails[0].html.includes("fail-domain.com"), "HTML should contain domain");
    assert.ok(enqueuedEmails[0].html.includes("Simulated worker timeout"), "HTML should contain error message");
    
    console.log("✅ All regression tests passed successfully for sendAdminAlert.");
  } catch (err) {
    console.error("❌ Test assertion failed:", err);
    process.exit(1);
  }
}

runTest().catch(err => {
  console.error("❌ Test script failed:", err);
  process.exit(1);
});
