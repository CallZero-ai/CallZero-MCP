import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CallZeroHttpClient } from "../client/httpClient.js";
import { MakeCallInputSchema, type MakeCallInput } from "../schemas.js";

export function createMakeCallTool(client: CallZeroHttpClient): Tool {
  return {
    name: "make_call",
    description:
      "Make an outbound phone call through CallZero AI assistant. Can schedule calls for future times or initiate immediately.",
    inputSchema: {
      type: "object",
      properties: {
        recipientPhone: {
          type: "string",
          pattern: "^\\+1[2-9]\\d{9}$",
          description:
            "Recipient phone number in E.164 format (e.g., +15551234567)",
        },
        taskDetails: {
          type: "string",
          minLength: 1,
          description: "What the AI should accomplish on the call",
        },
        yourInfo: {
          type: "string",
          description: "Additional context about the caller for the AI",
        },
        scheduledFor: {
          type: "string",
          format: "date-time",
          description:
            "ISO datetime string for scheduling the call (e.g., 2024-01-15T14:30:00Z)",
        },
      },
      required: ["recipientPhone", "taskDetails"],
    } as const,
  };
}

export async function handleMakeCall(
  client: CallZeroHttpClient,
  args: unknown,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    // Validate input
    const validatedInput = MakeCallInputSchema.parse(args);

    // Call HTTP API
    const result = await client.makeCall(validatedInput);

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
              error: `Failed to make call: ${errorMessage}`,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}
