import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function checkOrders() {
  console.log("🔄 Connecting to BUPZO MCP Server...");
  
  // index.js (MCP Server) ஐ Stdio Transport மூலமாக இணைத்தல்
  const transport = new StdioClientTransport({
    command: "node",
    args: ["index.js"]
  });
  
  const client = new Client(
    { name: "bupzo-test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  try {
    await client.connect(transport);
    console.log("✅ Connected! Calling get_bupzo_orders tool...\n");

    // get_bupzo_orders டூலை அழைத்தல்
    const result = await client.callTool({
      name: "get_bupzo_orders",
      arguments: {}
    });

    console.log("📦 Latest Orders Output:");
    console.log(result.content[0].text);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    process.exit(0);
  }
}

checkOrders();