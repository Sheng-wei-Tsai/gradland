import { describe, it, expect } from 'vitest';
import { calculatePoints, analysePathways } from '@/lib/visa-pathway';
import type { PathwayInput } from '@/lib/visa-pathway';
import { CSIT_2025, SSIT_2025 } from '@/lib/visa-rules';

// Typical software-developer profile: 70 base points, on CSOL, NSW resident.
// Base breakdown: age 25-32 (30) + proficient English (10) + bachelor (15)
//                + 3 yr experience (10) + salary above CSIT (5) = 70
const BASE: PathwayInput = {
  currentVisa:    'graduate',
  anzsco:         '261313', // Software Engineer — on CSOL
  ageBracket:     '25-32',
  experienceYears: 3,
  englishLevel:   'proficient',
  educationLevel: 'bachelor-or-master',
  salary:         CSIT_2025 + 5_000, // above CSIT, below SSIT → 5 bonus pts
  state:          'NSW',
};

// ── calculatePoints ──────────────────────────────────────────────────────────

describe('calculatePoints', () => {
  it('returns correct base for baseline profile', () => {
    const pts = calculatePoints(BASE);
    expect(pts.base).toBe(70);
    expect(pts.withState).toBe(75);    // +5 for 190 nomination
    expect(pts.withRegional).toBe(85); // +15 for 491 regional
  });

  it('breakdown includes Age, English, Education, and experience entries', () => {
    const { breakdown } = calculatePoints(BASE);
    const cats = breakdown.map(b => b.category);
    expect(cats.some(c => c.includes('Age'))).toBe(true);
    expect(cats.some(c => c.includes('English'))).toBe(true);
    expect(cats.some(c => c.includes('Education'))).toBe(true);
    expect(cats.some(c => c.includes('experience'))).toBe(true);
  });

  describe('age brackets', () => {
    it('u25 gives 25 age points', () => {
      // 25 + 10 + 15 + 10 + 5 = 65
      expect(calculatePoints({ ...BASE, ageBracket: 'u25' }).base).toBe(65);
    });

    it('33-39 gives 25 age points', () => {
      expect(calculatePoints({ ...BASE, ageBracket: '33-39' }).base).toBe(65);
    });

    it('40-44 gives 15 age points', () => {
      // 15 + 10 + 15 + 10 + 5 = 55
      expect(calculatePoints({ ...BASE, ageBracket: '40-44' }).base).toBe(55);
    });

    it('45+ gives 0 age points', () => {
      // 0 + 10 + 15 + 10 + 5 = 40
      expect(calculatePoints({ ...BASE, ageBracket: '45+' }).base).toBe(40);
    });
  });

  describe('English levels', () => {
    it('competent gives 0 English points', () => {
      // 30 + 0 + 15 + 10 + 5 = 60
      expect(calculatePoints({ ...BASE, englishLevel: 'competent' }).base).toBe(60);
    });

    it('superior gives 20 English points', () => {
      // 30 + 20 + 15 + 10 + 5 = 80
      expect(calculatePoints({ ...BASE, englishLevel: 'superior' }).base).toBe(80);
    });
  });

  describe('education levels', () => {
    it('doctorate gives 20 education points', () => {
      // 30 + 10 + 20 + 10 + 5 = 75
      expect(calculatePoints({ ...BASE, educationLevel: 'doctorate' }).base).toBe(75);
    });

    it('diploma gives 10 education points', () => {
      // 30 + 10 + 10 + 10 + 5 = 65
      expect(calculatePoints({ ...BASE, educationLevel: 'diploma' }).base).toBe(65);
    });

    it('other gives 0 education points', () => {
      // 30 + 10 + 0 + 10 + 5 = 55
      expect(calculatePoints({ ...BASE, educationLevel: 'other' }).base).toBe(55);
    });
  });

  describe('experience thresholds', () => {
    it('0 years gives 0 experience points', () => {
      // 30 + 10 + 15 + 0 + 5 = 60
      expect(calculatePoints({ ...BASE, experienceYears: 0 }).base).toBe(60);
    });

    it('1 year gives 5 experience points', () => {
      // 30 + 10 + 15 + 5 + 5 = 65
      expect(calculatePoints({ ...BASE, experienceYears: 1 }).base).toBe(65);
    });

    it('5 years gives 15 experience points', () => {
      // 30 + 10 + 15 + 15 + 5 = 75
      expect(calculatePoints({ ...BASE, experienceYears: 5 }).base).toBe(75);
    });

    it('8 years gives 20 experience points', () => {
      // 30 + 10 + 15 + 20 + 5 = 80
      expect(calculatePoints({ ...BASE, experienceYears: 8 }).base).toBe(80);
    });
  });

  describe('salary bonus', () => {
    it('salary >= SSIT gives 10 bonus points', () => {
      // 30 + 10 + 15 + 10 + 10 = 75
      expect(calculatePoints({ ...BASE, salary: SSIT_2025 }).base).toBe(75);
    });

    it('salary below CSIT gives 0 bonus and no Salary entry in breakdown', () => {
      // 30 + 10 + 15 + 10 + 0 = 65
      const pts = calculatePoints({ ...BASE, salary: CSIT_2025 - 1 });
      expect(pts.base).toBe(65);
      expect(pts.breakdown.some(b => b.category.includes('Salary'))).toBe(false);
    });
  });
});

// ── analysePathways ──────────────────────────────────────────────────────────

describe('analysePathways', () => {
  it('returns all five visa subclasses', () => {
    const result = analysePathways(BASE);
    const codes = result.pathways.map(p => p.visa);
    expect(codes).toContain('189');
    expect(codes).toContain('190');
    expect(codes).toContain('491');
    expect(codes).toContain('482');
    expect(codes).toContain('186');
  });

  it('includes a computedAt ISO timestamp', () => {
    const result = analysePathways(BASE);
    expect(Date.parse(result.computedAt)).not.toBeNaN();
  });

  describe('subclass 189 — Skilled Independent', () => {
    it('eligible when points >= 70 and occupation on CSOL', () => {
      const visa = analysePathways(BASE).pathways.find(p => p.visa === '189')!;
      expect(visa.verdict).toBe('eligible');
      expect(visa.missing).toHaveLength(0);
    });

    it('close when base points in [60, 70)', () => {
      // salary below CSIT removes 5 bonus pts → base = 65 (close: ≥60 but <70)
      const visa = analysePathways({ ...BASE, salary: CSIT_2025 - 1 })
        .pathways.find(p => p.visa === '189')!;
      expect(visa.verdict).toBe('close');
    });

    it('blocked when occupation not on CSOL', () => {
      const visa = analysePathways({ ...BASE, anzsco: '999999' })
        .pathways.find(p => p.visa === '189')!;
      expect(visa.verdict).toBe('blocked');
      expect(visa.missing.some(m => m.includes('CSOL'))).toBe(true);
    });
  });

  describe('subclass 190 — State Nominated', () => {
    it('eligible-with-nomination when withState >= 65, CSOL, and state available', () => {
      // BASE: withState=75, NSW nominates 261313
      const visa = analysePathways(BASE).pathways.find(p => p.visa === '190')!;
      expect(visa.verdict).toBe('eligible-with-nomination');
    });

    it('blocked when chosen state does not nominate the ANZSCO', () => {
      // 263211 (ICT QA Engineer) → prefix '2632' → only NSW/VIC/QLD/TAS — WA excluded
      const visa = analysePathways({ ...BASE, anzsco: '263211', state: 'WA' })
        .pathways.find(p => p.visa === '190')!;
      expect(visa.verdict).toBe('blocked');
      expect(visa.missing.some(m => m.includes('WA'))).toBe(true);
    });
  });

  describe('subclass 491 — Skilled Work Regional', () => {
    it('eligible-with-nomination when withRegional >= 65 and state available', () => {
      // BASE: withRegional=85, NSW nominates 261313
      const visa = analysePathways(BASE).pathways.find(p => p.visa === '491')!;
      expect(visa.verdict).toBe('eligible-with-nomination');
    });

    it('includes timeToEligibility mentioning 491', () => {
      const visa = analysePathways(BASE).pathways.find(p => p.visa === '491')!;
      expect(visa.timeToEligibility).toContain('491');
    });
  });

  describe('subclass 482 — Skills in Demand', () => {
    it('eligible when CSOL, salary >= CSIT, and experience >= 1yr', () => {
      const visa = analysePathways(BASE).pathways.find(p => p.visa === '482')!;
      expect(visa.verdict).toBe('eligible');
    });

    it('blocked when salary < CSIT', () => {
      const visa = analysePathways({ ...BASE, salary: CSIT_2025 - 1 })
        .pathways.find(p => p.visa === '482')!;
      expect(visa.verdict).toBe('blocked');
      expect(visa.missing.some(m => m.includes('CSIT'))).toBe(true);
    });

    it('blocked when occupation not on CSOL', () => {
      const visa = analysePathways({ ...BASE, anzsco: '999999' })
        .pathways.find(p => p.visa === '482')!;
      expect(visa.verdict).toBe('blocked');
    });

    it('visaName contains "Specialist Skills" when salary >= SSIT', () => {
      const visa = analysePathways({ ...BASE, salary: SSIT_2025 })
        .pathways.find(p => p.visa === '482')!;
      expect(visa.visaName).toContain('Specialist Skills');
    });

    it('visaName contains "Core Skills" when CSIT <= salary < SSIT', () => {
      const visa = analysePathways(BASE).pathways.find(p => p.visa === '482')!;
      expect(visa.visaName).toContain('Core Skills');
    });
  });

  describe('subclass 186 — Employer Nomination Scheme', () => {
    it('eligible via TRT when currentVisa=working and experience >= 2yr', () => {
      const visa = analysePathways({ ...BASE, currentVisa: 'working', experienceYears: 2 })
        .pathways.find(p => p.visa === '186')!;
      expect(visa.verdict).toBe('eligible');
      expect(visa.next).toContain('TRT');
    });

    it('eligible via Direct Entry when experience >= 3yr, CSOL, salary >= CSIT', () => {
      // BASE already satisfies: 3yr, 261313 (CSOL), salary > CSIT
      const visa = analysePathways(BASE).pathways.find(p => p.visa === '186')!;
      expect(visa.verdict).toBe('eligible');
    });

    it('blocked when experience < 1yr and salary < CSIT', () => {
      const visa = analysePathways({ ...BASE, experienceYears: 0, salary: CSIT_2025 - 10_000 })
        .pathways.find(p => p.visa === '186')!;
      expect(visa.verdict).toBe('blocked');
    });
  });

  describe('topPick and summary', () => {
    it('topPick.verdict is "eligible" when one or more pathways are eligible', () => {
      const result = analysePathways(BASE);
      expect(result.topPick.verdict).toBe('eligible');
    });

    it('summary is a non-empty string', () => {
      const result = analysePathways(BASE);
      expect(typeof result.summary).toBe('string');
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('summary contains "No subclass open" when every pathway is blocked', () => {
      const allBlocked: PathwayInput = {
        currentVisa:    'student',
        anzsco:         '999999', // not on CSOL
        ageBracket:     '45+',   // 0 age pts
        experienceYears: 0,
        englishLevel:   'competent',
        educationLevel: 'other',
        salary:         50_000,  // below CSIT
        state:          'WA',
      };
      const result = analysePathways(allBlocked);
      expect(result.summary).toContain('No subclass open');
    });
  });
});
