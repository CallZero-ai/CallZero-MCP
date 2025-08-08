import { z } from "zod";

// ===== Input Schemas =====

export const MakeCallInputSchema = z.object({
  recipientPhone: z
    .string()
    .regex(/^\+1[2-9]\d{9}$/, {
      message:
        "Phone number must be a valid US number in E.164 format (e.g., +15551234567)",
    })
    .describe("Recipient phone number in E.164 format"),
  taskDetails: z
    .string()
    .min(1, "Task details are required")
    .describe("What the AI should accomplish on the call"),
  yourInfo: z
    .string()
    .optional()
    .describe("Additional context about the caller for the AI"),
  scheduledFor: z
    .string()
    .datetime()
    .optional()
    .describe(
      "ISO datetime string for scheduling the call (e.g., '2024-01-15T14:30:00Z')",
    ),
});

export const GetCallStatusInputSchema = z.object({
  callId: z.string().describe("ID of the call to get status for"),
});

export const GetCallTranscriptInputSchema = z.object({
  callId: z.string().describe("ID of the call to get transcript for"),
});

// ===== Output Schemas =====

export const MakeCallOutputSchema = z.object({
  success: z.boolean(),
  status: z.enum(["initiated", "scheduled"]),
  message: z.string(),
  callId: z.string(),
  scheduledFor: z.string().optional(),
});

export const GetCallStatusOutputSchema = z.object({
  callId: z.string(),
  status: z.enum(["pending", "in_progress", "completed", "failed"]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.number().optional().describe("Duration in seconds"),
  isComplete: z.boolean(),
  recipientPhone: z.string(),
  summary: z.string().optional(),
});

export const TranscriptMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
  timestamp: z.string(),
});

export const GetCallTranscriptOutputSchema = z.object({
  callId: z.string(),
  status: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  summary: z.string().optional(),
  recipientPhone: z.string(),
  taskDetails: z.string(),
  transcript: z.array(TranscriptMessageSchema),
  metadata: z.object({
    vapiCallId: z.string().optional(),
    totalMessages: z.number(),
  }),
});

// ===== Type Exports =====

export type MakeCallInput = z.infer<typeof MakeCallInputSchema>;
export type MakeCallOutput = z.infer<typeof MakeCallOutputSchema>;
export type GetCallStatusInput = z.infer<typeof GetCallStatusInputSchema>;
export type GetCallStatusOutput = z.infer<typeof GetCallStatusOutputSchema>;
export type GetCallTranscriptInput = z.infer<
  typeof GetCallTranscriptInputSchema
>;
export type GetCallTranscriptOutput = z.infer<
  typeof GetCallTranscriptOutputSchema
>;
export type TranscriptMessage = z.infer<typeof TranscriptMessageSchema>;

// ===== Priority 1 Tool Schemas =====

// Cancel Scheduled Call
export const CancelCallInputSchema = z.object({
  callId: z.string().describe("ID of the scheduled call to cancel"),
});

export const CancelCallOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  callId: z.string(),
});

// List Calls
export const ListCallsInputSchema = z.object({
  status: z
    .enum(["pending", "in_progress", "completed", "failed", "all"])
    .optional()
    .default("all")
    .describe("Filter by call status"),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
  startDate: z.string().datetime().optional().describe("Filter by start date"),
  endDate: z.string().datetime().optional().describe("Filter by end date"),
});

export const CallSummarySchema = z.object({
  callId: z.string(),
  status: z.enum(["pending", "in_progress", "completed", "failed"]),
  recipientPhone: z.string(),
  taskDetails: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  summary: z.string().optional(),
});

export const ListCallsOutputSchema = z.object({
  calls: z.array(CallSummarySchema),
  total: z.number(),
  hasMore: z.boolean(),
});

// Get Credit Balance
export const GetCreditBalanceInputSchema = z.object({});

export const GetCreditBalanceOutputSchema = z.object({
  creditMinutes: z.number().describe("Remaining credit minutes"),
  planType: z.string().optional(),
  nextRefillDate: z.string().datetime().optional(),
});

// Share Call
export const ShareCallInputSchema = z.object({
  callId: z.string().describe("ID of the call to share"),
  expiresInDays: z
    .number()
    .min(1)
    .max(30)
    .optional()
    .default(7)
    .describe("Number of days before the share link expires"),
});

export const ShareCallOutputSchema = z.object({
  shareUrl: z.string().url(),
  expiresAt: z.string().datetime(),
  callId: z.string(),
});

// ===== Priority 2 Tool Schemas (Memory) =====

// Create Memory
export const CreateMemoryInputSchema = z.object({
  content: z.string().min(1).describe("Memory content to store"),
  category: z
    .enum(["contact", "task", "preference", "general"])
    .optional()
    .default("general"),
  relatedPhone: z
    .string()
    .regex(/^\+1[2-9]\d{9}$/)
    .optional()
    .describe("Phone number this memory relates to"),
  tags: z.array(z.string()).optional().describe("Tags for categorization"),
  sensitivity: z.enum(["low", "medium", "high"]).optional().default("medium"),
});

export const MemorySchema = z.object({
  id: z.string(),
  content: z.string(),
  category: z.string(),
  relatedPhone: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sensitivity: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateMemoryOutputSchema = z.object({
  success: z.boolean(),
  memory: MemorySchema,
});

// Search Memories
export const SearchMemoriesInputSchema = z.object({
  query: z.string().describe("Search query"),
  category: z
    .enum(["contact", "task", "preference", "general"])
    .optional()
    .describe("Filter by category"),
  relatedPhone: z
    .string()
    .regex(/^\+1[2-9]\d{9}$/)
    .optional()
    .describe("Filter by related phone number"),
  limit: z.number().min(1).max(50).optional().default(10),
});

export const SearchMemoriesOutputSchema = z.object({
  memories: z.array(MemorySchema),
  total: z.number(),
});

// Get Contact Memories
export const GetContactMemoriesInputSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+1[2-9]\d{9}$/)
    .describe("Phone number to get memories for"),
  limit: z.number().min(1).max(100).optional().default(20),
});

export const GetContactMemoriesOutputSchema = z.object({
  phoneNumber: z.string(),
  memories: z.array(MemorySchema),
  total: z.number(),
  summary: z
    .string()
    .optional()
    .describe("AI-generated summary of the contact"),
});

// ===== Priority 1 Type Exports =====
export type CancelCallInput = z.infer<typeof CancelCallInputSchema>;
export type CancelCallOutput = z.infer<typeof CancelCallOutputSchema>;
export type ListCallsInput = z.infer<typeof ListCallsInputSchema>;
export type ListCallsOutput = z.infer<typeof ListCallsOutputSchema>;
export type GetCreditBalanceInput = z.infer<typeof GetCreditBalanceInputSchema>;
export type GetCreditBalanceOutput = z.infer<
  typeof GetCreditBalanceOutputSchema
>;
export type ShareCallInput = z.infer<typeof ShareCallInputSchema>;
export type ShareCallOutput = z.infer<typeof ShareCallOutputSchema>;

// ===== Priority 2 Type Exports =====
export type CreateMemoryInput = z.infer<typeof CreateMemoryInputSchema>;
export type CreateMemoryOutput = z.infer<typeof CreateMemoryOutputSchema>;
export type SearchMemoriesInput = z.infer<typeof SearchMemoriesInputSchema>;
export type SearchMemoriesOutput = z.infer<typeof SearchMemoriesOutputSchema>;
export type GetContactMemoriesInput = z.infer<
  typeof GetContactMemoriesInputSchema
>;
export type GetContactMemoriesOutput = z.infer<
  typeof GetContactMemoriesOutputSchema
>;
export type Memory = z.infer<typeof MemorySchema>;
