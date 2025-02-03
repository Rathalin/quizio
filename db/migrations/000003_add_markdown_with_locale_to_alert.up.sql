BEGIN;

CREATE TABLE alert_new (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  order_index INT NOT NULL DEFAULT 0,
  markdown_de TEXT NOT NULL,
  markdown_en TEXT NOT NULL,
  severity TEXT NOT NULL,
  image_url TEXT,
  image_size TEXT,
  is_active BOOLEAN NOT NULL,
  visible_to TEXT NOT NULL DEFAULT 'everyone'
);

INSERT INTO alert_new (id, uuid, created_at, updated_at, order_index, markdown_de, markdown_en, severity, image_url, image_size, is_active, visible_to)
SELECT id, uuid, created_at, updated_at, order_index, markdown_content, markdown_content, severity, image_url, image_size, is_active, visible_to FROM alert;

DROP TABLE alert;
ALTER TABLE alert_new RENAME TO alert;
 
COMMIT;
