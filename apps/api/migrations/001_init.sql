CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 full_name VARCHAR(100) NOT NULL,
 email VARCHAR(255) NOT NULL UNIQUE,
 password_hash TEXT NOT NULL,
 role VARCHAR(20) NOT NULL CHECK(role IN ('ADMIN','SUPERVISOR','TECHNICIAN')),
 is_active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS work_orders(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 title VARCHAR(100) NOT NULL,
 description VARCHAR(500),
 priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK(priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
 status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','IN_PROGRESS','COMPLETED','CANCELLED')),
 technician_id UUID REFERENCES users(id),
 created_by UUID NOT NULL REFERENCES users(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_orders_technician ON work_orders(technician_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON work_orders(status);
CREATE TABLE IF NOT EXISTS work_order_events(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
 actor_id UUID NOT NULL REFERENCES users(id),
 previous_status VARCHAR(20) NOT NULL,
 new_status VARCHAR(20) NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_order ON work_order_events(work_order_id,created_at DESC);
