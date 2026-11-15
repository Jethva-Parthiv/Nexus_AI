-- ============================================================
-- Nexus_AI Database Setup Script
-- Database user: nexusai
-- Password:      nexusai@123
-- Databases:     auth_db, nexusai_provider
-- ============================================================

-- 1. Create dedicated user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE rolname = 'nexusai') THEN
      CREATE USER nexusai WITH PASSWORD 'nexusai@123';
   ELSE
      ALTER USER nexusai WITH PASSWORD 'nexusai@123';
   END IF;
END
$do$;

-- 2. Create Databases
-- (Note: If running in pgAdmin or psql, run CREATE DATABASE commands outside transaction blocks if needed)
SELECT 'CREATE DATABASE auth_db OWNER nexusai'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_db')\gexec

SELECT 'CREATE DATABASE nexusai_provider OWNER nexusai'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nexusai_provider')\gexec

-- 3. Grant privileges
GRANT ALL PRIVILEGES ON DATABASE auth_db TO nexusai;
GRANT ALL PRIVILEGES ON DATABASE nexusai_provider TO nexusai;

-- 4. Grant schema permissions for auth_db (PostgreSQL 15+ requirement)
\c auth_db
GRANT ALL ON SCHEMA public TO nexusai;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nexusai;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nexusai;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nexusai;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO nexusai;

-- 5. Grant schema permissions for nexusai_provider
\c nexusai_provider
GRANT ALL ON SCHEMA public TO nexusai;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nexusai;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nexusai;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nexusai;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO nexusai;
