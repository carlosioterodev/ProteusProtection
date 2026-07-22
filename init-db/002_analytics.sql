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
