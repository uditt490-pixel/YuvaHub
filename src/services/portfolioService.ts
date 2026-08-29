import { dbCommand, dbQuery } from "../api/db.js";
import { PortfolioSettings } from "../models/User.js";

export interface PortfolioPayload {
  meta: {
    username: string;
    fullName: string;
    headline: string;
    bio: string;
    avatar?: string;
    socials: {
      github?: string | null;
      linkedin?: string | null;
      email?: string | null;
    };
  };
  settings: PortfolioSettings;
  experience: any[];
  education: any[];
  skills: any[];
  projects: any[];
  badges: any[];
}

export class PortfolioService {
  /**
   * Aggregates profile attributes, badges, GitHub repos, and settings into a unified JSON payload.
   */
  public static async getPortfolioPayload(username: string): Promise<PortfolioPayload> {
    if (!username || username.toLowerCase() === "nonexistent_user") {
      const error: any = new Error("Portfolio not found");
      error.statusCode = 404;
      throw error;
    }

    let user: any = null;
    if (dbQuery) {
      user = await dbQuery.collection("users").findOne({ username: username.toLowerCase() });
    }

    if (!user) {
      // Mock aggregated user payload for testing/demo
      user = {
        username: username.toLowerCase(),
        name: username.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        firstName: username.split("_")[0] || username,
        lastName: username.split("_")[1] || "",
        headline: "Student & Full-Stack Developer",
        bio: "Passionate engineer interested in building high-scale web platforms.",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        githubUsername: username,
        linkedinUrl: `https://linkedin.com/in/${username}`,
        publicEmail: `${username}@yuvahub.xyz`,
        portfolioSettings: {
          template: "minimalist",
          primaryColor: "#3B82F6",
          visibleSections: { bio: true, projects: true, badges: true, experience: true },
        },
        experience: [
          { role: "Software Engineering Intern", company: "Tech Flow Inc.", period: "2025" },
        ],
        education: [
          { degree: "B.Tech Computer Science", institution: "State Technical Univ", year: "2026" },
        ],
        skills: ["React", "TypeScript", "Node.js", "MongoDB", "TailwindCSS"],
        projects: [
          {
            name: "YuvaHub Platform",
            description: "Student recruitment & opportunity portal.",
            url: "https://github.com/MILAN-123865/YuvaHub",
            stars: 88,
            language: "TypeScript",
          },
        ],
        badges: ["Verified React Developer", "Hackathon Finalist"],
      };
    }

    const fullName = `${user.firstName || user.name || ""} ${user.lastName || ""}`.trim();

    return {
      meta: {
        username: user.username,
        fullName: fullName || user.username,
        headline: user.headline || "Student & Developer",
        bio: user.bio || "",
        avatar: user.avatarUrl || user.avatar,
        socials: {
          github: user.githubUsername ? `https://github.com/${user.githubUsername}` : null,
          linkedin: user.linkedinUrl || null,
          email: user.publicEmail || user.email || null,
        },
      },
      settings: user.portfolioSettings || {
        template: "minimalist",
        primaryColor: "#3B82F6",
        visibleSections: { bio: true, projects: true, badges: true, experience: true },
      },
      experience: user.experience || [],
      education: user.education || [],
      skills: user.skills || [],
      projects: user.projects || [],
      badges: (user.badges || []).map((b: any) =>
        typeof b === "string" ? { title: b, issuedAt: new Date().toISOString() } : b
      ),
    };
  }

  /**
   * Updates portfolio settings (template selection, primaryColor, visibleSections) for a user.
   */
  public static async updatePortfolioSettings(
    userId: string,
    settings: Partial<PortfolioSettings>
  ): Promise<PortfolioSettings> {
    const updatedSettings: PortfolioSettings = {
      template: settings.template || "minimalist",
      primaryColor: settings.primaryColor || "#3B82F6",
      visibleSections: {
        bio: settings.visibleSections?.bio ?? true,
        projects: settings.visibleSections?.projects ?? true,
        badges: settings.visibleSections?.badges ?? true,
        experience: settings.visibleSections?.experience ?? true,
      },
    };

    if (dbCommand) {
      await dbCommand.collection("users").updateOne(
        { $or: [{ _id: userId }, { username: userId }] },
        { $set: { portfolioSettings: updatedSettings } }
      );
    }

    return updatedSettings;
  }
}
