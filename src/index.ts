#!/usr/bin/env node

import { startMcpServer } from "./server.js";

// Main entry point - start the MCP server
startMcpServer().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
