import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CallZeroHttpClient } from "../client/httpClient.js";
import { ListCallsInputSchema } from "../schemas.js";

export function createListCallsTool(client: CallZeroHttpClient): Tool {
  return {
    name: "list_calls",
    description:
      "List all calls with optional filters for status, date range, and pagination.",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["pending", "in_progress", "completed", "failed", "all"],
          description: "Filter by call status (default: all)",
        },
        limit: {
          type: "number",
          minimum: 1,
          maximum: 100,
          description: "Number of calls to return (default: 20)",
        },
        offset: {
          type: "number",
          minimum: 0,
          description: "Number of calls to skip for pagination (default: 0)",
        },
        startDate: {
          type: "string",
          format: "date-time",
          description: "Filter calls after this date (ISO format)",
        },
        endDate: {
          type: "string",
          format: "date-time",
          description: "Filter calls before this date (ISO format)",
        },
      },
      required: [],
    } as const,
  };
}

export async function handleListCalls(
  client: CallZeroHttpClient,
  args: unknown,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    // Validate input with defaults
    const validatedInput = ListCallsInputSchema.parse(args || {});

    // Call HTTP API
    const result = await client.listCalls(validatedInput);

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
              error: `Failed to list calls: ${errorMessage}`,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}
