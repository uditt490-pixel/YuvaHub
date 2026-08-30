import { dbCommand, dbQuery } from "../db.js";
import { io } from "../../../server.js";

export interface ScraperConfig {
  source: string; // The ID of the adapter (e.g. devpost, internshala)
  minSuccessRate: number; // 0-100
  maxStalenessHours: number; // Max allowed hours without a successful scrape
  isPaused: boolean;
}

export class ScraperAlertService {
  private static readonly DEFAULT_MIN_SUCCESS = 80;
  private static readonly DEFAULT_MAX_STALENESS = 24;

  /**
   * Evaluates the latest metrics for a scraper against its configuration
   * and emits socket.io events if status changes or thresholds are breached.
   */
  public static async evaluateMetrics(metrics: any): Promise<void> {
    try {
      const sourceId = metrics.id || metrics.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      let config = await this.getConfig(sourceId);
      if (!config) {
        config = {
          source: sourceId,
          minSuccessRate: this.DEFAULT_MIN_SUCCESS,
          maxStalenessHours: this.DEFAULT_MAX_STALENESS,
          isPaused: false,
        };
        // Save default config
        if (dbCommand && !dbCommand.isMock) {
          await dbCommand.collection("scraper_configs").updateOne(
            { source: sourceId },
            { $set: config },
            { upsert: true }
          );
        }
      }

      // Check success rate
      const totalRuns = (metrics.successRuns || 1) + (metrics.failures || 0);
      const successRuns = metrics.successRuns ?? (metrics.failures ? totalRuns - metrics.failures : 1);
      const successRate = totalRuns > 0 ? (successRuns / totalRuns) * 100 : 100;
      
      const isFailingRate = successRate < config.minSuccessRate;
      
      // Check staleness
      const lastRunDate = new Date(metrics.lastRun || new Date());
      const hoursSinceRun = (Date.now() - lastRunDate.getTime()) / (1000 * 60 * 60);
      const isStale = hoursSinceRun > config.maxStalenessHours;

      let determinedStatus = metrics.status || "healthy";
      if (config.isPaused) {
         determinedStatus = "paused";
      } else if (isFailingRate || isStale || metrics.status === "failed") {
         determinedStatus = "failing";
      }

      // Merge determined status into metrics payload for clients
      const enrichedMetrics = {
         ...metrics,
         determinedStatus,
         config
      };

      // Emit real-time update
      if (io) {
        io.emit("SCRAPER_METRICS_UPDATE", enrichedMetrics);
      }
      
    } catch (err) {
      console.error("[ScraperAlertService] Error evaluating metrics:", err);
    }
  }

  public static async getConfig(sourceId: string): Promise<ScraperConfig | null> {
    if (!dbQuery || dbQuery.isMock) return null;
    return await dbQuery.collection("scraper_configs").findOne({ source: sourceId }) as ScraperConfig | null;
  }

  public static async getAllConfigs(): Promise<ScraperConfig[]> {
    if (!dbQuery || dbQuery.isMock) return [];
    return await dbQuery.collection("scraper_configs").find({}).toArray() as ScraperConfig[];
  }

  public static async updateConfig(sourceId: string, updates: Partial<ScraperConfig>): Promise<void> {
    if (!dbCommand || dbCommand.isMock) return;
    await dbCommand.collection("scraper_configs").updateOne(
      { source: sourceId },
      { $set: updates },
      { upsert: true }
    );
    // Notify clients of config change
    const updatedConfig = await this.getConfig(sourceId);
    if (io && updatedConfig) {
       io.emit("SCRAPER_CONFIG_UPDATE", updatedConfig);
    }
  }
}
