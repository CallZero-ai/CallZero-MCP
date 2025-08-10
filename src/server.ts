import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Core tools
import { createMakeCallTool, handleMakeCall } from "./tools/makeCall.js";
import {
  createGetCallStatusTool,
  handleGetCallStatus,
} from "./tools/getCallStatus.js";
import {
  createGetCallTranscriptTool,
  handleGetCallTranscript,
} from "./tools/getCallTranscript.js";

// Priority 1 tools
import { createCancelCallTool, handleCancelCall } from "./tools/cancelCall.js";
import { createListCallsTool, handleListCalls } from "./tools/listCalls.js";
import {
  createGetCreditBalanceTool,
  handleGetCreditBalance,
} from "./tools/getCreditBalance.js";
import { createShareCallTool, handleShareCall } from "./tools/shareCall.js";

// Priority 2 tools (Memory)
import { createMemoryTool, handleCreateMemory } from "./tools/createMemory.js";
import {
  createSearchMemoriesTool,
  handleSearchMemories,
} from "./tools/searchMemories.js";
import {
  createGetContactMemoriesTool,
  handleGetContactMemories,
} from "./tools/getContactMemories.js";

// Form Templates
import {
  createSearchFormTemplatesTool,
  searchFormTemplates,
} from "./tools/searchFormTemplates.js";
import { CallZeroHttpClient } from "./client/httpClient.js";

export class CallZeroMcpServer {
  private server: Server;
  private client: CallZeroHttpClient;

  constructor(apiKey: string, baseUrl?: string) {
    this.client = new CallZeroHttpClient(apiKey, baseUrl);

    this.server = new Server(
      {
        name: "@callzero/mcp-server",
        version: "0.0.2",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupRequestHandlers();
  }

  private setupRequestHandlers() {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Core tools
          createMakeCallTool(this.client),
          createGetCallStatusTool(this.client),
          createGetCallTranscriptTool(this.client),
          // Priority 1 tools
          createCancelCallTool(this.client),
          createListCallsTool(this.client),
          createGetCreditBalanceTool(this.client),
          createShareCallTool(this.client),
          // Priority 2 tools (Memory)
          createMemoryTool(this.client),
          createSearchMemoriesTool(this.client),
          createGetContactMemoriesTool(this.client),
          // Form Templates
          createSearchFormTemplatesTool(this.client),
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        // Core tools
        case "make_call":
          return await handleMakeCall(this.client, args);
        case "get_call_status":
          return await handleGetCallStatus(this.client, args);
        case "get_call_transcript":
          return await handleGetCallTranscript(this.client, args);

        // Priority 1 tools
        case "cancel_call":
          return await handleCancelCall(this.client, args);
        case "list_calls":
          return await handleListCalls(this.client, args);
        case "get_credit_balance":
          return await handleGetCreditBalance(this.client, args);
        case "share_call":
          return await handleShareCall(this.client, args);

        // Priority 2 tools (Memory)
        case "create_memory":
          return await handleCreateMemory(this.client, args);
        case "search_memories":
          return await handleSearchMemories(this.client, args);
        case "get_contact_memories":
          return await handleGetContactMemories(this.client, args);

        // Form Templates
        case "search_form_templates":
          return await searchFormTemplates(args, this.client);

        default:
          throw new Error(`Tool "${name}" not found`);
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Log to stderr so it doesn't interfere with MCP protocol on stdout
    console.error("CallZero MCP server running");
    console.error("Available tools:");
    console.error("  Core: make_call, get_call_status, get_call_transcript");
    console.error(
      "  Management: cancel_call, list_calls, get_credit_balance, share_call",
    );
    console.error(
      "  Memory: create_memory, search_memories, get_contact_memories",
    );
    console.error("  Templates: search_form_templates");
  }

  async stop() {
    await this.server.close();
  }
}

export async function startMcpServer() {
  const apiKey = process.env.CALLZERO_API_KEY;
  if (!apiKey) {
    console.error("Error: CALLZERO_API_KEY environment variable is required");
    console.error(
      'Set your CallZero API key: export CALLZERO_API_KEY="callzero_your_api_key_here"',
    );
    process.exit(1);
  }

  if (!apiKey.startsWith("callzero_")) {
    console.error('Error: Invalid API key format. Must start with "callzero_"');
    process.exit(1);
  }

  const baseUrl = process.env.CALLZERO_API_URL; // Optional override for development
  const server = new CallZeroMcpServer(apiKey, baseUrl);

  try {
    await server.start();
  } catch (error) {
    console.error("Failed to start MCP server:", error);
    process.exit(1);
  }

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.error("Shutting down MCP server...");
    await server.stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.error("Shutting down MCP server...");
    await server.stop();
    process.exit(0);
  });
}
