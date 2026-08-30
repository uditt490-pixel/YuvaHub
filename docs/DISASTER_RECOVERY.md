# 🚨 Disaster Recovery & Database Backup Runbook

This runbook outlines the emergency procedures for recovering the YuvaHub database and rolling back application deployments during a critical production outage or data corruption event.

## 1. MongoDB Atlas Backup Strategy
- **Storage Location**: Backups are stored securely within MongoDB Atlas Cloud Backup.
- **Frequency**: Continuous cloud backups are enabled, providing Point-in-Time Recovery (PITR) for up to the last 7 days, alongside daily snapshot backups retained for 30 days.

## 2. Database Restoration Steps (Point-in-Time Recovery)
If the production database is dropped or corrupted, follow these UI clicks immediately:
1. Log in to the [MongoDB Atlas Dashboard](https://cloud.mongodb.com).
2. Navigate to **Database Deployments** and select the production cluster.
3. Click on the **Backups** tab.
4. Under the **Continuous Cloud Backups** section, click **Restore**.
5. Select **Point in Time** and input the exact date and time (down to the minute) just *before* the incident occurred.
6. Choose **Restore to original cluster** (if recovering from accidental drop) or **Restore to a new cluster** (if the current cluster is compromised).
7. Click **Restore**. *Note: The application will experience downtime while the data is actively restoring.*

## 3. Environment Rollback Procedures
If a bad deployment caused the data corruption, you must roll back the codebase before restoring the database to prevent immediate re-corruption.

### Frontend (Vercel)
1. Open the Vercel dashboard and navigate to the YuvaHub project.
2. Go to the **Deployments** tab.
3. Locate the last known stable deployment (prior to the incident).
4. Click the three dots (`...`) next to the deployment and select **Promote to Production** or **Instant Rollback**.

### Backend (Render)
1. Open the Render dashboard and select the YuvaHub API web service.
2. Go to the **Events** tab.
3. Find the successful deployment that matches the last stable commit.
4. Click **Rollback to this deploy**.

## 4. Incident Communication
During a high-stress outage, user communication is critical to prevent support channel flooding.
- **Immediate Action**: Update the status page to reflect a "Major Outage" or "Database Maintenance".
- **Social Media/Community**: Post an update in the community Discord/Forum: 
  > *"We are currently investigating a database anomaly. The application is in maintenance mode while we restore from a backup. No data has been permanently lost. ETA for resolution: [Time]."*

## 5. Testing the Restoration Process (Staging)
To verify these steps safely without affecting production:
1. Go to the Atlas Backup tab and select **Restore**.
2. Choose **Restore to a different cluster** and select the `Staging` cluster.
3. Point the staging API environment variables (`MONGODB_URI`) to this newly restored staging cluster.
4. Run standard E2E tests to verify data integrity.
