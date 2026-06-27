import { stitch } from "@google/stitch-sdk";
import fs from "fs";

// Configure API Key
process.env.STITCH_API_KEY = "AQ.Ab8RN6LsciH6omORQ0_DiRO9jW6YvcSWjbJczo-h9cIoCg6pNA";

async function main() {
  try {
    console.log("Fetching projects from Google Stitch...");
    const projects = await stitch.projects();
    console.log(`Found ${projects.length} projects.`);
    
    const results = [];
    for (const project of projects) {
      console.log(`Project: ${project.id} - ${project.name || "Unnamed"}`);
      const screens = await project.screens();
      const projectData = {
        id: project.id,
        name: project.name,
        screens: []
      };
      
      for (const screen of screens) {
        console.log(`  Screen: ${screen.id} - ${screen.name || "Unnamed"}`);
        let html = "";
        let img = "";
        try {
          html = await screen.getHtml();
        } catch (e) {
          html = e.message;
        }
        try {
          img = await screen.getImage();
        } catch (e) {
          img = e.message;
        }
        projectData.screens.push({
          id: screen.id,
          name: screen.name,
          prompt: screen.prompt,
          htmlUrl: html,
          imageUrl: img
        });
      }
      results.push(projectData);
    }
    
    fs.writeFileSync("stitch_export.json", JSON.stringify(results, null, 2));
    console.log("Export complete! Saved to stitch_export.json");
  } catch (err) {
    console.error("Error fetching projects:", err);
  }
}

main();
