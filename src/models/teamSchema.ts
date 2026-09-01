import { z } from "zod";

const SkillSchema = z.string().trim().min(1).max(60);

export const TeamMemberSchema = z.object({
  uid: z.string().trim().min(1).max(160),
  name: z.string().trim().min(1).max(120),
  email: z.string().email().optional(),
  role: z.string().trim().min(1).max(80),
  skills: z.array(SkillSchema).max(20).default([]),
  joinedAt: z.coerce.date().default(() => new Date()),
});

export type TeamMember = z.infer<
  typeof TeamMemberSchema
>;

export const TeamSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Team name must be at least 2 characters")
      .max(120),
    opportunityId: z.string().trim().max(160).optional(),
    opportunityTitle: z.string().trim().max(180).optional(),
    description: z
      .string()
      .trim()
      .min(5, "Description must be at least 5 characters")
      .max(5000),
    requiredRoles: z
      .array(SkillSchema)
      .min(1, "At least one required role/skill must be specified")
      .max(20),
    skills: z.array(SkillSchema).max(30).default([]),
    maxMembers: z
      .number()
      .int()
      .min(2, "Minimum team size is 2")
      .max(20, "Maximum team size is 20")
      .default(4),
    leaderUid: z.string().trim().min(1).max(160),
    leaderName: z.string().trim().min(1).max(120),
    members: z.array(TeamMemberSchema).max(20).default([]),
    openRoles: z.array(SkillSchema).max(10).default([]),
    status: z.enum(["open", "closed"]).default("open"),
    createdAt: z.coerce.date().default(() => new Date()),
    updatedAt: z.coerce.date().default(() => new Date()),
  })
  .superRefine((team, context) => {
    if (team.members.length > team.maxMembers) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["members"],
        message: "Members cannot exceed maxMembers.",
      });
    }
  });

export type Team = z.infer<typeof TeamSchema> & {
  _id?: string;
  id?: string;
};

export const CreateTeamInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  opportunityId: z.string().trim().max(160).optional(),
  opportunityTitle: z.string().trim().max(180).optional(),
  description: z.string().trim().min(5).max(5000),
  requiredRoles: z.array(SkillSchema).min(1).max(20),
  skills: z.array(SkillSchema).max(30).default([]),
  maxMembers: z.number().int().min(2).max(20).default(4),
  openRoles: z.array(SkillSchema).max(10).default([]),
});

export type CreateTeamInput = z.infer<
  typeof CreateTeamInputSchema
>;

export const JoinRequestSchema = z.object({
  teamId: z.string().trim().min(1),
  applicantUid: z.string().trim().min(1),
  applicantName: z.string().trim().min(1).max(120),
  applicantEmail: z.string().email().optional(),
  role: z.string().trim().min(1).max(80),
  message: z.string().trim().max(1000).optional(),
  status: z
    .enum(["pending", "accepted", "rejected"])
    .default("pending"),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

export type JoinRequest = z.infer<
  typeof JoinRequestSchema
> & { _id?: string; id?: string };

export const CreateJoinRequestInputSchema = z.object({
  role: z.string().trim().min(1).max(80),
  message: z.string().trim().max(1000).optional(),
});

export type CreateJoinRequestInput = z.infer<
  typeof CreateJoinRequestInputSchema
>;

export const RespondJoinRequestInputSchema = z.object({
  action: z.enum(["accept", "reject"]),
});

export type RespondJoinRequestInput = z.infer<
  typeof RespondJoinRequestInputSchema
>;
