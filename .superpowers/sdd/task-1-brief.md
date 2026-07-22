# Task 1: Database Schema + Environment Config

**Files:**
- Create: `init-db/002_analytics.sql`
- Modify: `.env.example`

- [ ] **Step 1: Create analytics migration file**

```sql
-- init-db/002_analytics.sql
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  path VARCHAR(500) NOT NULL,
  browser VARCHAR(100),
  os VARCHAR(100),
  device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  screen_width INTEGER,
  screen_height INTEGER,
  ip_address INET,
  country VARCHAR(100),
  city VARCHAR(100),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  referrer VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_page_views_created_at ON page_views(created_at);
CREATE INDEX idx_page_views_path ON page_views(path);
CREATE INDEX idx_page_views_user_id ON page_views(user_id);
```

- [ ] **Step 2: Add ADMIN_EMAIL to .env.example**

Add at the end of `.env.example`:

```
# Admin Dashboard
ADMIN_EMAIL=admin@proteus.com
```

- [ ] **Step 3: Run migration**

```bash
psql $DATABASE_URL -f init-db/002_analytics.sql
```

Expected: Commands succeed, table `page_views` created.

- [ ] **Step 4: Commit**

```bash
git add init-db/002_analytics.sql .env.example
git commit -m "feat: add page_views schema and admin email config"
```
