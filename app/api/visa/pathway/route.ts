import { NextRequest, NextResponse } from 'next/server';
import { requireSubscription, recordUsage, checkEndpointRateLimit } from '@/lib/subscription';
import { rateLimitResponse } from '@/lib/auth-server';
import { analysePathways } from '@/lib/visa-pathway';
import type {
  PathwayInput,
  AgeBracket,
  EnglishLevel,
  EducationLevel,
  StateCode,
} from '@/lib/visa-pathway';
import type { VisaStatus } from '@/lib/visa-rules';

const VALID_VISA:    VisaStatus[]     = ['outside','student','graduate','working','resident','unsure'];
const VALID_AGE:     AgeBracket[]     = ['u25','25-32','33-39','40-44','45+'];
const VALID_ENGLISH: EnglishLevel[]   = ['competent','proficient','superior'];
const VALID_EDU:     EducationLevel[] = ['doctorate','bachelor-or-master','diploma','aqf-recognised','other'];
const VALID_STATE:   StateCode[]      = ['NSW','VIC','QLD','WA','SA','TAS','ACT','NT'];

export async function POST(req: NextRequest) {
  const auth = await requireSubscription();
  if (auth instanceof NextResponse) return auth;

  if (!(await checkEndpointRateLimit(auth.user.id, 'visa-pathway'))) return rateLimitResponse();

  let body: Partial<PathwayInput>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  // Validate every field — pathway logic assumes well-formed inputs
  const {
    currentVisa, anzsco, ageBracket, experienceYears,
    englishLevel, educationLevel, salary, state,
  } = body;

  if (!currentVisa     || !VALID_VISA.includes(currentVisa))         return badField('currentVisa');
  if (!anzsco          || !/^\d{6}$/.test(anzsco))                   return badField('anzsco');
  if (!ageBracket      || !VALID_AGE.includes(ageBracket))           return badField('ageBracket');
  if (typeof experienceYears !== 'number' || experienceYears < 0 || experienceYears > 50) return badField('experienceYears');
  if (!englishLevel    || !VALID_ENGLISH.includes(englishLevel))     return badField('englishLevel');
  if (!educationLevel  || !VALID_EDU.includes(educationLevel))       return badField('educationLevel');
  if (typeof salary !== 'number' || salary < 0 || salary > 1_000_000) return badField('salary');
  if (!state           || !VALID_STATE.includes(state))              return badField('state');

  const input: PathwayInput = {
    currentVisa, anzsco, ageBracket,
    experienceYears: Math.trunc(experienceYears),
    englishLevel, educationLevel,
    salary: Math.trunc(salary),
    state,
  };

  const analysis = analysePathways(input);

  void recordUsage(auth.user.id, 'visa-pathway');

  return NextResponse.json({ input, analysis });
}

function badField(field: string) {
  return NextResponse.json({ error: `Invalid or missing field: ${field}` }, { status: 400 });
}
