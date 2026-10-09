# WeballCreative Project Tracker — Design Spec

## Overview

Internal project management tool for WeballCreative (software agency). Replaces WhatsApp-based revision tracking with a structured, auditable system.

**Problem**: Revisi proyek hilang di chat WA, tidak ada audit trail, sulit track mana yang sudah dan belum selesai.

**Solution**: Web app dengan GitHub Issues-style tracking, role-based access, real-time chat, dan WA notification.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (credentials provider) |
| Real-time | Socket.io (custom server) |
| File Storage | Cloudflare R2 (S3-compatible) |
| WA Notifications | wagate.devbelanjamu.tech API |
| Styling | Tailwind CSS |
| Deployment | VPS |

---

## Color Palette & UI

White/light theme. Clean, minimal, professional.

| Color | Hex | Role |
|-------|-----|------|
| Navy | `#122056` | Headings, primary text, dark sections |
| Periwinkle | `#5B65DC` | Buttons, links, active states, accents |
| Lavender gray | `#E6E7F0` | Subtle backgrounds, cards borders, secondary sections |
| Off-white | `#FAFAFA` | Main page background |
| White | `#FFFFFF` | Cards, input fields, navbar |

Rules:
- No excessive emoji or badges
- No non-solid backgrounds (no gradients, no patterns)
- Navy + periwinkle as dominant brand colors
- Strong contrast, calm, professional appearance

---

## Architecture

Monolith Next.js app, satu repo.

```
project-tracker/
├── src/
│   ├── app/           # Next.js App Router (pages + API routes)
│   ├── components/    # UI components
│   ├── lib/           # Prisma client, auth config, WA helper, socket
│   └── types/         # Shared types
├── prisma/            # Schema + migrations
├── uploads/           # Temp upload dir (before R2)
└── server.ts          # Custom server (Next.js + Socket.io)
```

---

## Roles & Access

### User Roles
- **ADMIN**: Lead/PM — full access, manages users, triages issues, manages all projects
- **DEVELOPER**: Handles assigned issues, chats, sees only assigned projects
- **CLIENT**: Creates issues (revisi), chats, sees only own projects

### Onboarding Flow
1. Admin generates invite link (token-based, 48-hour expiry)
2. Admin sends link via WA (manual or auto)
3. User clicks link → set name + password → account created
4. No self-registration

---

## Data Model

### User
- id, email, name, phone, password (hashed)
- role: ADMIN | DEVELOPER | CLIENT
- avatar (R2 url)
- inviteToken, inviteExpiry
- createdAt, updatedAt

### Project
- id, name, description
- status: ACTIVE | ON_HOLD | COMPLETED | ARCHIVED
- createdById (Admin)
- createdAt, updatedAt
- Relations: members[], issues[], chatChannel

### ProjectMember
- id, projectId, userId
- role: PM | DEVELOPER | CLIENT
- joinedAt

### Issue
- id, projectId
- title, description (markdown)
- status: OPEN | IN_REVIEW | IN_PROGRESS | RESOLVED | CLOSED
- priority: LOW | MEDIUM | HIGH | URGENT
- createdById (biasanya Client)
- assignedToId (Developer, di-assign oleh Admin)
- attachments[] (R2 urls)
- createdAt, updatedAt
- Relations: comments[], activities[]

### IssueComment
- id, issueId, authorId
- content (markdown), attachments[]
- createdAt, updatedAt

### IssueActivity (audit trail)
- id, issueId, userId
- action: CREATED | ASSIGNED | STATUS_CHANGED | COMMENTED | ATTACHMENT_ADDED
- metadata (JSON — old/new values)
- createdAt

### ChatChannel
- id, projectId
- name (default: "General")
- createdAt

### ChatMessage
- id, channelId, senderId
- content, attachments[]
- readBy[] (user ids)
- createdAt

### Notification
- id, userId
- type: ISSUE_ASSIGNED | ISSUE_UPDATED | CHAT_MENTION | NEW_COMMENT
- title, message
- referenceId, referenceType
- read (boolean)
- waSent (boolean)
- createdAt

---

## Issue Workflow

```
Client buat issue (OPEN)
    → Admin triage + assign ke Developer (IN_PROGRESS)
        → Developer resolve (RESOLVED)
            → Client verify → CLOSED
            → Client reopen → OPEN
```

Setiap perubahan status → IssueActivity record + WA notification ke stakeholders.

---

## Page Structure & Routing

```
/login                              # Auth page
/invite/[token]                     # Claim invite, set password

/dashboard                          # Role-filtered overview
/projects                           # Project list (role-filtered)
/projects/[id]                      # Project detail
/projects/[id]/issues               # Issue list (filterable by status/priority/assignee)
/projects/[id]/issues/[issueId]     # Issue detail + comments + activity log
/projects/[id]/chat                 # Real-time chat
/projects/new                       # Admin only — create project
/users                              # Admin only — manage users
/users/invite                       # Admin only — generate invite
```

Role-based access via Next.js middleware. Same URL, different render per role.

### Layout
- Sidebar kiri: project list navigation, issues & chat links
- Main area: content
- Top bar: notification bell, user avatar

---

## API Routes

### Auth
```
POST /api/auth/[...nextauth]
POST /api/invite/generate          # Admin only
GET  /api/invite/[token]           # Validate token
POST /api/invite/[token]/claim     # Set password, create user
```

### Users
```
GET    /api/users                  # Admin only
PATCH  /api/users/[id]
DELETE /api/users/[id]             # Admin only (deactivate)
```

### Projects
```
GET    /api/projects               # Role-filtered
POST   /api/projects               # Admin only
GET    /api/projects/[id]
PATCH  /api/projects/[id]          # Admin only
POST   /api/projects/[id]/members  # Admin only
```

### Issues
```
GET    /api/projects/[id]/issues
POST   /api/projects/[id]/issues              # Client/Admin
GET    /api/projects/[id]/issues/[issueId]
PATCH  /api/projects/[id]/issues/[issueId]    # Status/assign
POST   /api/projects/[id]/issues/[issueId]/comments
POST   /api/projects/[id]/issues/[issueId]/assign  # Admin only
```

### Chat
```
GET  /api/projects/[id]/chat/messages
POST /api/projects/[id]/chat/messages
```

### Upload
```
POST /api/upload                   # → Cloudflare R2, returns public URL
```

### Notifications
```
GET   /api/notifications
PATCH /api/notifications/[id]/read
```

---

## Socket.io Events

### Client → Server
```
join:project        { projectId }
join:issue          { issueId }
message:send        { channelId, content, attachments }
issue:typing        { issueId, userId }
```

### Server → Client
```
message:new         { message object }
issue:updated       { issue object }
issue:comment:new   { comment object }
notification:new    { notification object }
user:typing         { issueId, userId, name }
```

---

## WA Notification

**API**: `POST https://wagate.devbelanjamu.tech/api/send/text`

**Trigger events**:
- Issue di-assign ke developer
- Issue status berubah
- Comment baru di issue
- User invited

### Templates

**Issue Assigned (to Developer):**
```
[WeballCreative] Kamu di-assign issue baru:
Proyek: {projectName}
Issue: #{issueId} {issueTitle}
Priority: {priority}
Buka: {appUrl}/projects/{projectId}/issues/{issueId}
```

**Status Changed (to Client):**
```
[WeballCreative] Update proyek kamu:
Proyek: {projectName}
Issue: #{issueId} {issueTitle}
Status: {oldStatus} → {newStatus}
Buka: {appUrl}/projects/{projectId}/issues/{issueId}
```

**New Comment (to stakeholders):**
```
[WeballCreative] Comment baru dari {authorName}:
Issue: #{issueId} {issueTitle}
"{commentPreview}"
Buka: {appUrl}/projects/{projectId}/issues/{issueId}
```

**Invite User:**
```
[WeballCreative] Kamu diundang ke platform project management kami.
Klik link berikut untuk bergabung:
{inviteUrl}
Link berlaku 48 jam.
```

---

## File Upload Flow

1. Client/user pilih file di UI
2. Frontend POST ke `/api/upload` (multipart/form-data)
3. API route upload ke Cloudflare R2 via AWS SDK S3-compatible
4. Return public URL dari R2
5. URL disimpan di field attachments (Issue/IssueComment/ChatMessage)

**R2 Config:**
- Endpoint: `https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
- Bucket: `trading-bot-images`
- Public URL: `https://pub-855a9852abf24676ba85e092ba19bb9f.r2.dev`

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-r2-public-url.r2.dev

# WhatsApp Gateway
WA_API_URL=https://your-wa-gateway-url
WA_API_KEY=your_wa_api_key
WA_ADMIN_PHONE=your_phone_number

# App
APP_URL=http://localhost:3000
```

---

## Security Considerations

- Passwords hashed with bcrypt
- Invite tokens: crypto.randomUUID(), 48-hour expiry
- API routes protected by NextAuth session + role check middleware
- File upload: validate file type + size limit (10MB)
- Rate limiting pada WA notifications (prevent spam)
- Input sanitization pada markdown content (XSS prevention)
