import type { NormalizedOpportunity } from "../types";
import { BaseOpportunityAdapter } from "./BaseOpportunityAdapter";

export class InternshalaAdapter extends BaseOpportunityAdapter {
  readonly sourceName = "Internshala";

  protected normalizeItem(
    item: Record<string, unknown>,
  ): NormalizedOpportunity {
    return {
      title: this.stringValue(item.title, "Untitled Internship"),
      company: this.stringValue(
        item.company ?? item.company_name ?? item.organization,
        "Unknown Company",
      ),
      description: this.stringValue(
        item.description ?? item.details,
        "No description provided.",
      ),
      url: this.stringValue(
        item.link ?? item.apply_link ?? item.url,
        "https://internshala.com",
      ),
      location: this.stringValue(item.location, "Remote"),
      deadline: this.stringValue(item.deadline, new Date().toISOString()),
      tags: this.stringArray(item.tags ?? item.skills_required, ["Internship"]),
      opportunityType: this.stringValue(item.opportunity_type, "internship"),
      sourceName: this.sourceName,
    };
  }
}
