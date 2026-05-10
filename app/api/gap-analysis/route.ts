import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createSupabaseServer } from '@/lib/auth-server';
import { createSupabaseService } from '@/lib/auth-server';
import { checkEndpointRateLimit, rateLimitResponse } from '@/lib/subscription';
import { SKILL_PATHS } from '@/lib/skill-paths';

// ── Types ────────────────────────────────────────────────────────────────────

export interface MissingSkill {
  name:     string;
  pathId:   string;
  skillId:  string;
  learnUrl: string;
}

export interface GapAnalysisResult {
  jobId:              string;
  matchPercent:       number;
  matchedSkills:      string[];
  missingSkills:      MissingSkill[];
  allJdSkills:        string[];
  recommendedPaths:   string[];
  cached:             boolean;
}

// ── Build the canonical skill catalogue once at module load ──────────────────

interface CatalogueEntry {
  pathId:   string;
  pathTitle: string;
  skillId:  string;
  name:     string;
  topics:   string[];
  learnUrl: string;
}

const SKILL_CATALOGUE: CatalogueEntry[] = SKILL_PATHS.flatMap(path =>
  path.phases.flatMap(phase =>
    phase.skills.map(skill => ({
      pathId:    path.id,
      pathTitle: path.title,
      skillId:   skill.id,
      name:      skill.name,
      topics:    skill.topics,
      learnUrl:  `/learn/${path.id}`,
    }))
  )
);

// Lower-cased name + topics for fuzzy matching
const CATALOGUE_SEARCH = SKILL_CATALOGUE.map(e => ({
  ...e,
  searchText: [e.name, ...e.topics].join(' ').toLowerCase(),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function expiresAt(days = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** Match a JD skill string against the catalogue (returns best CatalogueEntry or null) */
function matchToCatalogue(jdSkill: string): CatalogueEntry | null {
  const needle = jdSkill.toLowerCase();
  // Exact name match first
  let hit = CATALOGUE_SEARCH.find(e => e.name.toLowerCase() === needle);
  if (hit) return hit;
  // Substring match on name
  hit = CATALOGUE_SEARCH.find(e =>
    e.name.toLowerCase().includes(needle) || needle.includes(e.name.toLowerCase())
  );
  if (hit) return hit;
  // Topic-level match (partial)
  const topicHit = CATALOGUE_SEARCH.find(e =>
    e.topics.some(t => t.toLowerCase().includes(needle) || needle.includes(t.toLowerCase()))
  );
  return topicHit ?? null;
}

// ── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  // Rate limit: 5 gap analyses per day
  const withinLimit = await checkEndpointRateLimit(user.id, 'gap-analysis');
  if (!withinLimit) return rateLimitResponse();

  // Validate input
  const body = await req.json().catch(() => null);
  if (!body?.jobId || !body?.description) {
    return NextResponse.json({ error: 'jobId and description are required' }, { status: 400 });
  }

  const jobId      = String(body.jobId).slice(0, 100);
  const jobTitle   = String(body.title   ?? '').slice(0, 200);
  const company    = String(body.company ?? '').slice(0, 200);
  const description = String(body.description).slice(0, 4000);

  // Check cache (same user + job within 7 days)
  const sbSvc = createSupabaseService();
  const { data: cached } = await sbSvc
    .from('job_gap_analyses')
    .select('match_percent,matched_skills,missing_skills,all_jd_skills,recommended_paths')
    .eq('user_id', user.id)
    .eq('job_id', jobId)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (cached) {
    return NextResponse.json({
      jobId,
      matchPercent:     cached.match_percent,
      matchedSkills:    cached.matched_skills,
      missingSkills:    cached.missing_skills as MissingSkill[],
      allJdSkills:      cached.all_jd_skills,
      recommendedPaths: cached.recommended_paths,
      cached:           true,
    } satisfies GapAnalysisResult);
  }

  // Load user's current skill progress
  const { data: progressRows } = await sb
    .from('skill_progress')
    .select('skill_id, status')
    .eq('user_id', user.id)
    .in('status', ['learning', 'needs_review', 'mastered']);

  const userSkillIds = new Set((progressRows ?? []).map(r => r.skill_id));

  // Extract skills from JD using GPT-4o-mini
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 });

  const client = new OpenAI({ apiKey });

  const extractionPrompt = `Extract the technical skills and technologies required from this job description.
Return a JSON array of skill strings only — no explanation, no markdown.
Include: programming languages, frameworks, tools, platforms, methodologies.
Limit to 20 most important skills.
Job title: ${jobTitle}
Description: ${description}`;

  let jdSkills: string[] = [];
  try {
    const completion = await client.chat.completions.create({
      model:       'gpt-4o-mini',
      messages:    [{ role: 'user', content: extractionPrompt }],
      temperature: 0.1,
      max_tokens:  400,
    });
    const raw = completion.choices[0]?.message?.content?.trim() ?? '[]';
    const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '').trim();
    jdSkills = JSON.parse(cleaned);
    if (!Array.isArray(jdSkills)) jdSkills = [];
    jdSkills = jdSkills.slice(0, 20).map(s => String(s).slice(0, 80));
  } catch {
    return NextResponse.json({ error: 'Skill extraction failed' }, { status: 502 });
  }

  // Match JD skills against catalogue and user progress
  const matchedSkills:  string[]      = [];
  const missingSkills:  MissingSkill[] = [];
  const pathHits = new Map<string, number>(); // pathId → hit count

  for (const jdSkill of jdSkills) {
    const catalogueMatch = matchToCatalogue(jdSkill);
    if (catalogueMatch) {
      pathHits.set(catalogueMatch.pathId, (pathHits.get(catalogueMatch.pathId) ?? 0) + 1);
      if (userSkillIds.has(catalogueMatch.skillId)) {
        matchedSkills.push(jdSkill);
      } else {
        missingSkills.push({
          name:     jdSkill,
          pathId:   catalogueMatch.pathId,
          skillId:  catalogueMatch.skillId,
          learnUrl: catalogueMatch.learnUrl,
        });
      }
    }
    // JD skills that don't map to catalogue are surfaced in allJdSkills only
  }

  const total = matchedSkills.length + missingSkills.length;
  const matchPercent = total > 0 ? Math.round((matchedSkills.length / total) * 100) : 0;

  // Top recommended paths (sorted by hit count, max 3)
  const recommendedPaths = [...pathHits.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([pathId]) => pathId);

  // Cache result in Supabase
  await sbSvc.from('job_gap_analyses').upsert({
    user_id:           user.id,
    job_id:            jobId,
    job_title:         jobTitle,
    company,
    match_percent:     matchPercent,
    matched_skills:    matchedSkills,
    missing_skills:    missingSkills,
    all_jd_skills:     jdSkills,
    recommended_paths: recommendedPaths,
    expires_at:        expiresAt(7),
  }, { onConflict: 'user_id,job_id' });

  return NextResponse.json({
    jobId,
    matchPercent,
    matchedSkills,
    missingSkills,
    allJdSkills:      jdSkills,
    recommendedPaths,
    cached:           false,
  } satisfies GapAnalysisResult);
}
