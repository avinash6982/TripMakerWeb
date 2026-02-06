# Additional Features (Between MVP3 and MVP4)

**Last Updated:** February 2026  
**Phase:** Post–MVP3, pre–MVP4  
**Purpose:** Track feature requests that sit between MVP3 (Real-Time Trip Execution) and MVP4 (Marketplace Integration). These are implemented when agreed, without starting the full MVP4 scope.

---

## Feature: Trip Prerequisites

**Status:** ✅ Implemented  
**Branch:** `feature_prerequisites`  
**Completed:** February 2026

### Summary

Trips can have a **Prerequisites** list: items to bring or prepare (e.g. documents, gear, medicine). Collaborators can add items; on **ongoing** (active) trips they can assign items to each other and mark items as acquired/done. **Public** viewers see the list only (read-only).

### Rules

| Context | Add items | Assign to collaborator | Mark as done |
|--------|-----------|-------------------------|---------------|
| **Public view** | No | No | No (list only) |
| **Collaborator, trip upcoming** | Yes | No | No |
| **Collaborator, trip active (ongoing)** | Yes | Yes | Yes |
| **Collaborator, trip completed** | Yes | No | No |

- **Who can add:** Trip owner or any collaborator (viewer or editor).
- **Who can assign / mark done:** Only when trip status is **active**; any collaborator can assign or mark items.

### Data Model (per item)

- `id` — UUID
- `title` — string (required)
- `description` — string (optional)
- `category` — string (icon key: e.g. `documents`, `clothing`, `electronics`, `medicine`, `other`)
- `imageKey` — string (optional, R2 key for item image)
- `assigneeUserId` — string (optional; when trip is active)
- `assigneeEmail` — string (optional; denormalized for display)
- `status` — `"pending"` | `"done"`
- `createdAt` — ISO string
- `createdBy` — userId (optional)

### API

- **GET /trips/:id** — Trip response includes `prerequisites` array (same for public and collaborators; UI enforces read-only for public).
- **POST /trips/:id/prerequisites** — Add item (collaborator). Body: `{ title, description?, category?, imageKey?, assigneeUserId? }`. Assignee only accepted when trip status is `active`.
- **PUT /trips/:id/prerequisites/:itemId** — Update item (title, description, category, imageKey). Collaborator only; not allowed when trip is `completed`.
- **PATCH /trips/:id/prerequisites/:itemId** — Update assignee or status. Collaborator only; only when trip is `active`.
- **DELETE /trips/:id/prerequisites/:itemId** — Remove item. Collaborator only; not allowed when trip is `completed`.

### UI

- **Trip Detail:** New “Prerequisites” section (card style, consistent with Map/Transportation).
- **Public:** List only (image, category icon, title, description, assignee if any, status).
- **Collaborator:** Add button (icon), per-item: edit (icon), assign (dropdown when active), mark done (icon when active), delete (icon when not completed). Use standard page header and icon-button patterns (see `.cursor/rules/ui-icon-buttons.mdc`).
- **Categories:** Fixed set mapped to icons (documents, clothing, electronics, medicine, other).

### Documentation Updates

- **API_REFERENCE.md** — Prerequisites endpoints and request/response.
- **APP_ARCHITECTURE.md** — Trip model `prerequisites` array; access rules.
- **MVP_ROADMAP.md** — “Additional features (MVP3–4)” section; Prerequisites marked complete.
- **DEVELOPMENT_STATUS.md** — Current phase and Prerequisites completion.

---

## Future Additional Features

(Add new sections here when new between-MVP features are agreed.)
