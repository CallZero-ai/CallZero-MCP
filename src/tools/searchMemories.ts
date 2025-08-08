import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CallZeroHttpClient } from "../client/httpClient.js";
import { SearchMemoriesInputSchema } from "../schemas.js";

export function createSearchMemoriesTool(client: CallZeroHttpClient): Tool {
  return {
    name: "search_memories",
    description:
      "Search stored memories by query, category, or related phone number to retrieve context for calls.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query to find relevant memories",
        },
        category: {
          type: "string",
          enum: ["contact", "task", "preference", "general"],
          description: "Filter by memory category",
        },
        relatedPhone: {
          type: "string",
          pattern: "^\\+1[2-9]\\d{9}$",
          description: "Filter by related phone number (E.164 format)",
        },
        limit: {
          type: "number",
          minimum: 1,
          maximum: 50,
          description: "Maximum number of results to return (default: 10)",
        },
      },
      required: ["query"],
    } as const,
  };
}

export async function handleSearchMemories(
  client: CallZeroHttpClient,
  args: unknown,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    // Validate input
    const validatedInput = SearchMemoriesInputSchema.parse(args);

    // Call HTTP API
    const result = await client.searchMemories(validatedInput);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: `Failed to search memories: ${errorMessage}`,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}
