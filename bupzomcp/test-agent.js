import BupzoAgent from "./agent.js";

async function runAgent() {
  console.log("🤖 BUPZO Gemini AI Agent Starting...\n");
  
  const agent = new BupzoAgent();

  try {
    // Test 1: பொதுக் கேள்வி
    console.log("📝 Test 1: பொதுக் கேள்வி");
    console.log("🔄 Waiting...");
    const q1 = await agent.generalQuery("நாகூர் ஹலவா என்ன? விலை என்ன?");
    console.log("Agent Response:", q1);
    console.log("\n---\n");

    // Test 2: பொருள் தேட
    console.log("🔍 Test 2: பொருள் தேட - sweets");
    console.log("🔄 Waiting...");
    const products = await agent.findProducts("sweets");
    console.log("Agent Response:", products);
    console.log("\n---\n");

    // Test 3: ஆர்டர் உதவி
    console.log("📦 Test 3: Order #123 ஆர்டர் உதவி");
    console.log("🔄 Waiting...");
    const order = await agent.orderAssistant("123");
    console.log("Agent Response:", order);
    console.log("\n---\n");

    console.log("✅ Agent Testing Complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

runAgent();
