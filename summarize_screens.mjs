import fs from "fs";
import httpx from "https"; // We can use the native https module or fetch

async function getUrlContent(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve(data);
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

// Since node 18+ has native fetch, let's use that!
async function main() {
  try {
    const rawData = fs.readFileSync("stitch_export.json", "utf8");
    const projects = JSON.parse(rawData);
    const screens = projects[0]?.screens || [];
    
    console.log(`Processing ${screens.length} screens...`);
    const summary = [];
    
    // Process in chunks to avoid rate limits
    const chunkSize = 10;
    for (let i = 0; i < screens.length; i += chunkSize) {
      const chunk = screens.slice(i, i + chunkSize);
      const promises = chunk.map(async (screen) => {
        if (!screen.htmlUrl || !screen.htmlUrl.startsWith("http")) {
          return { id: screen.id, title: "No HTML URL", error: true };
        }
        try {
          const res = await fetch(screen.htmlUrl);
          const html = await res.text();
          const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : "Untitled";
          
          // Also try to find any main heading <h1> or <h2>
          const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
          const h2Match = html.match(/<h2[^>]*>([^<]+)<\/h2>/i);
          const heading = h1Match ? h1Match[1].trim() : (h2Match ? h2Match[1].trim() : "");
          
          return {
            id: screen.id,
            title,
            heading,
            imageUrl: screen.imageUrl
          };
        } catch (e) {
          return { id: screen.id, title: `Error: ${e.message}`, error: true };
        }
      });
      
      const results = await Promise.all(promises);
      summary.push(...results);
      console.log(`Processed ${Math.min(i + chunkSize, screens.length)}/${screens.length} screens`);
    }
    
    fs.writeFileSync("screens_summary.json", JSON.stringify(summary, null, 2));
    console.log("Summary saved to screens_summary.json");
    
    // Print a nice markdown list of unique titles
    const uniqueTitles = [...new Set(summary.map(s => s.title))];
    console.log("\nUnique Screen Titles Found:");
    uniqueTitles.forEach(t => console.log(`- ${t}`));
  } catch (err) {
    console.error("Error summarizing screens:", err);
  }
}

main();
