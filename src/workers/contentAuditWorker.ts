import { Worker, Job } from 'bullmq';
import { redisClient } from '../config/redis';
import { AuditReport } from '../models/AuditReport';
import { scanContent } from '../services/accessibilityScanner';
import { logger } from '../utils/logger';

export const contentAuditWorker = new Worker(
    'content_audit_pipeline',
    async (job: Job) => {
        const { contentId, contentType } = job.data;
        logger.info(`Starting content audit for ${contentType}: ${contentId}`);

        try {
            // Create initial pending report
            const report = await AuditReport.create({
                contentId,
                contentType,
                status: 'pending',
            });

            // Perform scanning (mocked content fetch in real app)
            const mockContent = {
                title: "Amazing Tech Event",
                description: "Join us for a great time. Click here.",
                hasImagesWithoutAlt: true,
                metaDescriptionLength: 10,
            };

            const scanResult = await scanContent(mockContent);

            // Calculate scores (100 - (issues * weight))
            const highWeight = 15, mediumWeight = 5, lowWeight = 2;
            let accessibilityDeduction = 0;
            let seoDeduction = 0;

            scanResult.issues.forEach(issue => {
                const deduction = issue.severity === 'high' ? highWeight : issue.severity === 'medium' ? mediumWeight : lowWeight;
                if (issue.type === 'accessibility') accessibilityDeduction += deduction;
                if (issue.type === 'seo') seoDeduction += deduction;
            });

            report.accessibilityScore = Math.max(0, 100 - accessibilityDeduction);
            report.seoScore = Math.max(0, 100 - seoDeduction);
            report.issues = scanResult.issues;
            report.status = 'completed';
            await report.save();

            logger.info(`Audit completed for ${contentId}. Accessibility: ${report.accessibilityScore}, SEO: ${report.seoScore}`);
            return { status: 'completed', reportId: report._id };
        } catch (error) {
            logger.error({ err: error }, `Content audit failed for ${contentId}:`);
            await AuditReport.findByIdAndUpdate(job.data.contentId, { status: 'failed' }); // Simplified for example
            throw error;
        }
    },
    { connection: redisClient }
);
