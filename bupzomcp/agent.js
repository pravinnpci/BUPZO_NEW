import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

dotenv.config({ path: "../.env" });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY not found in .env!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

class BupzoAgent {
  constructor() {
    this.modelName = "gemini-1.5-flash-002";
    this.mcpClient = null;
    this.chat = null;
  }

  async init() {
    console.log("🔄 Connecting to MCP Server from Agent...");
    const transport = new StdioClientTransport({
      command: "node",
      args: ["index.js"]
    });

    this.mcpClient = new Client(
      { name: "bupzo-agent-client", version: "1.0.0" },
      { capabilities: {} }
    );

    await this.mcpClient.connect(transport);
    
    const toolsResult = await this.mcpClient.listTools();
    
    // Gemini API requires UPPERCASE types (e.g., "OBJECT", "STRING") 
    // MCP returns lowercase. We convert them here.
    const convertSchema = (schema) => {
      if (!schema) return undefined;
      const res = { ...schema };
      if (typeof res.type === 'string') res.type = res.type.toUpperCase();
      if (res.properties) {
        res.properties = { ...res.properties };
        for (const key in res.properties) {
          res.properties[key] = convertSchema(res.properties[key]);
        }
      }
      if (res.items) res.items = convertSchema(res.items);
      return res;
    };

    const functionDeclarations = toolsResult.tools.map(tool => {
      let parameters = tool.inputSchema && tool.inputSchema.properties && Object.keys(tool.inputSchema.properties).length > 0
        ? convertSchema(tool.inputSchema)
        : { type: "OBJECT", properties: { _dummy: { type: "STRING", description: "Not used" } } };
        
      return {
        name: tool.name,
        description: tool.description || `Tool ${tool.name}`,
        parameters
      };
    });

    const model = genAI.getGenerativeModel(
      {
        model: this.modelName,
        systemInstruction: "You are Asay AI, the professional assistant for Asay Technologies. We specialize in modern, scalable, and reliable digital solutions. Our services include: Web Development, Custom SaaS, Cloud Solutions, Mobile Apps, Data Analytics, Cybersecurity, Strategic Consulting, Global Scaling, and Rapid Prototyping. Our contact details are: WhatsApp +91 9245464648, Email hello@asaytech.com. Our Chennai office address is: First Floor, No 3/31 Jawaharayya Nagar, Aadhanoor Road, Madambakkam Po, Guduvanchery 603202. Always provide these details directly when asked. Be professional and concise. For detailed project inquiries, suggest visiting the 'Contact' page. For more in-depth service information, suggest visiting the 'Services' page.",
        tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined
      },
      { apiVersion: 'v1beta' }
    );

    this.chat = model.startChat({ history: [] });
    console.log("✅ Agent Initialized with MCP Tools!\n");
  }

  async sendMessage(userMessage) {
    try {
      const result = await this.chat.sendMessage(userMessage);
      
      const calls = result.response.functionCalls && result.response.functionCalls();
      if (calls && calls.length > 0) {
        const call = calls[0];
        console.log(`\n⚙️  Gemini is calling tool: ${call.name}...`);
        
        const mcpResult = await this.mcpClient.callTool({
          name: call.name,
          arguments: call.args || {}
        });
        
        const mcpText = mcpResult.content.map(c => c.text).join("\n");
        console.log(`📦 Tool Output: ${mcpText}`);
        
        const finalResult = await this.chat.sendMessage([{
          functionResponse: {
            name: call.name,
            response: { result: mcpText }
          }
        }]);
        return finalResult.response.text();
      }

      return result.response.text();
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }

  // பொருட்களைத் தேட
  async findProducts(query) {
    const prompt = `BUPZO ecommerce ல் "${query}" தொடர்பான பொருட்கள் பரிந்துரை பண்ணு. விலை, விவரம் சொல்லு.`;
    return this.sendMessage(prompt);
  }

  // ஆர்டர் உதவி
  async orderAssistant(orderId) {
    const prompt = `Order #${orderId} பற்றி விளக்கம் தெரிவு. ஆர்டர் status, delivery time சொல்லु.`;
    return this.sendMessage(prompt);
  }

  // பொது கேள்வி
  async generalQuery(question) {
    return this.sendMessage(question);
  }
}

export default BupzoAgent;
