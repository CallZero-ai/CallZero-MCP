import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CallZeroHttpClient } from "../client/httpClient.js";
import { CancelCallInputSchema } from "../schemas.js";

export function createCancelCallTool(client: CallZeroHttpClient): Tool {
  return {
    name: "cancel_call",
    description:
      "Cancel a scheduled call before it starts. Only works for calls that haven't started yet.",
    inputSchema: {
      type: "object",
      properties: {
        callId: {
          type: "string",
          description: "ID of the scheduled call to cancel",
        },
      },
      required: ["callId"],
    } as const,
  };
}

export async function handleCancelCall(
  client: CallZeroHttpClient,
  args: unknown,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    // Validate input
    const validatedInput = CancelCallInputSchema.parse(args);

    // Call HTTP API
    const result = await client.cancelCall(validatedInput);

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
              error: `Failed to cancel call: ${errorMessage}`,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}
