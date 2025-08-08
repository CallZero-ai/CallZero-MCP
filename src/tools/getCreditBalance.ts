import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { CallZeroHttpClient } from "../client/httpClient.js";
import { GetCreditBalanceInputSchema } from "../schemas.js";

export function createGetCreditBalanceTool(client: CallZeroHttpClient): Tool {
  return {
    name: "get_credit_balance",
    description:
      "Get the current credit balance in minutes for making AI phone calls.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    } as const,
  };
}

export async function handleGetCreditBalance(
  client: CallZeroHttpClient,
  args: unknown,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    // Validate input (empty object expected)
    const validatedInput = GetCreditBalanceInputSchema.parse(args || {});

    // Call HTTP API
    const result = await client.getCreditBalance(validatedInput);

    // Format response with helpful context
    const formattedResult = {
      ...result,
      message:
        result.creditMinutes > 0
          ? `You have ${result.creditMinutes} minutes remaining`
          : "No credits remaining. Visit callzero.ai/billing to add more.",
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(formattedResult, null, 2),
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
              error: `Failed to get credit balance: ${errorMessage}`,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}
