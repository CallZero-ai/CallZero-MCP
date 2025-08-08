import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CallZeroHttpClient } from "../client/httpClient.js";
import { GetCallTranscriptInputSchema } from "../schemas.js";

export function createGetCallTranscriptTool(client: CallZeroHttpClient): Tool {
  return {
    name: "get_call_transcript",
    description:
      "Get the full transcript and detailed information of a completed phone call by its ID.",
    inputSchema: {
      type: "object",
      properties: {
        callId: {
          type: "string",
          description: "ID of the call to get transcript for",
        },
      },
      required: ["callId"],
    } as const,
  };
}

export async function handleGetCallTranscript(
  client: CallZeroHttpClient,
  args: unknown,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    // Validate input
    const validatedInput = GetCallTranscriptInputSchema.parse(args);

    // Call HTTP API
    const result = await client.getCallTranscript(validatedInput);

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
              error: `Failed to get call transcript: ${errorMessage}`,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}
