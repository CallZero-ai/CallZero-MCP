import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CallZeroHttpClient } from "../client/httpClient.js";
import { GetCallStatusInputSchema } from "../schemas.js";

export function createGetCallStatusTool(client: CallZeroHttpClient): Tool {
  return {
    name: "get_call_status",
    description:
      "Get the current status and basic information of a phone call by its ID.",
    inputSchema: {
      type: "object",
      properties: {
        callId: {
          type: "string",
          description: "ID of the call to get status for",
        },
      },
      required: ["callId"],
    } as const,
  };
}

export async function handleGetCallStatus(
  client: CallZeroHttpClient,
  args: unknown,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    // Validate input
    const validatedInput = GetCallStatusInputSchema.parse(args);

    // Call HTTP API
    const result = await client.getCallStatus(validatedInput);

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
              error: `Failed to get call status: ${errorMessage}`,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}
