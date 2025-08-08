# @callzero/mcp

MCP (Model Context Protocol) server for CallZero AI phone call automation. This package allows MCP clients like Claude Desktop, ChatGPT, and other AI assistants to make phone calls through the CallZero service.

## Features

- **10 Comprehensive Tools**: Core calling, management, and memory capabilities
- **HTTP Transport**: Calls CallZero production APIs securely
- **Standard MCP Protocol**: Works with any MCP client
- **Simple Setup**: Just requires an API key
- **Memory System**: Store and retrieve context about contacts and preferences
- **Call Management**: List, cancel, and share calls easily

## Quick Start

### Installation

```bash
# Install globally
npm install -g @callzero/mcp

# Or use with npx (no installation needed)
npx @callzero/mcp
```

### Configuration

#### 1. Get API Key

Visit [callzero.ai](https://callzero.ai) to generate an API key from your account settings.

#### 2. Configure MCP Client

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "callzero": {
      "command": "callzero-mcp",
      "env": {
        "CALLZERO_API_KEY": "callzero_your_api_key_here"
      }
    }
  }
}
```

Or with npx:

```json
{
  "mcpServers": {
    "callzero": {
      "command": "npx",
      "args": ["@callzero/mcp"],
      "env": {
        "CALLZERO_API_KEY": "callzero_your_api_key_here"
      }
    }
  }
}
```

## Available Tools

### Core Tools

#### make_call

Make an AI-powered phone call (immediate or scheduled).

**Parameters:**

- `recipientPhone` (required): Phone number in E.164 format (e.g., "+15551234567")
- `taskDetails` (required): What the AI should accomplish on the call
- `yourInfo` (optional): Additional context about the caller
- `scheduledFor` (optional): ISO datetime for scheduling (e.g., "2024-01-15T14:30:00Z")

#### get_call_status

Get the current status and basic information about a call.

**Parameters:**

- `callId` (required): ID of the call to check

**Returns:**

- Call status (pending, in_progress, completed, failed)
- Start/end times, duration, recipient phone, summary

#### get_call_transcript

Get the full transcript and detailed information about a completed call.

**Parameters:**

- `callId` (required): ID of the call to get transcript for

**Returns:**

- Complete conversation transcript with timestamps
- Call metadata and summary

### Management Tools

#### cancel_call

Cancel a scheduled call before it starts.

**Parameters:**

- `callId` (required): ID of the scheduled call to cancel

#### list_calls

List all calls with optional filters for status, date range, and pagination.

**Parameters:**

- `status` (optional): Filter by status (pending, in_progress, completed, failed, all)
- `limit` (optional): Number of results (1-100, default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `startDate` (optional): Filter calls after this date (ISO format)
- `endDate` (optional): Filter calls before this date (ISO format)

#### get_credit_balance

Get the current credit balance in minutes for making AI phone calls.

**Returns:**

- `creditMinutes`: Remaining minutes
- `planType`: Current subscription plan
- `nextRefillDate`: When credits will refresh

#### share_call

Generate a shareable link for a call transcript.

**Parameters:**

- `callId` (required): ID of the call to share
- `expiresInDays` (optional): Days before link expires (1-30, default: 7)

**Returns:**

- `shareUrl`: Public URL to view transcript
- `expiresAt`: When the link expires

### Template Tools

#### search_form_templates

Search for public form templates that match your query. Returns templates with pre-filled task details and may include phone numbers for known companies.

**Parameters:**

- `query` (required): Search query to find matching templates (e.g., "xfinity bill", "cancel att")
- `limit` (optional): Maximum number of results (1-20, default: 5)

**Returns:**

- `templates`: Array of matching templates with:
  - `id`: Template identifier
  - `title`: Template name
  - `description`: Brief description
  - `taskDetails`: Pre-filled task script
  - `recipientPhone`: Phone number (if extracted)
  - `similarityScore`: Match relevance (0-1)
  - `usageCount`: How many times used
- `total`: Total number of matches found
- `query`: The search query used

**Example Use Case:**
When a user says "I want to call Xfinity to lower my bill", search for templates first. If found, use the template's `taskDetails` and `recipientPhone` to make the call immediately.

### Memory Tools

#### create_memory

Store information about contacts, preferences, or tasks that the AI should remember.

**Parameters:**

- `content` (required): Memory content to store
- `category` (optional): Type of memory (contact, task, preference, general)
- `relatedPhone` (optional): Associated phone number
- `tags` (optional): Array of tags for categorization
- `sensitivity` (optional): Security level (low, medium, high)

#### search_memories

Search stored memories by query, category, or phone number.

**Parameters:**

- `query` (required): Search query
- `category` (optional): Filter by category
- `relatedPhone` (optional): Filter by phone number
- `limit` (optional): Max results (1-50, default: 10)

#### get_contact_memories

Get all memories related to a specific phone number.

**Parameters:**

- `phoneNumber` (required): Phone number in E.164 format
- `limit` (optional): Max results (1-100, default: 20)

**Returns:**

- All memories for the contact
- AI-generated summary of the relationship

## Configuration Options

### Environment Variables

- `CALLZERO_API_KEY` (required): Your CallZero API key
- `CALLZERO_API_URL` (optional): Override API base URL for development

### Development/Testing

For local development or testing against a local instance:

```bash
export CALLZERO_API_KEY="callzero_your_key"
export CALLZERO_API_URL="http://localhost:3000"
callzero-mcp
```

## Architecture

This MCP server acts as a transport layer between MCP clients and CallZero HTTP APIs:

```
MCP Client (Claude, ChatGPT, etc.)
    ↓ MCP Protocol
@callzero/mcp (this package)
    ↓ HTTPS Requests
callzero.ai/api/tools/*
    ↓ Business Logic
CallZero Backend → AI Phone Calls
```

## Security Features

- **Rate Limiting**: 50 requests per minute to prevent abuse
- **URL Validation**: HTTPS required for production, HTTP only for localhost
- **API Key Format**: Must start with `callzero_` prefix
- **No Sensitive Data**: Error messages don't expose internal details
- **Domain Warnings**: Alerts when using non-standard API domains

## Testing with MCP Inspector

The official MCP Inspector tool can be used to test all CallZero tools interactively:

```bash
# Install MCP Inspector
npm install -g @modelcontextprotocol/inspector

# Run Inspector with CallZero
npx @modelcontextprotocol/inspector \
  node dist/index.js \
  --env CALLZERO_API_KEY=callzero_your_api_key
```

Then open http://localhost:5173 in your browser to test all tools with a visual UI.

See `MCP_INSPECTOR_GUIDE.md` for detailed testing instructions.

## Error Handling

The server provides clear error messages for common issues:

- **Invalid API Key**: "Invalid API key format. Must start with 'callzero\_'"
- **Missing API Key**: "CALLZERO_API_KEY environment variable is required"
- **Rate Limit**: "Rate limit exceeded. Please wait before making more requests"
- **Insecure URL**: "Insecure HTTP is only allowed for localhost"
- **HTTP Errors**: Detailed error messages from the CallZero API
- **Validation Errors**: Clear field-level validation messages

## Troubleshooting

### "CALLZERO_API_KEY environment variable is required"

Set your API key in the environment:

```bash
export CALLZERO_API_KEY="callzero_your_api_key_here"
```

### "Invalid API key format"

Ensure your API key starts with `callzero_`. Get a valid key from [callzero.ai](https://callzero.ai).

### "HTTP 401: Unauthorized"

Your API key may be invalid or inactive. Generate a new key from your CallZero account.

### "HTTP 429: Rate limit exceeded"

You've hit the rate limit (50 calls per 24 hours). Wait or upgrade your plan.

## Rate Limits

- **MCP API**: 50 calls per 24 hours per API key
- **Credit System**: Calls deduct from your CallZero credit balance
- **Phone Number Format**: US numbers only (E.164 format)

## Security

- API keys are transmitted securely via HTTPS
- No sensitive data is stored locally
- All calls are logged for audit purposes
- Access control enforced by CallZero backend

## Contributing

This package is part of the CallZero project. For issues or contributions:

1. **Issues**: [GitHub Issues](https://github.com/callzero/callzero/issues)
2. **Documentation**: [callzero.ai/docs](https://callzero.ai/docs)
3. **Support**: Contact support through the CallZero website

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

### 2.0.0

- Added 7 new tools for comprehensive call management
- **Management Tools**: `cancel_call`, `list_calls`, `get_credit_balance`, `share_call`
- **Memory System**: `create_memory`, `search_memories`, `get_contact_memories`
- Improved error handling with actionable messages
- Enhanced API key validation with prefix checking

### 1.0.0

- Initial release
- Support for `make_call`, `get_call_status`, `get_call_transcript` tools
- HTTP transport to CallZero production APIs
- Standard MCP protocol implementation
