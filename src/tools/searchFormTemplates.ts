import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CallZeroHttpClient } from "../client/httpClient.js";
import { z } from "zod";

// Schema definitions
export const SearchFormTemplatesInputSchema = z.object({
  query: z.string().min(1).describe("Search query to find matching form templates"),
  limit: z.number().min(1).max(20).default(5).optional().describe("Maximum number of results to return"),
});

export type SearchFormTemplatesInput = z.infer<typeof SearchFormTemplatesInputSchema>;

export function createSearchFormTemplatesTool(client: CallZeroHttpClient): Tool {
  return {
    name: "search_form_templates",
    description:
      "Search for public form templates that match the query. Returns templates with pre-filled task details and may include extracted phone numbers for known companies. Use this before making calls to leverage existing templates.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query to find matching form templates (e.g., 'xfinity bill', 'cancel att')",
          minLength: 1,
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return",
          minimum: 1,
          maximum: 20,
          default: 5,
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  };
}

export async function searchFormTemplates(
  input: unknown,
  client: CallZeroHttpClient
) {
  try {
    const validation = SearchFormTemplatesInputSchema.safeParse(input);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error.message}`);
    }

    const response = await client.searchFormTemplates(validation.data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error("[MCP searchFormTemplates] Error:", error);
    throw error;
  }
}