# Alumni Network Migration

This migration adds the alumni profile fields needed for the alumni directory and mentorship matching flow.

## MongoDB user fields

Add these fields to the `users` collection when a document is created or updated:

- `graduation_year: number | null`
- `current_company: string`
- `alumni_status: boolean`
- `is_open_to_mentoring: boolean`
- `mentoring_interests: string[]`
- `alumni_profile_bio: string`

## Mentorship requests collection

Create a `mentorship_requests` collection with documents shaped like:

```json
{
  "id": "<request-id>",
  "sender_id": "<uid>",
  "recipient_id": "<uid>",
  "subject": "Career Guidance",
  "message": "I would love help with my resume and software internships.",
  "status": "pending",
  "created_at": "2026-08-31T00:00:00.000Z",
  "updated_at": "2026-08-31T00:00:00.000Z"
}
```

## Recommended Mongo indexes

```js
db.users.createIndex({ alumni_status: 1, is_open_to_mentoring: 1, graduation_year: -1 });
db.mentorship_requests.createIndex({ sender_id: 1, recipient_id: 1, created_at: -1 });
```
