import fetch from "node-fetch"; // requires node-fetch or native fetch in node 18+

const BASE_URL = "http://localhost:3000/api/scholarships";

import { describe, it, expect } from 'vitest';

const BASE_URL = "http://localhost:3000/api/scholarships";

async function run() {
  console.log("=== Testing Scholarship Hub Endpoints ===");

  const scholarshipData = {
    title: "Women in Tech Excellence Scholarship",
    description: "A scholarship for outstanding women pursuing degrees in Computer Science and Engineering.",
    provider: "Tech Foundation",
    amount_inr: 50000,
    target_demographics: ["Women"],
    financial_criteria: {
      max_family_income_inr: 800000
    },
    academic_criteria: {
      min_cgpa: 8.0,
      eligible_courses: ["B.Tech Computer Science", "B.E. Information Technology"]
    },
    deadline: "2026-12-31"
  };

  try {
    // 1. Create Scholarship
    console.log("\n1. Creating Scholarship...");
    const createRes = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scholarshipData)
    });
    const createData = await createRes.json() as any;
    console.log("Create Response:", createData);
    
    const id = createData.id;
    if (!id) {
        console.error("Failed to get ID from creation. Exiting test.");
        return;
    }
  });
});