import fetch from "node-fetch"; // requires node-fetch or native fetch in node 18+

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

    // 2. Validate Eligibility (Eligible User)
    console.log("\n2. Testing AI Eligibility Validator (Eligible)...");
    const eligibleUser = {
      gender: "Female",
      family_income: 600000,
      cgpa: 8.5,
      course: "B.Tech Computer Science"
    };

    const validateRes = await fetch(BASE_URL + "/validate-eligibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scholarshipId: id, userProfile: eligibleUser })
    });
    const validateData = await validateRes.json();
    console.log("Validation Response (Eligible):", validateData);

    // 3. Validate Eligibility (Ineligible User)
    console.log("\n3. Testing AI Eligibility Validator (Ineligible)...");
    const ineligibleUser = {
      gender: "Male",
      family_income: 1000000,
      cgpa: 7.0,
      course: "B.Tech Mechanical Engineering"
    };

    const validateRes2 = await fetch(BASE_URL + "/validate-eligibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scholarshipId: id, userProfile: ineligibleUser })
    });
    const validateData2 = await validateRes2.json();
    console.log("Validation Response (Ineligible):", validateData2);

    // 4. Delete Scholarship
    console.log("\n4. Cleaning up (Deleting Scholarship)...");
    const deleteRes = await fetch(BASE_URL + "/" + id, {
      method: "DELETE"
    });
    const deleteData = await deleteRes.json();
    console.log("Delete Response:", deleteData);

  } catch (error) {
    console.error("Test failed:", error);
  }
}

run();
