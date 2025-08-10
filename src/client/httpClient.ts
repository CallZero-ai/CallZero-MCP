import fetch from "node-fetch";
import type {
  MakeCallInput,
  MakeCallOutput,
  GetCallStatusInput,
  GetCallStatusOutput,
  GetCallTranscriptInput,
  GetCallTranscriptOutput,
  CancelCallInput,
  CancelCallOutput,
  ListCallsInput,
  ListCallsOutput,
  GetCreditBalanceInput,
  GetCreditBalanceOutput,
  ShareCallInput,
  ShareCallOutput,
  CreateMemoryInput,
  CreateMemoryOutput,
  SearchMemoriesInput,
  SearchMemoriesOutput,
  GetContactMemoriesInput,
  GetContactMemoriesOutput,
} from "../schemas.js";

export class CallZeroHttpClient {
  private apiKey: string;
  private baseUrl: string;
  private requestCount = 0;
  private requestTimestamps: number[] = [];
  private readonly maxRequestsPerMinute = 50;

  constructor(apiKey: string, baseUrl: string = "https://callzero.ai") {
    this.apiKey = apiKey;
    this.baseUrl = this.validateAndNormalizeUrl(baseUrl);
  }

  private validateAndNormalizeUrl(url: string): string {
    // Remove trailing slash
    url = url.replace(/\/$/, "");
    
    try {
      const parsed = new URL(url);
      
      // Smart production detection:
      // - If using default URL (callzero.ai), it's production
      // - If URL is explicitly overridden, check if it's a local dev URL
      const isDefaultUrl = url === "https://callzero.ai";
      const isLocalDev = ['localhost', '127.0.0.1', '0.0.0.0'].some(
        host => parsed.hostname === host || parsed.hostname.includes(host)
      );
      
      // Only allow HTTP for localhost/development
      if (parsed.protocol === 'http:' && !isLocalDev) {
        throw new Error(
          'Insecure HTTP is only allowed for localhost. Use HTTPS for production URLs.'
        );
      }
      
      // Warn about non-standard domains (but still allow them for flexibility)
      const trustedDomains = ['callzero.ai', 'localhost', '127.0.0.1'];
      if (!trustedDomains.some(domain => parsed.hostname.includes(domain))) {
        console.warn(`⚠️  Warning: Using non-standard API domain: ${parsed.hostname}`);
        console.warn(`   Make sure this is intentional and the domain is trusted.`);
      }
      
      // Log when using override URL (helpful for debugging)
      if (!isDefaultUrl && process.env.CALLZERO_API_URL) {
        console.error(`🔧 Using custom API URL: ${parsed.hostname}`);
      }
      
      return url;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Insecure HTTP')) {
        throw error;
      }
      throw new Error(`Invalid API URL: ${url}`);
    }
  }

  private checkRateLimit(): void {
    const now = Date.now();
    // Remove timestamps older than 1 minute
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < 60000
    );
    
    if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }
    
    this.requestTimestamps.push(now);
    this.requestCount++;
  }

  private async request<T>(endpoint: string, data: unknown): Promise<T> {
    // Check rate limit before making request
    this.checkRateLimit();
    
    const url = `${this.baseUrl}/api/tools/${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "@callzero/mcp-server/0.0.1",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = (await response.json()) as {
          error?: string;
          details?: unknown;
        };
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If we can't parse error response, use default message
      }

      throw new Error(errorMessage);
    }

    const result = (await response.json()) as T;
    return result;
  }

  async makeCall(input: MakeCallInput): Promise<MakeCallOutput> {
    return this.request<MakeCallOutput>("make-call", input);
  }

  async getCallStatus(input: GetCallStatusInput): Promise<GetCallStatusOutput> {
    return this.request<GetCallStatusOutput>("get-call-status", input);
  }

  async getCallTranscript(
    input: GetCallTranscriptInput,
  ): Promise<GetCallTranscriptOutput> {
    return this.request<GetCallTranscriptOutput>("get-call-transcript", input);
  }

  // ===== Priority 1 Tools =====

  async cancelCall(input: CancelCallInput): Promise<CancelCallOutput> {
    return this.request<CancelCallOutput>("cancel-call", input);
  }

  async listCalls(input: ListCallsInput): Promise<ListCallsOutput> {
    return this.request<ListCallsOutput>("list-calls", input);
  }

  async getCreditBalance(
    input: GetCreditBalanceInput,
  ): Promise<GetCreditBalanceOutput> {
    return this.request<GetCreditBalanceOutput>("get-credit-balance", input);
  }

  async shareCall(input: ShareCallInput): Promise<ShareCallOutput> {
    return this.request<ShareCallOutput>("share-call", input);
  }

  // ===== Priority 2 Tools (Memory) =====

  async createMemory(input: CreateMemoryInput): Promise<CreateMemoryOutput> {
    return this.request<CreateMemoryOutput>("create-memory", input);
  }

  async searchMemories(
    input: SearchMemoriesInput,
  ): Promise<SearchMemoriesOutput> {
    return this.request<SearchMemoriesOutput>("search-memories", input);
  }

  async getContactMemories(
    input: GetContactMemoriesInput,
  ): Promise<GetContactMemoriesOutput> {
    return this.request<GetContactMemoriesOutput>(
      "get-contact-memories",
      input,
    );
  }

  // ===== Form Templates =====

  async searchFormTemplates(input: { query: string; limit?: number }) {
    return this.request("search-form-templates", input);
  }
}
