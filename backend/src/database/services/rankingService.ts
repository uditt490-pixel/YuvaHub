/**
 * backend/src/services/rankingService.ts
 * --------------------------------------
 * Search indexing, ranking algorithms, and AI client wrappers.
 */

export interface Item {
  id: string;
  title: string;
  score: number;
}

export class RankingService {
  public rankItems(items: Item[]): Item[] {
    // Sort items by score descending
    return items.sort((a, b) => b.score - a.score);
  }

  public computeRelevanceScore(query: string, text: string): number {
    if (!query || !text) return 0;
    return text.toLowerCase().includes(query.toLowerCase()) ? 1.0 : 0.0;
  }
}

export const rankingService = new RankingService();
