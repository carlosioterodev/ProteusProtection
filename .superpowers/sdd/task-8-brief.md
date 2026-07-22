# Task 8: Admin Analytics Page

**Files:**
- Create: `app/admin/analytics/page.tsx`
- Create: `components/admin/analytics-table.tsx`

**Interfaces:**
- Consumes: GET `/api/admin/analytics?period=...&group=...`

## Complete Code

See the plan file at C:\Proyectos_Academicos\ProteusProtection\docs\superpowers\plans\2026-07-22-admin-dashboard-plan.md
Read lines 1148-1300 for the complete code.

Key points:
- `components/admin/analytics-table.tsx` - Data table with label, progress bar, count, percentage
- `app/admin/analytics/page.tsx` - Page with period selector (24h/7d/30d/all) and group tabs (Navegadores/SO/Dispositivos/Países/Páginas), fetches from /api/admin/analytics

## Steps

1. Create both files exactly as specified
2. Verify files are correct
3. Commit: `git add app/admin/analytics/ components/admin/analytics-table.tsx && git commit -m "feat: add admin analytics page with period and group filters"`
