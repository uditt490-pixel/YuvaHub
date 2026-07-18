// @ts-ignore
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

async function testRBAC() {
  const secret = process.env.JWT_SECRET || "yuvahub-secret-key";

  // Generate a mock student JWT
  const studentToken = jwt.sign({
    sub: "student123",
    email: "student@example.com",
    role: "user" // Standard student account
  }, secret, { expiresIn: "1h" });

  // Generate a mock admin JWT
  const adminToken = jwt.sign({
    sub: "admin123",
    email: "uditt490@gmail.com",
    role: "admin"
  }, secret, { expiresIn: "1h" });

  console.log("Testing with Student Token (Expected: 403 Forbidden)");
  try {
    const res1 = await fetch("http://localhost:5173/api/v1/admin/users/999", {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${studentToken}`
      }
    });
    console.log(`Student Delete Response Status: ${res1.status}`);
    const data1 = await res1.json().catch(() => ({}));
    console.log(`Student Delete Response Body:`, data1);
  } catch (err) {
    console.error(err);
  }

  console.log("\nTesting with Admin Token (Expected: 200 OK)");
  try {
    const res2 = await fetch("http://localhost:5173/api/v1/admin/users/999", {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${adminToken}`
      }
    });
    console.log(`Admin Delete Response Status: ${res2.status}`);
    const data2 = await res2.json().catch(() => ({}));
    console.log(`Admin Delete Response Body:`, data2);
  } catch (err) {
    console.error(err);
  }
}

testRBAC();
