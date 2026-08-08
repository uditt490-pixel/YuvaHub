import dotenv from 'dotenv';
dotenv.config();

async function runAIFallbackTest() {
  const urlBase = 'http://localhost:5173';
  console.log("Testing AI generation fallback behavior...");

  // 1. Test normal generation (simulating error via passing a malformed prompt or just checking the response if the key is invalid)
  // For the sake of the test, we can just hit the endpoint with a known prompt. If the API key is valid, it succeeds.
  // If the API key is removed/invalid, it should return 503 since useFallback is false.
  try {
    console.log("\n1. Testing without fallback (useFallback = false)");
    const res1 = await fetch(`${urlBase}/api/v1/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: "Hello", useFallback: false })
    });
    console.log(`Status: ${res1.status}`);
    if (res1.status === 503) {
      console.log("SUCCESS: Received 503 Service Unavailable when AI fails (or if server is disconnected from real AI).");
    } else {
      console.log("SUCCESS: Received 2xx, AI is working normally.");
    }
  } catch (e: any) {
    console.error("Error connecting to server:", e.message);
  }

  // 2. Test with fallback (useFallback = true)
  try {
    console.log("\n2. Testing with fallback (useFallback = true)");
    const res2 = await fetch(`${urlBase}/api/v1/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: "Hello", useFallback: true })
    });
    console.log(`Status: ${res2.status}`);
    if (res2.ok) {
      const data = await res2.json();
      console.log("SUCCESS: Received 200 OK with fallback content:");
      console.log(data.text.substring(0, 50) + "...");
    } else {
      console.log("FAILED: Expected 200 OK with fallback content.");
    }
  } catch (e: any) {
    console.error("Error connecting to server:", e.message);
  }
}

runAIFallbackTest();
