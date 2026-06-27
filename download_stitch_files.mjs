import fs from "fs";
import path from "path";

async function main() {
  try {
    const rawData = fs.readFileSync("stitch_export.json", "utf8");
    const projects = JSON.parse(rawData);
    const screens = projects[0]?.screens || [];
    
    const outputDir = "./stitch_designs";
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log(`Downloading ${screens.length} Stitch design files...`);
    
    const downloadedFiles = [];
    
    // Process in chunks of 10
    const chunkSize = 10;
    for (let i = 0; i < screens.length; i += chunkSize) {
      const chunk = screens.slice(i, i + chunkSize);
      const promises = chunk.map(async (screen) => {
        if (!screen.htmlUrl || !screen.htmlUrl.startsWith("http")) {
          return null;
        }
        try {
          const res = await fetch(screen.htmlUrl);
          const html = await res.text();
          
          // Get a clean filename from screen title or ID
          const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
          let rawTitle = titleMatch ? titleMatch[1].trim() : `Screen_${screen.id}`;
          
          // Clean title for filename
          let cleanTitle = rawTitle
            .replace(/BUPZO/gi, "bupzo")
            .replace(/&amp;/g, "and")
            .replace(/[^a-z0-9]/gi, "_")
            .replace(/_+/g, "_")
            .toLowerCase();
            
          if (cleanTitle.startsWith("_")) cleanTitle = cleanTitle.substring(1);
          if (cleanTitle.endsWith("_")) cleanTitle = cleanTitle.slice(0, -1);
          
          if (!cleanTitle) {
            cleanTitle = `screen_${screen.id.substring(0, 8)}`;
          }
          
          let fileName = `${cleanTitle}.html`;
          let filePath = path.join(outputDir, fileName);
          
          // Handle duplicates by appending id chunk
          if (fs.existsSync(filePath)) {
            fileName = `${cleanTitle}_${screen.id.substring(0, 6)}.html`;
            filePath = path.join(outputDir, fileName);
          }
          
          fs.writeFileSync(filePath, html);
          
          return {
            id: screen.id,
            title: rawTitle,
            fileName: fileName,
            filePath: filePath
          };
        } catch (e) {
          console.error(`Error downloading screen ${screen.id}:`, e.message);
          return null;
        }
      });
      
      const results = await Promise.all(promises);
      results.forEach(r => {
        if (r) downloadedFiles.push(r);
      });
      console.log(`Downloaded ${Math.min(i + chunkSize, screens.length)}/${screens.length} files`);
    }
    
    fs.writeFileSync("downloaded_designs.json", JSON.stringify(downloadedFiles, null, 2));
    console.log(`Successfully downloaded ${downloadedFiles.length} files to ./stitch_designs/`);
    
  } catch (err) {
    console.error("Error during download process:", err);
  }
}

main();
