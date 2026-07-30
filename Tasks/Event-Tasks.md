Here is the full deep analysis and multi-phase plan.

------

## What I Found in the Codebase

**The backend is already solid.** `EventController`, `EventService`, `Event`, and `EventRegistration` entities all exist. The API has CRUD + registration + check-in data structures. **The gap is entirely on the frontend and in three missing backend features.**

**Critical frontend gaps:**

- `/admin/events/[id]` — the page is linked from the list but **does not exist**. Clicking "Edit" opens a stripped-down modal missing 8+ fields
- No registrations management UI at all (API exists, no page)
- No notification/reminder system anywhere

------

## The 5-Phase Plan (see report above)

| Phase | Scope                                                        | Value                                                       | Effort  |
| :---- | :----------------------------------------------------------- | :---------------------------------------------------------- | :------ |
| **1** | Dedicated `/admin/events/[id]` edit page + fix list          | Full CRUD works properly                                    | ~1 day  |
| **2** | Registrations management tab (check-in, status, CSV export, manual add) | Control who attended                                        | ~1 day  |
| **3** | **Configurable reminder engine** (new `event_reminder_rules` table + scheduler) | Auto-notify registrants 24h/1h before, post-event follow-up | ~2 days |
| **4** | Bulk messaging to registrants + cancellation workflow + iCal confirmation email | Direct communication                                        | ~1 day  |
| **5** | Analytics tab + public page controls (featured toggle, SEO, OG image) | Insight + presentation control                              | ~1 day  |

------

## The Notification Architecture (Phase 3 — the key ask)

```txt
Admin sets: "notify 24h before" + "notify 1h before" + "follow-up 2h after"
        ↓
event_reminder_rules rows created with computed fire_at timestamps
        ↓
@Scheduled(60s) scans WHERE fire_at <= NOW() AND is_fired = false
        ↓
For each confirmed registrant → JavaMailSender (HTML email, template substitution)
                               → NotificationService.createAndPush() (in-app WebSocket)
        ↓
Rule marked fired + recipients_count recorded
```



Admin can also **manually trigger** any rule via "Send Now", and **message all registrants** ad-hoc via a compose modal.