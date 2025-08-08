import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CallZeroHttpClient } from "../client/httpClient.js";
import { GetContactMemoriesInputSchema } from "../schemas.js";

export function createGetContactMemoriesTool(client: CallZeroHttpClient): Tool {
  return {
    name: "get_contact_memories",
    description:
      "Get all stored memories related to a specific phone number, including an AI-generated summary of the contact.",
    inputSchema: {
      type: "object",
      properties: {
        phoneNumber: {
          type: "string",
          pattern: "^\\+1[2-9]\\d{9}$",
          description:
            "Phone number to get memories for (E.164 format, e.g., +15551234567)",
        },
        limit: {
          type: "number",
          minimum: 1,
          maximum: 100,
          description: "Maximum number of memories to return (default: 20)",
        },
      },
      required: ["phoneNumber"],
    } as const,
  };
}

export async function handleGetContactMemories(
  client: CallZeroHttpClient,
  args: unknown,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    // Validate input
    const validatedInput = GetContactMemoriesInputSchema.parse(args);

    // Call HTTP API
    const result = await client.getContactMemories(validatedInput);

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
              error: `Failed to get contact memories: ${errorMessage}`,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}
