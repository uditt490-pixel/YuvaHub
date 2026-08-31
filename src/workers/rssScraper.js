import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';

// TODO: Set GEMINI_API_KEY in your environment variables before running this in production.
const ai = new GoogleGenAI({});

// Bypass strict server blocks (like HackerNews)
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

const FEEDS = [
  'https://techcrunch.com/feed/',
  'https://hnrss.org/frontpage' 
];

// Helper: Ask Gemini for a 3-bullet summary
async function summarizeArticle(title, snippet) {
  try {
    const prompt = `You are a helpful assistant for tech students. Summarize the following news article into exactly 3 concise bullet points explaining why this matters for students (e.g., job trends, new tech to learn, industry shifts).\n\nTitle: ${title}\nSnippet: ${snippet}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    return "• Summary temporarily unavailable.";
  }
}

// Helper: Auto-tag articles based on keywords
function generateTags(title, snippet) {
  const text = (title + ' ' + snippet).toLowerCase();
  const tags = [];
  
  if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('openai')) tags.push('AI');
  if (text.includes('crypto') || text.includes('web3') || text.includes('blockchain')) tags.push('Web3');
  if (text.includes('layoff') || text.includes('hiring') || text.includes('job')) tags.push('Careers');
  if (text.includes('react') || text.includes('node') || text.includes('javascript')) tags.push('Web Dev');
  
  return tags.length > 0 ? tags : ['General Tech'];
}

async function fetchNewsFeeds() {
  console.log('🚀 Starting RSS Feed Scraper & AI Summarizer...');
  const allArticles = [];

  for (const feedUrl of FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      console.log(`✅ Fetched items from: ${feed.title}`);

      // Grabbing top 3 items per feed for the final script
      const topItems = feed.items.slice(0, 3); 
      
      for (const item of topItems) {
        const contentSnippet = item.contentSnippet ? item.contentSnippet.substring(0, 200) + '...' : 'No snippet available.';
        
        console.log(`🧠 Processing: "${item.title}"...`);
        const summary = await summarizeArticle(item.title, contentSnippet);
        const tags = generateTags(item.title, contentSnippet);

        allArticles.push({
          title: item.title,
          link: item.link,
          source: feed.title,
          pubDate: item.pubDate,
          summary: summary,
          tags: tags
        });
      }
    } catch (error) {
      console.error(`❌ Error fetching feed ${feedUrl}:`, error.message);
    }
  }

  console.log('\n📌 Total articles processed:', allArticles.length);
  console.log('\nFinal Output Ready for Database:');
  console.log(allArticles[0]); 
  
  // TODO: Import your Mongoose/Prisma models here and save `allArticles` to the database.
  
  return allArticles;
}

fetchNewsFeeds();
