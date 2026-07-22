# Task 7: Admin Layout + Overview Page

**Files:**
- Create: `components/admin/admin-layout.tsx`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `components/admin/kpi-cards.tsx`
- Create: `components/admin/visit-chart.tsx`
- Create: `components/admin/top-pages.tsx`

**Interfaces:**
- Consumes: GET `/api/admin/analytics`

## Complete Code for All Files

See the plan file at C:\Proyectos_Academicos\ProteusProtection\docs\superpowers\plans\2026-07-22-admin-dashboard-plan.md
Read lines 722-1147 for the complete code of all 6 files.

Key points:
- `components/admin/admin-layout.tsx` - Main admin layout with sidebar (Overview, Analytics, Usuarios nav items), mobile drawer, header
- `app/admin/layout.tsx` - Simple wrapper that imports AdminLayout
- `components/admin/kpi-cards.tsx` - 5 KPI cards with anime.js entrance animation
- `components/admin/visit-chart.tsx` - CSS bar chart for daily visits
- `components/admin/top-pages.tsx` - Top 5 pages with progress bars
- `app/admin/page.tsx` - Overview page fetching from /api/admin/analytics

## Steps

1. Create all 6 files exactly as specified in the plan
2. Verify files are correct
3. Commit: `git add components/admin/ app/admin/ && git commit -m "feat: add admin layout, overview page with KPIs, chart, and top pages"`
