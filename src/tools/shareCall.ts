import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CallZeroHttpClient } from "../client/httpClient.js";
import { ShareCallInputSchema } from "../schemas.js";

export function createShareCallTool(client: CallZeroHttpClient): Tool {
  return {
    name: "share_call",
    description:
      "Generate a shareable link for a call transcript that others can view without authentication.",
    inputSchema: {
      type: "object",
      properties: {
        callId: {
          type: "string",
          description: "ID of the call to share",
        },
        expiresInDays: {
          type: "number",
          minimum: 1,
          maximum: 30,
          description:
            "Number of days before the share link expires (default: 7)",
        },
      },
      required: ["callId"],
    } as const,
  };
}

export async function handleShareCall(
  client: CallZeroHttpClient,
  args: unknown,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    // Validate input
    const validatedInput = ShareCallInputSchema.parse(args);

    // Call HTTP API
    const result = await client.shareCall(validatedInput);

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
              error: `Failed to share call: ${errorMessage}`,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}
