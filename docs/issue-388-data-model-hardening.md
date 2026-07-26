# Issue #388 data-model hardening

## Current-source assessment

Some findings in the original report were already fixed before this patch:

- Bounty title, description and positive reward validation existed.
- Notification type already used a Zod enum.
- Scholarship amount was already stored as `amount_inr: number`.

This implementation avoids duplicating those fixes and addresses the remaining
valid weaknesses.

## Application model

- Runtime Zod validation
- Strict status enum
- Date-backed timestamps
- Retry-count limits
- Audit-log validation
- Indexes for user and opportunity history
- Unique user/opportunity application constraint

The unique index is partial to avoid failing on unrelated legacy rows that do
not contain string IDs. Existing true duplicates must still be cleaned before
deployment.

## Notifications

- Strong field length validation
- Default 90-day expiry
- User/read/createdAt compound index
- TTL index on `expiresAt`
- Legacy 90-day TTL index on `createdAt`

## Scholarships

- `deadline` is normalized to `Date`
- Numeric strings for `amount_inr` are migrated safely at validation time
- Non-negative amount validation
- Deadline index
- Academic and list-size limits

## Teams

- Team/member skill limits
- Member count validation
- Index on `members.uid`
- Unique pending join request index
- Atomic conditional `$push` during request acceptance

The atomic update prevents two concurrent accept operations from exceeding
`maxMembers`.

## Bounties

- Stores authenticated `createdBy`
- Reward maximum
- Tag, title and description limits
- Status enum
- Creator index

## Migration warning

Creating a unique application index can fail if the database already contains
duplicate `{ userId, opportunityId }` pairs.

Find duplicates before deployment:

```javascript
db.applications.aggregate([
  {
    $group: {
      _id: {
        userId: "$userId",
        opportunityId: "$opportunityId"
      },
      ids: { $push: "$_id" },
      count: { $sum: 1 }
    }
  },
  { $match: { count: { $gt: 1 } } }
])
```

Resolve duplicates according to product policy before enabling the index in
production.
