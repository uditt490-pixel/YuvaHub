import type { NormalizedOpportunity } from "../types";
import { BaseOpportunityAdapter } from "./BaseOpportunityAdapter";

export class DevpostAdapter extends BaseOpportunityAdapter {
  readonly sourceName = "Devpost";

  protected normalizeItem(
    item: Record<string, unknown>,
  ): NormalizedOpportunity {
    return {
      title: this.stringValue(item.title, "Untitled Opportunity"),
      company: this.stringValue(
        item.organization ?? item.company,
        "Unknown Organization",
      ),
      description: this.stringValue(
        item.description,
        "No description provided.",
      ),
      url: this.stringValue(item.apply_link ?? item.url, "https://devpost.com"),
      location: this.stringValue(item.location, "Online"),
      deadline: this.stringValue(item.deadline, new Date().toISOString()),
      tags: this.stringArray(item.tags, ["Hackathon"]),
      opportunityType: this.stringValue(item.opportunity_type, "hackathon"),
      sourceName: this.sourceName,
    };
  }
}
