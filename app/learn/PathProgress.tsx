'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { SKILL_PATHS } from '@/lib/skill-paths';
import { SKILL_CONTENT } from '@/lib/skill-content';

const TOPIC_KEY = 'skill_topics_checked';

function totalTopicsForPath(pathId: string): number {
  const path = SKILL_PATHS.find(p => p.id === pathId);
  if (!path) return 0;
  return path.phases.flatMap(ph => ph.skills).reduce((sum, skill) => {
    const rich = SKILL_CONTENT[skill.id];
    return sum + (rich?.topics?.length ?? skill.topics.length);
  }, 0);
}

export default function PathProgress({ pathId }: { pathId: string }) {
  const { user } = useAuth();
  const [checked, setChecked] = useState<number | null>(null);
  const total = totalTopicsForPath(pathId);

  useEffect(() => {
    if (user) {
      supabase
        .from('skill_progress')
        .select('checked_topics')
        .eq('user_id', user.id)
        .eq('path_id', pathId)
        .then(({ data }) => {
          if (data) {
            setChecked(data.reduce((sum, r) => sum + (r.checked_topics?.length ?? 0), 0));
          }
        });
    } else {
      try {
        const stored: Record<string, boolean> = JSON.parse(localStorage.getItem(TOPIC_KEY) ?? '{}');
        const count = Object.keys(stored).filter(k => k.startsWith(`${pathId}:`) && stored[k]).length;
        setChecked(count);
      } catch {
        setChecked(0);
      }
    }
  }, [user, pathId]);

  if (checked === null || total === 0) return null;

  return (
    <span style={{ fontSize: '0.78rem', color: checked > 0 ? 'var(--terracotta)' : 'var(--text-muted)' }}>
      {checked} / {total} topics
    </span>
  );
}
