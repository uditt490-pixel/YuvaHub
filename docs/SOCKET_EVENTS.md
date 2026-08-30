## 📖 Event Dictionary

### Room & Queue Management
| Event Name | Direction | Payload Schema | Description |
| :--- | :--- | :--- | :--- |
| `joinDmRoom` / `leaveDmRoom` | Client ➔ Server | `userId: string` | Manages presence in Direct Messaging threads. |
| `joinForumPostRoom` / `leaveForumPostRoom` | Client ➔ Server | `postId: string` | Subscribes/unsubscribes to live replies on a forum post. |
| `join_study_group` / `leave_study_group` | Client ➔ Server | `{ roomId: string, user: any }` | Manages active users inside study group rooms. |
| `joinEventRoom` / `leaveEventRoom` | Client ➔ Server | `eventId: string` | Handles real-time RSVP updates for events. |
| `joinFocusRoom` / `leaveFocusRoom` | Client ➔ Server | `none` | Manages presence in productivity focus rooms. |
| `joinTeamRoom` / `leaveTeamRoom` | Client ➔ Server | `teamId: string` | Connects users to Hackathon team builder hubs. |
| `join_queue` / `leave_queue` | Client ➔ Server | `{ boothId: string, student: any }` | Manages student lines for career fair booths. |
| `joinSession` / `leaveSession` | Client ➔ Server | `sessionId: string` | Connects users for mock interviews and collab editing. |
| `join_bounty_room` | Client ➔ Server | `{ bountyId: string }` | Connects users to specific bounty chat threads. |

### Real-Time Interactions & Actions
| Event Name | Direction | Payload Schema | Description |
| :--- | :--- | :--- | :--- |
| `codeChange` | Bi-directional | `{ sessionId: string, content: string }` | Syncs live code editor changes between collaborators. |
| `draw_event` | Bi-directional | `data: any` | Syncs live strokes on the collaborative whiteboard. |
| `timer_tick` | Server ➔ Client | `timer state object` | Broadcasts synchronized countdowns in Focus Rooms. |
| `user_count_update` | Server ➔ Client | `count: number` | Broadcasts the live number of active users in a room. |
| `recruiter_status_update` | Server ➔ Client | `{ boothId: string, isOnline: boolean }` | Alerts students in queue if a recruiter goes offline/online. |
| `bounty_chat_message` | Client ➔ Server | `msg: object` | Emitted when a user sends a message in a bounty thread. |
| `mock_interview_message` | Client ➔ Server | `message details` | Sends user input to the mock interview state. |
| `mock_interview_response` | Server ➔ Client | `response details` | Receives the AI/interviewer reply during a mock interview. |
| `end_mock_interview` | Client ➔ Server | `interview data` | Signals the termination of an active interview session. |
