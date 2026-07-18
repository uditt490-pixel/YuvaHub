import { ScraperProducer } from "../src/services/scraperProducer";

async function runTest() {
  console.log("Adding mock scraping jobs...");

  // Enqueue a few immediate jobs
  await ScraperProducer.enqueueScrape({
    domain: "devfolio.co",
    url: "https://genai.devfolio.co",
    type: "hackathon"
  });

  await ScraperProducer.enqueueScrape({
    domain: "devpost.com",
    url: "https://spaceapps.devpost.com",
    type: "hackathon"
  });

  console.log("Jobs added! Check the BullMQ dashboard or the worker logs.");
  
  // Close process after a short delay to allow Redis commands to finish
  setTimeout(() => process.exit(0), 1000);
}

runTest().catch(console.error);
