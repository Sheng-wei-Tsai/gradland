# Feature: AU IT Ecosystem Map

**Priority:** 🔴 High
**Status:** 🔲 Not started
**Branch:** `feature/au-insights`
**Started:** —
**Shipped:** —

---

## Goal

Most CS grads apply to any company that posts a job without understanding *why* their role exists in the broader industry. This feature explains the four-layer structure of the Australian IT ecosystem — who builds software, who connects it, who customises it, and who buys it — so job seekers can target the right layer for their skills, values, and career goals.

Understanding this map transforms how a grad thinks about their application strategy: a software engineer who prefers clean greenfield product work should aim at Layer 1 (vendors), while someone who wants variety and client exposure is better suited to Layer 3 (consultancies).

---

## The Four-Layer Model

### Layer 1 — Software Vendors ("Who Builds")
Companies that create software products sold to other businesses.
- **AU Examples:** Atlassian (Jira/Confluence), Canva, SafetyCulture, Rokt, Envato
- **Global with AU offices:** Workday, Salesforce, ServiceNow, SAP
- **Roles:** Product engineers, platform engineers, R&D, SRE
- **What it's like:** Product-focused engineering, high ownership, roadmap-driven work
- **Career upside:** Learn how real SaaS is built; best path to senior IC or tech lead
- **Competition:** High — these are the most desirable AU employers

### Layer 2 — System Integrators ("Who Connects")
Companies that connect and integrate vendor software into enterprise environments. They don't build the product — they wire everything together.
- **AU Examples:** DATACOM, DXC Technology, Fujitsu AU
- **Global with AU presence:** Hewlett Packard Enterprise, IBM GTS, Capgemini
- **Roles:** Cloud/infrastructure engineers, integration architects, migration specialists
- **What it's like:** Project-based work, client sites, heavy enterprise tooling (AWS, Azure, SAP)
- **Career upside:** Broad exposure to enterprise architecture; good for moving into cloud or solutions architect roles
- **Watch out for:** Can be more maintenance than build; advancement depends on certifications + tenure

### Layer 3 — Consultancies ("Who Customises")
Companies hired to customise vendor software for end clients, run transformation programs, or advise on technology strategy.
- **AU Examples:** Deloitte Digital, Accenture, KPMG Digital, PwC Consulting, FDM Group
- **Roles:** Graduate analyst, developer, business analyst, technology consultant
- **What it's like:** High variety (multiple clients per year), strong grad programs, lots of Jira/Confluence/ServiceNow customisation
- **Career upside:** Exposure to many industries fast; good for building commercial awareness; structured promotions
- **Watch out for:** Billable-hours culture; risk of staying too long and only knowing how to customise, not build

### Layer 4 — End Consumers ("Who Buys")
Large non-tech organisations with internal IT teams that consume software from the other three layers.
- **AU Examples:** Medibank, Commonwealth Bank, Woolworths, Queensland Government, Telstra, AGL
- **Roles:** Internal developer, DevOps engineer, business analyst, IT support, data analyst
- **What it's like:** Stable, risk-averse, legacy stack, long ship cycles
- **Career upside:** Work-life balance, stability, visa-friendly; a good base while upskilling
- **Watch out for:** IT is a cost centre not a profit driver; innovation is slow; promotion can take years

---

## How to Use This Map as a Job Seeker

| Your Goal | Best Layer |
|-----------|-----------|
| Build real product, high ownership | Layer 1 (Vendors) |
| Certifications + cloud infra career | Layer 2 (Integrators) |
| Variety, client exposure, fast promotion | Layer 3 (Consultancies) |
| Stability while on a visa / upskilling | Layer 4 (End Consumers) |

**Flow of money in the ecosystem:**  
End Consumer pays Consultancy to implement Vendor software via a System Integrator.  
Each layer takes margin. Layer 1 has the highest margins. Layer 4 has the most headcount.

---

## Acceptance Criteria

- [ ] `/au-insights` page — second tab labelled "IT Ecosystem"
- [ ] Four-layer diagram rendered as stacked visual flow (top → bottom: Vendors → Integrators → Consultancies → Consumers)
- [ ] Each layer has: colour-coded accent, AU example companies listed, role examples, career upside/watch-out
- [ ] Arrow or visual connection between layers showing the flow of money/work
- [ ] "How to use this map" table rendered cleanly on mobile
- [ ] No auth required

---

## Affected Files

| File | Action | Notes |
|------|--------|-------|
| `app/au-insights/page.tsx` | Modify | Add ecosystem tab |
| `app/au-insights/ITEcosystem.tsx` | Create | Client component with the four-layer visual |

---

## Implementation Notes

- The four-layer visual can be a flex column with connecting arrows using CSS borders — no SVG library needed
- Colour scheme suggestion: each layer gets one of the site's accent colours
  - Layer 1 (Vendors): `var(--terracotta)` 
  - Layer 2 (Integrators): `var(--gold)` 
  - Layer 3 (Consultancies): `var(--vermilion)` 
  - Layer 4 (Consumers): `var(--text-muted)`
- Company name chips: styled `<span>` with `background: #f5f0eb; border-radius: 4px; padding: 2px 8px`

---

## Senior Dev Test Checklist

### Functional
- [ ] Four layers render in correct top-to-bottom order
- [ ] "How to Use" table readable on 375px mobile
- [ ] Company names don't overflow on small screens

### Build & Types
- [ ] `npm run build` passes

---

## Notes / History

- **2026-04-06** — Feature spec created from industry-relationship.PNG (IT Ecosystem diagram from AU Career Forum by Jen Liu)
- Model: Software Vendors → System Integrators → Consultancies → End Consumers
