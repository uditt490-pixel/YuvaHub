import { z } from "zod";

export const TeamMemberSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string().optional(),
  role: z.string(),
  joinedAt: z.union([z.string(), z.date()]).default(() => new Date().toISOString()),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;

export const TeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  opportunityId: z.string().optional(),
  opportunityTitle: z.string().optional(),
  description: z.string().min(5, "Description must be at least 5 characters"),
  requiredRoles: z.array(z.string()).min(1, "At least one required role/skill must be specified"),
  maxMembers: z.number().int().min(2, "Minimum team size is 2").max(20, "Maximum team size is 20").default(4),
  leaderUid: z.string(),
  leaderName: z.string(),
  members: z.array(TeamMemberSchema).default([]),
  status: z.enum(["open", "closed"]).default("open"),
  createdAt: z.union([z.string(), z.date()]).default(() => new Date().toISOString()),
  updatedAt: z.union([z.string(), z.date()]).default(() => new Date().toISOString()),
});

export type Team = z.infer<typeof TeamSchema> & { _id?: string; id?: string };

export const CreateTeamInputSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  opportunityId: z.string().optional(),
  opportunityTitle: z.string().optional(),
  description: z.string().min(5, "Description must be at least 5 characters"),
  requiredRoles: z.array(z.string()).min(1, "At least one required role/skill must be specified"),
  maxMembers: z.number().int().min(2).max(20).default(4),
});

export type CreateTeamInput = z.infer<typeof CreateTeamInputSchema>;

export const JoinRequestSchema = z.object({
  teamId: z.string(),
  applicantUid: z.string(),
  applicantName: z.string(),
  applicantEmail: z.string().optional(),
  role: z.string().min(1, "Role/skill preference is required"),
  message: z.string().optional(),
  status: z.enum(["pending", "accepted", "rejected"]).default("pending"),
  createdAt: z.union([z.string(), z.date()]).default(() => new Date().toISOString()),
  updatedAt: z.union([z.string(), z.date()]).default(() => new Date().toISOString()),
});

export type JoinRequest = z.infer<typeof JoinRequestSchema> & { _id?: string; id?: string };

export const CreateJoinRequestInputSchema = z.object({
  role: z.string().min(1, "Role/skill preference is required"),
  message: z.string().optional(),
});

export type CreateJoinRequestInput = z.infer<typeof CreateJoinRequestInputSchema>;

export const RespondJoinRequestInputSchema = z.object({
  action: z.enum(["accept", "reject"]),
});

export type RespondJoinRequestInput = z.infer<typeof RespondJoinRequestInputSchema>;
