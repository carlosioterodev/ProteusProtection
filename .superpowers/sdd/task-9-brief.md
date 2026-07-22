# Task 9: Admin Users Page

**Files:**
- Create: `app/admin/users/page.tsx`
- Create: `components/admin/users-table.tsx`
- Create: `components/admin/user-detail-modal.tsx`

**Interfaces:**
- Consumes: GET `/api/admin/users?search=...&plan=...&page=...`
- Consumes: GET `/api/admin/users/[id]`

## Complete Code

See the plan file at C:\Proyectos_Academicos\ProteusProtection\docs\superpowers\plans\2026-07-22-admin-dashboard-plan.md
Read lines 1311-1670 for the complete code of all 3 files.

Key points:
- `components/admin/user-detail-modal.tsx` - Modal showing user detail (plan, status, password count, recent views)
- `components/admin/users-table.tsx` - Paginated table with name, email, plan, status, date columns
- `app/admin/users/page.tsx` - Users page with search input, table, and detail modal

## Steps

1. Create the directory `app/admin/users/` if it doesn't exist
2. Create all 3 files exactly as specified
3. Verify files are correct
4. Commit: `git add app/admin/users/ components/admin/users-table.tsx components/admin/user-detail-modal.tsx && git commit -m "feat: add admin users page with search, pagination, and detail modal"`
