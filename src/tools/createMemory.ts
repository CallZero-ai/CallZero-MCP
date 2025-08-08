import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CallZeroHttpClient } from "../client/httpClient.js";
import { CreateMemoryInputSchema } from "../schemas.js";

export function createMemoryTool(client: CallZeroHttpClient): Tool {
  return {
    name: "create_memory",
    description:
      "Store information about contacts, preferences, or tasks that the AI should remember for future calls.",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          minLength: 1,
          description: "Memory content to store",
        },
        category: {
          type: "string",
          enum: ["contact", "task", "preference", "general"],
          description: "Category of the memory (default: general)",
        },
        relatedPhone: {
          type: "string",
          pattern: "^\\+1[2-9]\\d{9}$",
          description: "Phone number this memory relates to (E.164 format)",
        },
        tags: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Tags for categorization",
        },
        sensitivity: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Sensitivity level of the information (default: medium)",
        },
      },
      required: ["content"],
    } as const,
  };
}

export async function handleCreateMemory(
  client: CallZeroHttpClient,
  args: unknown,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    // Validate input
    const validatedInput = CreateMemoryInputSchema.parse(args);

    // Call HTTP API
    const result = await client.createMemory(validatedInput);

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
              error: `Failed to create memory: ${errorMessage}`,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}
