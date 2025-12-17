# Cadence - Implementation Decisions

This document captures key implementation decisions made during the requirements analysis phase.

## Table of Contents
- [Authentication & Data Model](#authentication--data-model)
- [Meeting Management](#meeting-management)
- [Task Management](#task-management)
- [Delivery Insights](#delivery-insights)
- [User Experience](#user-experience)
- [Technical Specifications](#technical-specifications)

---

## Authentication & Data Model

### Row Level Security (RLS)
**Decision:** ✅ Implement RLS from day 1
**Rationale:** Ensures data isolation at the database level, essential for multi-user security

### Team Membership History
**Decision:** ✅ Current state only for v1 (no join/leave date tracking)
**Rationale:** Simplifies implementation and queries; can add historical tracking in v2 if needed

---

## Meeting Management

### Meeting Creation
**Decision:** ✅ Users manually control meeting creation from their own calendar (Google or Outlook)
**Decision:** ✅ No automatic meeting generation
**Rationale:** Users maintain full control over their calendar; Cadence focuses on capturing meeting context, not scheduling

### Timezone Handling
**Decision:** ✅ Store all dates in UTC, display in user timezone
**Decision:** ✅ No special DST handling for v1
**Rationale:** Standard best practice; DST complexity can be addressed in future iterations

### Calendar Integration
**Decision:** ✅ No calendar sync for v1
**Rationale:** Keep initial scope manageable; focus on core functionality

### Meeting Notes Format
**Decision:** ✅ Markdown for meeting notes
**Rationale:** Simple, portable, no rich text editor complexity; consistent with task notes

### Action Item Parsing
**Decision:** ✅ Manual tagging (users explicitly mark action items)
**Rationale:** More reliable than AI parsing; users maintain control

### Action Item Due Dates
**Decision:** ✅ Default due date: Meeting date + 7 days
**Rationale:** Reasonable default for follow-ups; users can adjust as needed

---

## Task Management

### Task Notes Format
**Decision:** ✅ Plain text / Markdown
**Rationale:** Simple, portable, consistent with meeting notes

### Task Limits
**Decision:** ✅ 1000 tasks max per user (500 open tasks max)
**Rationale:** Prevents database bloat and ensures usability

---

## Delivery Insights

### Warning Thresholds
**Decision:** Define specific, deterministic thresholds:
- **Over-planning:** Planned > Actual by >20% for 3+ consecutive periods
- **Under-delivery:** Actual < Planned by >20% for 3+ consecutive periods
- **Capacity drop:** >30% reduction in actual delivery vs rolling average

**Rationale:** Clear, explainable rules; no AI/ML complexity

---

## User Experience

### Mobile Support
**Decision:** ✅ Desktop-first for v1, mobile-optimized for v2
**Rationale:** Focus on core functionality first; responsive design throughout, but optimize mobile interactions in later phase

---

## Technical Specifications

### Input Validation

#### Duplicate Detection
**Decision:** ✅ Prevent duplicate team names and person names (case-insensitive) within user scope
**Rationale:** Improves data quality and user experience

#### Validation Rules
- **Team name:** 1-100 chars, unique per user
- **Person name:** 1-100 chars, unique per user
- **Task title:** 1-200 chars
- **Project name:** 1-100 chars, unique per user
- **Meeting title:** 1-200 chars

### Search
**Decision:** ✅ Use Postgres full-text search (built into Supabase)
**Decision:** ✅ Search scope: Tasks, people, teams, projects, meetings
**Rationale:** Leverages existing database capabilities; no additional services needed

### Notifications
**Decision:** ✅ In-app notifications only for v1 (no email/push initially)
**Rationale:** Simplifies initial implementation; can add email later

**Triggers:**
- Task overdue (daily digest)
- Task due today (morning notification)
- Meeting in 1 hour (for recurring meetings)

### Rate Limiting & Quotas

**Decision:** ✅ Implement quotas to ensure scalability

**Quotas per user:**
- Teams: 20 max
- People: 100 max
- Projects: 50 max
- Tasks: 1000 max (500 open tasks)
- Meeting types: 20 max
- Meetings: unlimited

**Rate limits:**
- API calls: 100 requests/minute per user
- Database writes: 20/minute per user

### Date Handling
**Decision:** ✅ Store UTC, display in user timezone
**Decision:** ✅ Use date-fns or Day.js for date manipulation
**Rationale:** Industry standard approach; prevents timezone bugs

### Data Retention
**Decision:** ✅ Retention policy defined:
- **Active users:** Keep all data for 5 years
- **Inactive users:** Delete all user data after 2 years of inactivity
- **Soft deletes:** Available for 30 days before permanent deletion

**Rationale:** Balances data preservation with privacy and database performance; complies with data minimization principles

### Data Export
**Decision:** ✅ JSON (complete data) and CSV (table-friendly) formats
**Decision:** ✅ No import for v1
**Rationale:** Focus on data portability; import adds significant complexity

### Default User Preferences
- **Week start:** Monday
- **Date format:** DD-MM-YYYY
- **Capacity unit:** "points"
- **Timezone:** Browser default, user-configurable

---

## Implementation Phases

### Phase 1: Foundation (Issues #1-5)
- Project setup (Next.js, Supabase, shadcn/ui)
- Google OAuth authentication
- Database schema with RLS
- Team management (simplified)
- People management (simplified)

### Phase 2: Core Workflow (Issues #6-8)
- Tasks dashboard (manual tasks only)
- Basic meeting instances (user-created)
- Simple project tracking with delivery periods

### Phase 3: Automation (Issues #9-12)
- Meeting action items → tasks
- Delivery insights calculations
- Task automation features

### Phase 4: Polish (Issues #13-18)
- Personal career progression
- Global dashboard
- Team dashboards
- User settings & preferences
- Data export
- Mobile optimization

### Technical Specs (Issues #19-25)
- Input validation & error handling
- Global search
- Notification system (future)
- Rate limiting & quotas
- Timezone handling
- Data retention & cleanup
- Documentation

---

## Revised Specifications

Based on clarifications, the following requirements documents need updates:

### Meeting Management
- Remove automatic recurring meeting generation
- Focus on manual meeting creation
- Users control meetings via their own calendar
- Cadence captures meeting notes and context

### Data Retention
- Active users: 5 years of data retention
- Inactive users: Delete after 2 years of inactivity
- Soft deletes: 30-day grace period

### User Preferences
- Default date format: DD-MM-YYYY (not YYYY-MM-DD)

---

## Next Steps

1. Update GitHub issues #9 and #11 to remove automatic meeting generation features
2. Update issue #23 with correct data retention policy
3. Update issue #16 with correct default date format
4. Start with Issue #1: Project setup
5. Follow the phased implementation approach
6. Track progress via GitHub project board

---

Last updated: 2025-12-17
