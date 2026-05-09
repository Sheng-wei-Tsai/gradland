# Supabase Migrations

Migrations are applied in filename order. Each file is applied exactly once to the production database.

## Numbering rule

**Never renumber or modify an already-applied migration.** Supabase tracks applied migrations by filename; renaming breaks idempotency checks.

For new migrations, use the next unused prefix. Current state:

| Prefix | File | Status |
|--------|------|--------|
| 001–019 | Various schema | Applied |
| 020 | `020_job_listings.sql` | Applied |
| 020 | `020_jobs_v2.sql` | Applied ⚠️ duplicate prefix — do not repeat |
| 021–026 | Various schema | Applied |
| 027 | `027_stripe_events.sql` | Pending |
| 028 | `028_job_listings_rls.sql` | Pending |
| 029 | `029_rate_limits.sql` | Pending |

**Next free prefix: 030**

## Known collision

`020_job_listings.sql` and `020_jobs_v2.sql` share the `020` prefix. Both have been applied manually; the collision does not affect Supabase CLI `db push` because that command applies all files not yet tracked. Do not add another `020_` file.

## Applying migrations

```bash
# Local dev
supabase db reset          # drop + recreate from schema.sql + all migrations

# Production (careful — irreversible)
supabase db push           # applies unapplied migrations only
```

## RLS policy

Every new table must:
1. `ALTER TABLE … ENABLE ROW LEVEL SECURITY;`
2. Define at least one `CREATE POLICY` (deny-all is acceptable for service-role-only tables).
