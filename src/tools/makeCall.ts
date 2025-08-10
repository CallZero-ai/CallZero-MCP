import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CallZeroHttpClient } from "../client/httpClient.js";
import { MakeCallInputSchema, type MakeCallInput } from "../schemas.js";

export function createMakeCallTool(client: CallZeroHttpClient): Tool {
  return {
    name: "make_call",
    description: `Initiates or schedules phone calls by spawning a new AI agent that will conduct the conversation independently.

      The calling agent operates autonomously with these capabilities:
      • get_additional_info: Requests missing information from the principal via SMS when businesses ask for details not in the agent's context
      • forward_to_principal: Transfers the active call to the principal's phone number for direct conversation
      • Navigation: Handles phone trees, voicemail systems, and basic business interactions

      SCHEDULING: Pass natural language date/time directly to scheduleAt parameter. Users can say "tomorrow at 2pm", "next Tuesday", "in 3 hours", "this Friday morning" - all times are interpreted in the user's timezone automatically.

      IMPORTANT: The calling agent has NO access to this conversation context, so all instructions must be complete and self-contained. The agent can forward calls back to the principal when requested (e.g., "when you get to a real person, forward it back to me" or "skip the phone tree and transfer me to a human").`,
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
    const url = `${process.env.CALLZERO_API_URL}/call-status/${result.callId}`;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              ...result,
              url,
            },
            null,
            2,
          ),
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
