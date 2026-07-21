-- lib/db/seed/001_plans.sql
-- Insert plans
INSERT INTO plans (name, slug, price_monthly, trial_days) VALUES
  ('Personal', 'personal', 4.99, 14),
  ('Familiar', 'familiar', 9.99, 14),
  ('Empresas', 'empresas', 24.99, 30)
ON CONFLICT (name) DO NOTHING;

-- Insert features for Personal plan
INSERT INTO plan_features (plan_id, feature_key, enabled, config) VALUES
  ((SELECT id FROM plans WHERE slug = 'personal'), 'shield', true, '{"max_devices": 1}'),
  ((SELECT id FROM plans WHERE slug = 'personal'), 'tune', true, '{}'),
  ((SELECT id FROM plans WHERE slug = 'personal'), 'vault', true, '{"max_entries": 50}'),
  ((SELECT id FROM plans WHERE slug = 'personal'), 'guard', false, '{}'),
  ((SELECT id FROM plans WHERE slug = 'personal'), 'vpn', false, '{}'),
  ((SELECT id FROM plans WHERE slug = 'personal'), 'admin_panel', false, '{}')
ON CONFLICT (plan_id, feature_key) DO NOTHING;

-- Insert features for Familiar plan
INSERT INTO plan_features (plan_id, feature_key, enabled, config) VALUES
  ((SELECT id FROM plans WHERE slug = 'familiar'), 'shield', true, '{"max_devices": 5}'),
  ((SELECT id FROM plans WHERE slug = 'familiar'), 'tune', true, '{}'),
  ((SELECT id FROM plans WHERE slug = 'familiar'), 'vault', true, '{"max_entries": -1}'),
  ((SELECT id FROM plans WHERE slug = 'familiar'), 'guard', true, '{}'),
  ((SELECT id FROM plans WHERE slug = 'familiar'), 'vpn', true, '{"unlimited": true}'),
  ((SELECT id FROM plans WHERE slug = 'familiar'), 'admin_panel', false, '{}')
ON CONFLICT (plan_id, feature_key) DO NOTHING;

-- Insert features for Empresas plan
INSERT INTO plan_features (plan_id, feature_key, enabled, config) VALUES
  ((SELECT id FROM plans WHERE slug = 'empresas'), 'shield', true, '{"max_devices": -1}'),
  ((SELECT id FROM plans WHERE slug = 'empresas'), 'tune', true, '{}'),
  ((SELECT id FROM plans WHERE slug = 'empresas'), 'vault', true, '{"max_entries": -1}'),
  ((SELECT id FROM plans WHERE slug = 'empresas'), 'guard', true, '{}'),
  ((SELECT id FROM plans WHERE slug = 'empresas'), 'vpn', true, '{"unlimited": true}'),
  ((SELECT id FROM plans WHERE slug = 'empresas'), 'admin_panel', true, '{}')
ON CONFLICT (plan_id, feature_key) DO NOTHING;
