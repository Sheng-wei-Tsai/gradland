import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  requireSubscription,
  checkEndpointRateLimit,
  rateLimitResponse,
  recordUsage,
} from '@/lib/subscription';
import { COMPANIES } from '@/app/au-insights/companies/data';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a senior career intelligence analyst specialising in the Australian IT job market. You have deep insider knowledge of tech company cultures, hiring practices, and what it takes to succeed as an international tech graduate in Australia.

Analyse the provided company profile data and generate a concise, practical career research brief for a job seeker preparing to apply or interview.

Return ONLY a JSON object with this exact structure:
{
  "culture": {
    "snapshot": "<2-3 sentence culture summary based on the Glassdoor data and known reputation>",
    "workStyle": "<WFH/hybrid/office-first — be specific about days if known>",
    "standout": "<one memorable, honest insight about what makes this workplace distinctive>"
  },
  "techStack": {
    "primary": ["<language or framework>"],
    "infrastructure": ["<cloud or devops tool>"],
    "interesting": "<one technically noteworthy aspect of how they build or scale>"
  },
  "interviewProcess": {
    "rounds": "<overview e.g. Online assessment → Technical phone screen → 2x coding rounds → values interview>",
    "style": "<what type of technical assessment: LeetCode-style, systems design, take-home, etc.>",
    "tips": ["<specific preparation tip>", "<tip 2>", "<tip 3>"]
  },
  "candidateProfile": {
    "ideal": "<2-sentence profile of their ideal hire for tech roles>",
    "mustHaves": ["<non-negotiable skill or trait>"],
    "niceToHaves": ["<differentiating bonus>"]
  },
  "forInternational": {
    "sponsorship": "<clear honest statement: do they sponsor 482 or PR, how competitive, any caveats>",
    "pathway": "<realistic description of the pathway for an international grad — timelines, typical conversion rates>"
  },
  "insiderTips": ["<non-obvious insight 1>", "<insight 2>", "<insight 3>"]
}

Be honest — include realistic challenges alongside positives. Return ONLY the JSON. No markdown fences, no preamble.`;

export interface CompanyResearch {
  culture: {
    snapshot: string;
    workStyle: string;
    standout: string;
  };
  techStack: {
    primary: string[];
    infrastructure: string[];
    interesting: string;
  };
  interviewProcess: {
    rounds: string;
    style: string;
    tips: string[];
  };
  candidateProfile: {
    ideal: string;
    mustHaves: string[];
    niceToHaves: string[];
  };
  forInternational: {
    sponsorship: string;
    pathway: string;
  };
  insiderTips: string[];
}

export async function POST(req: NextRequest) {
  // 1. Auth + global rate limit
  const auth = await requireSubscription();
  if (auth instanceof NextResponse) return auth;

  // 2. Per-endpoint rate limit
  const withinLimit = await checkEndpointRateLimit(auth.user.id, 'companies/research');
  if (!withinLimit) return rateLimitResponse();

  // 3. Parse + validate input
  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === 'string' ? body.slug.trim().slice(0, 100) : '';
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid company slug' }, { status: 400 });
  }

  const company = COMPANIES.find(c => c.slug === slug);
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  // 4. Build grounded context for Claude
  const context = [
    `Company: ${company.name} (${company.website})`,
    `Tier: ${company.tierLabel}`,
    `Location: ${company.auCity}, headcount: ${company.auHeadcount}`,
    `Founded: ${company.founded}`,
    `Glassdoor: ${company.glassdoor.rating}/5 (${company.glassdoor.reviews} reviews, ${company.glassdoor.recommendPct ?? 'N/A'}% recommend)`,
    `WFH policy: ${company.wfh}`,
    `Culture vibe: ${company.culture.vibe}`,
    `Culture pros: ${company.culture.pros.join('; ')}`,
    `Culture cons: ${company.culture.cons.join('; ')}`,
    `Interview style: ${company.culture.interviewStyle}`,
    `Tech stack: ${company.techStack.join(', ')}`,
    `Roles hired: ${company.roles.join(', ')}`,
    `Visa 482 sponsor: ${company.sponsorship.sponsors482 ? 'Yes' : 'No'}. ${company.sponsorship.notes}`,
    `Graduate salary: ${company.compensation.gradRange}`,
    `Mid-level salary: ${company.compensation.midRange}`,
  ].join('\n');

  // 5. Call Claude claude-sonnet-4-6 for high-quality interactive output
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1800,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: context }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const research = JSON.parse(text) as CompanyResearch;

    await recordUsage(auth.user.id, 'companies/research');

    return NextResponse.json(research);
  } catch {
    return NextResponse.json({ error: 'Failed to generate research brief' }, { status: 500 });
  }
}
