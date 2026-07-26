import { z } from "zod";

// Validates joke submission data before it hits the database
// Rejects bad data early with helpful error messages
export const jokeInputSchema = z.object({
  setup: z
    .string()
    .min(5, "Setup must be at least 5 characters")
    .max(500, "Setup must be under 500 characters"),
  punchline: z
    .string()
    .min(2, "Punchline must be at least 2 characters")
    .max(500, "Punchline must be under 500 characters"),
  category: z
    .string()
    .max(50)
    .default("classic")
    .optional(),
  groan_level: z
    .number()
    .int()
    .min(1, "Groan level must be at least 1")
    .max(10, "Groan level must be at most 10")
    .default(5)
    .optional(),
  author: z
    .string()
    .max(100, "Author name must be under 100 characters")
    .default("Anonymous Dad")
    .optional(),
});

export const voteInputSchema = z.object({
  joke_id: z.number().int().positive("Joke ID must be a positive number"),
  vote_type: z.enum(["up", "down"], {
    errorMap: () => ({ message: "Vote type must be 'up' or 'down'" }),
  }),
});

export type JokeInput = z.infer<typeof jokeInputSchema>;
export type VoteInput = z.infer<typeof voteInputSchema>;
