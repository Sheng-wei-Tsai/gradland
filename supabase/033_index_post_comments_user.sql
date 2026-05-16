-- Speed up comment-ownership lookups in `app/api/comments/[id]/route.ts`
-- (DELETE/PATCH filter by user_id to enforce ownership before mutating).
-- Existing indexes cover (post_slug, created_at) and (parent_id) but not
-- (user_id), so the auth check is a sequential scan as the table grows.
--
-- video_progress already covers (user_id, video_id) via the UNIQUE
-- constraint in migration 006, so no separate index is needed there.

CREATE INDEX IF NOT EXISTS post_comments_user_idx
  ON public.post_comments (user_id);
