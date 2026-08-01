import { z } from "zod";

export const TargetDemographicsSchema = z.enum([
  "SC",
  "ST",
  "OBC",
  "General",
  "Women",
]);

export type TargetDemographic = z.infer<
  typeof TargetDemographicsSchema
>;

const optionalNonNegativeNumber = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === "string") {
      const normalized = Number(value.replace(/[^0-9.-]/g, ""));
      return Number.isFinite(normalized) ? normalized : value;
    }

    return value;
  },
  z.number().finite().nonnegative().optional(),
);

export const ScholarshipSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(10000),
  provider: z.string().trim().min(1).max(180),
  amount_inr: optionalNonNegativeNumber,
  target_demographics: z
    .array(TargetDemographicsSchema)
    .max(10),
  financial_criteria: z
    .object({
      max_family_income_inr: optionalNonNegativeNumber,
    })
    .optional(),
  academic_criteria: z
    .object({
      min_cgpa: z.number().min(0).max(10).optional(),
      eligible_courses: z
        .array(z.string().trim().min(1).max(120))
        .max(100)
        .optional(),
    })
    .optional(),
  deadline: z.coerce.date().optional(),
  link: z.string().url().optional(),
  created_at: z.coerce.date().default(() => new Date()),
  updated_at: z.coerce.date().default(() => new Date()),
});

export type Scholarship = z.infer<
  typeof ScholarshipSchema
>;

export const AIEvaluationResponseSchema = z.object({
  is_eligible: z.boolean(),
  missing_requirements: z.array(z.string()),
  confidence_score: z.number().min(0).max(100),
});

export type AIEvaluationResponse = z.infer<
  typeof AIEvaluationResponseSchema
>;
