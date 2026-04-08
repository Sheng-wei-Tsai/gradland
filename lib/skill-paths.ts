// ─────────────────────────────────────────────────────────────
// IT Skill Pathways — curated learning paths for job seekers
// Each skill uses spaced repetition: review at day 1, 3, 7, 14, 30
// ─────────────────────────────────────────────────────────────

export type Resource = {
  title: string;
  url:   string;
  type:  'docs' | 'course' | 'video' | 'article' | 'practice';
  free:  boolean;
};

export type Skill = {
  id:             string;
  name:           string;
  description:    string;
  why:            string;   // why this gets you hired
  topics:         string[]; // concrete things to learn
  resources:      Resource[];
  project:        string;   // mini project to solidify the skill
  estimatedDays:  number;
};

export type Phase = {
  id:       string;
  title:    string;
  duration: string;
  summary:  string;
  skills:   Skill[];
};

export type SkillPath = {
  id:          string;
  title:       string;
  emoji:       string;
  description: string;
  timeline:    string;
  avgSalary:   string;
  demand:      'High' | 'Very High' | 'Medium';
  phases:      Phase[];
};

// ─── Spaced Repetition Schedule ───────────────────────────────
// Based on the Ebbinghaus forgetting curve + Leitner system
// Review count → days until next review
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30]; // days

export function getNextReviewDate(reviewCount: number): Date {
  const days = REVIEW_INTERVALS[Math.min(reviewCount, REVIEW_INTERVALS.length - 1)];
  const next = new Date();
  next.setDate(next.getDate() + days);
  next.setHours(9, 0, 0, 0); // remind at 9am
  return next;
}

export function getReviewLabel(reviewCount: number): string {
  const labels = ['1 day', '3 days', '7 days', '2 weeks', '30 days → Mastered!'];
  return labels[Math.min(reviewCount, labels.length - 1)];
}

// ─── PATH 1: Junior Frontend Developer ────────────────────────
const frontendPath: SkillPath = {
  id:          'junior-frontend',
  title:       'Junior Frontend Developer',
  emoji:       '🎨',
  description: 'Build beautiful, interactive web interfaces. The most in-demand entry-level path in Australia right now.',
  timeline:    '16 weeks',
  avgSalary:   'AUD $65,000–$85,000',
  demand:      'Very High',
  phases: [
    {
      id:       'phase-1',
      title:    'Web Foundations',
      duration: 'Weeks 1–4',
      summary:  'The non-negotiable basics. Every interviewer will test these.',
      skills: [
        {
          id: 'html-basics',
          name: 'HTML & Semantic Markup',
          description: 'The skeleton of every webpage. HTML defines structure and meaning — not just visual layout.',
          why: 'Interviewers check if you write semantic HTML (nav, main, article, section) rather than div soup. Affects accessibility and SEO.',
          topics: ['Document structure', 'Semantic elements', 'Forms & inputs', 'Accessibility attributes (alt, aria-label)', 'Meta tags & SEO basics'],
          resources: [
            { title: 'MDN HTML Basics', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', type: 'docs', free: true },
            { title: 'HTML Full Course — freeCodeCamp', url: 'https://www.youtube.com/watch?v=kUMe1FH4CHE', type: 'video', free: true },
            { title: 'HTML Reference', url: 'https://htmlreference.io', type: 'docs', free: true },
          ],
          project: 'Build a personal profile page with semantic HTML — include a nav, main content sections, a contact form, and proper heading hierarchy. No CSS yet.',
          estimatedDays: 3,
        },
        {
          id: 'css-fundamentals',
          name: 'CSS Fundamentals',
          description: 'Styling, typography, colours, box model, and the cascade. The skill that separates developers from good developers.',
          why: 'CSS is constantly tested in interviews. Most junior devs can\'t explain specificity or the box model — knowing this makes you stand out.',
          topics: ['Box model', 'Selectors & specificity', 'Colours & typography', 'Units (rem, em, %, px, vw)', 'Pseudo-classes & pseudo-elements', 'CSS variables', 'Transitions & animations'],
          resources: [
            { title: 'CSS Tricks — Complete Guide', url: 'https://css-tricks.com/guides/', type: 'docs', free: true },
            { title: 'Kevin Powell YouTube', url: 'https://www.youtube.com/@KevinPowell', type: 'video', free: true },
            { title: 'CSS Diner (selectors game)', url: 'https://flukeout.github.io', type: 'practice', free: true },
          ],
          project: 'Style your HTML profile page. Match a design from Dribbble as closely as possible. Focus on typography, spacing, and colour.',
          estimatedDays: 4,
        },
        {
          id: 'css-layout',
          name: 'CSS Layout (Flexbox + Grid)',
          description: 'The two modern systems for arranging elements on a page. Essential for building any real UI.',
          why: 'Nearly every frontend job listing mentions Flexbox and Grid. They\'re tested in coding assessments.',
          topics: ['Flexbox: axes, justify-content, align-items, flex-wrap', 'Grid: template columns/rows, grid-area, auto-fill', 'Responsive layout patterns', 'Position: relative, absolute, sticky, fixed'],
          resources: [
            { title: 'Flexbox Froggy (game)', url: 'https://flexboxfroggy.com', type: 'practice', free: true },
            { title: 'Grid Garden (game)', url: 'https://cssgridgarden.com', type: 'practice', free: true },
            { title: 'CSS Grid — Kevin Powell', url: 'https://www.youtube.com/watch?v=rg7Fvvl3taU', type: 'video', free: true },
          ],
          project: 'Build a responsive 3-column card layout (like a blog grid) that stacks to 1 column on mobile. Use CSS Grid for the layout and Flexbox inside each card.',
          estimatedDays: 4,
        },
        {
          id: 'javascript-basics',
          name: 'JavaScript Fundamentals',
          description: 'The programming language of the web. Makes pages interactive and handles logic.',
          why: 'The most tested topic in junior frontend interviews. You will be asked to reverse a string, filter an array, or explain closures.',
          topics: ['Variables (let, const)', 'Functions & arrow functions', 'Arrays & array methods (map, filter, reduce)', 'Objects & destructuring', 'DOM manipulation', 'Events & event listeners', 'Async/await & Promises', 'ES6+ features'],
          resources: [
            { title: 'JavaScript.info', url: 'https://javascript.info', type: 'docs', free: true },
            { title: 'Eloquent JavaScript (free book)', url: 'https://eloquentjavascript.net', type: 'course', free: true },
            { title: 'freeCodeCamp JS Algorithms', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', type: 'course', free: true },
          ],
          project: 'Build a to-do list app: add/remove/complete tasks, filter by status, persist to localStorage. No frameworks.',
          estimatedDays: 10,
        },
        {
          id: 'git-basics',
          name: 'Git & GitHub',
          description: 'Version control — how all professional developers manage code. Every job requires it.',
          why: 'Day 1 skill at any company. Not knowing Git is an immediate red flag to interviewers.',
          topics: ['init, add, commit, push, pull', 'Branching & merging', 'Pull requests', 'Resolving merge conflicts', '.gitignore', 'Writing good commit messages'],
          resources: [
            { title: 'Git — The Simple Guide', url: 'https://rogerdudler.github.io/git-guide/', type: 'docs', free: true },
            { title: 'Oh My Git! (game)', url: 'https://ohmygit.org', type: 'practice', free: true },
            { title: 'GitHub Skills', url: 'https://skills.github.com', type: 'course', free: true },
          ],
          project: 'Push all your previous projects to GitHub with clean commits. Write a README for each. Practice creating a branch, making changes, and merging via a pull request.',
          estimatedDays: 3,
        },
      ],
    },
    {
      id:       'phase-2',
      title:    'Modern Stack',
      duration: 'Weeks 5–10',
      summary:  'The tools Australian companies actually hire for. React + TypeScript is the dominant stack.',
      skills: [
        {
          id: 'react-fundamentals',
          name: 'React',
          description: 'The most popular JavaScript library for building UIs. Used by ~40% of all frontend jobs in Australia.',
          why: '9 out of 10 frontend job listings in Brisbane mention React. This is the single highest-leverage skill to learn.',
          topics: ['JSX syntax', 'Components (functional)', 'Props & state (useState)', 'useEffect', 'Lists & keys', 'Forms & controlled inputs', 'Component composition', 'React DevTools'],
          resources: [
            { title: 'React Docs (official)', url: 'https://react.dev/learn', type: 'docs', free: true },
            { title: 'Full React Course — Dave Gray', url: 'https://www.youtube.com/watch?v=RVFAyFWO4go', type: 'video', free: true },
            { title: 'Scrimba React Course', url: 'https://scrimba.com/learn/learnreact', type: 'course', free: false },
          ],
          project: 'Rebuild your to-do list in React. Add a weather widget using a free API. Deploy to Vercel.',
          estimatedDays: 10,
        },
        {
          id: 'typescript-basics',
          name: 'TypeScript',
          description: 'JavaScript with types. Catches bugs before they happen and makes code easier to read.',
          why: 'TypeScript is now expected in most professional React roles. Knowing it vs not knowing it is a $5–10k salary difference.',
          topics: ['Basic types (string, number, boolean, array)', 'Interfaces & type aliases', 'Optional properties', 'Union types', 'Generics basics', 'TypeScript with React (props typing)'],
          resources: [
            { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/', type: 'docs', free: true },
            { title: 'Total TypeScript — free lessons', url: 'https://www.totaltypescript.com/tutorials', type: 'course', free: true },
            { title: 'TypeScript Playground', url: 'https://www.typescriptlang.org/play', type: 'practice', free: true },
          ],
          project: 'Convert your React to-do list to TypeScript. Define interfaces for all your data shapes. Fix all type errors.',
          estimatedDays: 5,
        },
        {
          id: 'tailwind-css',
          name: 'Tailwind CSS',
          description: 'A utility-first CSS framework. Write styles directly in HTML classnames. Extremely fast once you know it.',
          why: 'Tailwind is mentioned in 40%+ of junior frontend job listings. It\'s now the default choice for new projects.',
          topics: ['Utility classes', 'Responsive prefixes (sm: md: lg:)', 'Dark mode (dark:)', 'Custom configuration', 'Component extraction with @apply'],
          resources: [
            { title: 'Tailwind Docs', url: 'https://tailwindcss.com/docs', type: 'docs', free: true },
            { title: 'Tailwind CSS Full Course', url: 'https://www.youtube.com/watch?v=lCxcTsOHrjo', type: 'video', free: true },
          ],
          project: 'Rebuild your profile page using Tailwind CSS only. Add dark mode support.',
          estimatedDays: 4,
        },
        {
          id: 'rest-apis',
          name: 'REST APIs & Data Fetching',
          description: 'How to communicate with backend services. Fetching, displaying, and handling data from external sources.',
          why: 'Every real app fetches data. You will absolutely be asked about this in interviews and coding assessments.',
          topics: ['HTTP methods (GET, POST, PUT, DELETE)', 'fetch() API', 'async/await patterns', 'Error handling', 'Loading states', 'JSON parsing', 'Environment variables for API keys'],
          resources: [
            { title: 'MDN Fetch API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API', type: 'docs', free: true },
            { title: 'REST API Tutorial', url: 'https://restapitutorial.com', type: 'docs', free: true },
            { title: 'Public APIs list', url: 'https://github.com/public-apis/public-apis', type: 'practice', free: true },
          ],
          project: 'Build a movie search app using the TMDB free API. Show results with a loading spinner and handle errors gracefully.',
          estimatedDays: 4,
        },
        {
          id: 'react-hooks-advanced',
          name: 'React Hooks (Advanced)',
          description: 'The more powerful hooks that make React components clean and efficient.',
          why: 'useCallback, useMemo, and useContext are commonly asked in interviews. Understanding them shows you\'re above average.',
          topics: ['useContext (global state)', 'useReducer', 'useCallback & useMemo (performance)', 'Custom hooks', 'useRef'],
          resources: [
            { title: 'React Hooks Deep Dive — Kent C. Dodds', url: 'https://kentcdodds.com/blog/react-hooks-pitfalls', type: 'article', free: true },
            { title: 'Official React Hooks Reference', url: 'https://react.dev/reference/react', type: 'docs', free: true },
          ],
          project: 'Build a multi-step form with useReducer. Add a theme toggle using useContext. Extract the form logic into a custom hook.',
          estimatedDays: 5,
        },
      ],
    },
    {
      id:       'phase-3',
      title:    'Production Ready',
      duration: 'Weeks 11–16',
      summary:  'The skills that separate candidates who get hired from those who don\'t.',
      skills: [
        {
          id: 'nextjs',
          name: 'Next.js',
          description: 'The React framework for production. Server-side rendering, routing, API routes, and deployment.',
          why: 'Most Brisbane companies using React are using Next.js. It\'s listed in ~60% of React job postings.',
          topics: ['App Router', 'Server vs Client Components', 'File-based routing', 'API routes', 'Data fetching (SSR, SSG, ISR)', 'Image optimisation', 'Deployment to Vercel'],
          resources: [
            { title: 'Next.js Docs', url: 'https://nextjs.org/docs', type: 'docs', free: true },
            { title: 'Next.js Full Course — Fireship', url: 'https://www.youtube.com/watch?v=Sklc_fQBmcs', type: 'video', free: true },
          ],
          project: 'Build a full blog with Next.js: MDX posts, dynamic routes, SSG for posts, a contact form API route. Deploy to Vercel.',
          estimatedDays: 8,
        },
        {
          id: 'testing-basics',
          name: 'Testing (Jest + React Testing Library)',
          description: 'Writing automated tests to prove your code works. Expected at all mid-size and large companies.',
          why: 'Listing "experience with testing" on your resume or GitHub immediately sets you apart from 80% of junior candidates.',
          topics: ['Unit tests with Jest', 'Component testing with RTL', 'Testing user interactions', 'Mocking API calls', 'Coverage reports'],
          resources: [
            { title: 'React Testing Library Docs', url: 'https://testing-library.com/docs/react-testing-library/intro/', type: 'docs', free: true },
            { title: 'Testing JavaScript — Kent C. Dodds', url: 'https://testingjavascript.com', type: 'course', free: false },
          ],
          project: 'Write tests for your to-do list React app. Test: adding an item, completing an item, filtering. Reach 80%+ coverage.',
          estimatedDays: 5,
        },
        {
          id: 'web-performance',
          name: 'Web Performance',
          description: 'Making websites load fast. Core Web Vitals are a ranking factor and a common interview topic.',
          why: 'Performance knowledge is rare in junior devs. Mentioning LCP, CLS, FID in an interview makes you memorable.',
          topics: ['Core Web Vitals (LCP, CLS, INP)', 'Lighthouse audits', 'Image optimisation', 'Code splitting & lazy loading', 'Bundle analysis'],
          resources: [
            { title: 'web.dev Performance', url: 'https://web.dev/performance/', type: 'docs', free: true },
            { title: 'PageSpeed Insights', url: 'https://pagespeed.web.dev', type: 'practice', free: true },
          ],
          project: 'Run Lighthouse on one of your projects. Identify the top 3 issues. Fix them. Screenshot your before/after scores.',
          estimatedDays: 3,
        },
        {
          id: 'portfolio-project',
          name: 'Portfolio Project',
          description: 'One polished, full-featured project that demonstrates everything you\'ve learned. This is what gets you interviews.',
          why: 'Recruiters look at your GitHub. One impressive project beats 10 tutorial clones. This is the most important thing you will build.',
          topics: ['Problem/solution framing (what does it solve?)', 'Clean code & README', 'Deployed & live', 'Mobile responsive', 'Using real data (API or database)', 'Good UX & design'],
          resources: [
            { title: 'How to build a portfolio project', url: 'https://www.freecodecamp.org/news/how-to-build-an-impressive-portfolio/', type: 'article', free: true },
            { title: 'Design inspiration — Dribbble', url: 'https://dribbble.com', type: 'practice', free: true },
          ],
          project: 'Build your capstone: ideas — expense tracker with charts, job application tracker, recipe app with AI, or a local events finder. Stack: Next.js + TypeScript + Supabase + Tailwind.',
          estimatedDays: 14,
        },
        {
          id: 'interview-prep',
          name: 'Interview Preparation',
          description: 'Technical and behavioural interview preparation specific to Australian companies.',
          why: 'Being technically skilled is only half the battle. Companies in Australia heavily weight cultural fit and communication.',
          topics: ['STAR method for behavioural questions', 'Reverse a string, FizzBuzz, array manipulation (always asked)', 'Explaining your projects clearly', 'Salary negotiation in Australia', 'Reading job descriptions intelligently', 'Questions to ask interviewers'],
          resources: [
            { title: 'LeetCode Easy Problems', url: 'https://leetcode.com/problemset/?difficulty=Easy', type: 'practice', free: true },
            { title: 'Frontend Interview Handbook', url: 'https://www.frontendinterviewhandbook.com', type: 'docs', free: true },
            { title: 'Glassdoor — Australian tech interviews', url: 'https://www.glassdoor.com.au', type: 'practice', free: true },
          ],
          project: 'Do 5 mock interviews with a friend or use Pramp.com. Record yourself explaining one of your projects in 2 minutes. Watch it back.',
          estimatedDays: 7,
        },
      ],
    },
  ],
};

// ─── PATH 2: Junior Full Stack Developer ──────────────────────
const fullstackPath: SkillPath = {
  id:          'junior-fullstack',
  title:       'Junior Full Stack Developer',
  emoji:       '⚡',
  description: 'Build both the frontend and backend. The most versatile role — small companies especially love full stack devs.',
  timeline:    '20 weeks',
  avgSalary:   'AUD $70,000–$90,000',
  demand:      'Very High',
  phases: [
    {
      id: 'phase-1',
      title: 'Frontend Foundation',
      duration: 'Weeks 1–6',
      summary: 'Complete the frontend foundations before touching backend.',
      skills: [
        { ...frontendPath.phases[0].skills[0] }, // HTML
        { ...frontendPath.phases[0].skills[2] }, // CSS Layout
        { ...frontendPath.phases[0].skills[3] }, // JavaScript
        { ...frontendPath.phases[0].skills[4] }, // Git
        { ...frontendPath.phases[1].skills[0] }, // React
        { ...frontendPath.phases[1].skills[1] }, // TypeScript
      ],
    },
    {
      id: 'phase-2',
      title: 'Backend & Databases',
      duration: 'Weeks 7–13',
      summary: 'The server side: APIs, databases, and authentication.',
      skills: [
        {
          id: 'nodejs-express',
          name: 'Node.js & Express',
          description: 'Run JavaScript on the server. Build REST APIs that your frontend can consume.',
          why: 'The most common backend stack in Australian startups. Same language as frontend = easier to switch contexts.',
          topics: ['Node.js runtime', 'Express routing', 'Middleware', 'Error handling', 'Environment variables', 'CORS', 'RESTful API design'],
          resources: [
            { title: 'Node.js Docs', url: 'https://nodejs.org/en/docs', type: 'docs', free: true },
            { title: 'Express.js Guide', url: 'https://expressjs.com/en/guide/routing.html', type: 'docs', free: true },
            { title: 'Node.js API Course — Dave Gray', url: 'https://www.youtube.com/watch?v=jivyItmsu18', type: 'video', free: true },
          ],
          project: 'Build a REST API for a blog: CRUD for posts, user registration, JWT authentication. Test with Postman.',
          estimatedDays: 8,
        },
        {
          id: 'postgresql',
          name: 'PostgreSQL & SQL',
          description: 'The most popular relational database. Powers most serious web applications.',
          why: 'SQL knowledge is required in ~70% of full stack job listings. Understanding databases makes you a much stronger developer.',
          topics: ['SELECT, INSERT, UPDATE, DELETE', 'JOINs (inner, left, right)', 'Indexes & performance', 'Relationships (one-to-many, many-to-many)', 'Transactions', 'SQL via Supabase'],
          resources: [
            { title: 'SQLBolt (interactive)', url: 'https://sqlbolt.com', type: 'practice', free: true },
            { title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com', type: 'docs', free: true },
            { title: 'Supabase Quickstart', url: 'https://supabase.com/docs/guides/getting-started', type: 'docs', free: true },
          ],
          project: 'Add a PostgreSQL database to your blog API. Store posts and users in a real database. Add a Supabase integration.',
          estimatedDays: 7,
        },
        {
          id: 'auth-security',
          name: 'Authentication & Security',
          description: 'How users log in safely. Passwords, sessions, tokens, and the most common security mistakes.',
          why: 'Security vulnerabilities are the #1 cause of real-world incidents. Knowing auth properly impresses senior engineers in interviews.',
          topics: ['JWT (JSON Web Tokens)', 'bcrypt password hashing', 'OAuth (GitHub, Google)', 'HTTP-only cookies', 'CORS configuration', 'OWASP Top 10 basics'],
          resources: [
            { title: 'Supabase Auth Docs', url: 'https://supabase.com/docs/guides/auth', type: 'docs', free: true },
            { title: 'JWT.io', url: 'https://jwt.io', type: 'docs', free: true },
            { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/', type: 'docs', free: true },
          ],
          project: 'Add authentication to your blog API. Hash passwords, issue JWTs, protect routes. Add Google OAuth.',
          estimatedDays: 6,
        },
      ],
    },
    {
      id: 'phase-3',
      title: 'Full Stack Integration',
      duration: 'Weeks 14–20',
      summary: 'Bring it all together: deploy full-stack apps and get job ready.',
      skills: [
        { ...frontendPath.phases[2].skills[0] }, // Next.js
        {
          id: 'docker-basics',
          name: 'Docker Basics',
          description: 'Package your app so it runs the same everywhere. Used in most professional workflows.',
          why: 'Docker is mentioned in 30% of full stack job listings. Being able to containerise an app is a strong differentiator.',
          topics: ['Dockerfile', 'docker build & run', 'docker-compose', 'Environment variables in containers', 'Deploying to Railway or Render'],
          resources: [
            { title: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/', type: 'docs', free: true },
            { title: 'Docker Tutorial — TechWorld with Nana', url: 'https://www.youtube.com/watch?v=3c-iBn73dDE', type: 'video', free: true },
          ],
          project: 'Dockerise your blog API + PostgreSQL with docker-compose. One command to start the whole stack.',
          estimatedDays: 5,
        },
        { ...frontendPath.phases[2].skills[3] }, // Portfolio Project
        { ...frontendPath.phases[2].skills[4] }, // Interview Prep
      ],
    },
  ],
};

// ─── PATH 3: Junior Backend Developer ─────────────────────────
const backendPath: SkillPath = {
  id:          'junior-backend',
  title:       'Junior Backend Developer',
  emoji:       '⚙️',
  description: 'Build the systems that power apps: APIs, databases, authentication, and infrastructure.',
  timeline:    '18 weeks',
  avgSalary:   'AUD $70,000–$90,000',
  demand:      'High',
  phases: [
    {
      id: 'phase-1',
      title: 'Programming Fundamentals',
      duration: 'Weeks 1–5',
      summary: 'Solid programming foundations in Python or Node.js.',
      skills: [
        { ...frontendPath.phases[0].skills[4] }, // Git
        {
          id: 'python-basics',
          name: 'Python Fundamentals',
          description: 'One of the two dominant backend languages in Australia (the other being JavaScript/Node.js).',
          why: 'Python is used for backend, data pipelines, scripting, and AI. Extremely in demand at Brisbane tech companies.',
          topics: ['Variables, functions, classes', 'Lists, dicts, sets', 'File I/O', 'Error handling', 'Modules & packages', 'Virtual environments', 'pip & pyproject.toml'],
          resources: [
            { title: 'Python Docs Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'docs', free: true },
            { title: 'Automate the Boring Stuff (free book)', url: 'https://automatetheboringstuff.com', type: 'course', free: true },
            { title: 'Codecademy Python', url: 'https://www.codecademy.com/learn/learn-python-3', type: 'course', free: false },
          ],
          project: 'Build a command-line tool: either a file organiser, a URL shortener, or an expense tracker with JSON persistence.',
          estimatedDays: 10,
        },
        {
          id: 'data-structures',
          name: 'Data Structures & Algorithms',
          description: 'The theory of how to store and process data efficiently. Required for technical interviews.',
          why: 'Most backend technical interviews test algorithms. You cannot skip this if you want to pass screening rounds at serious companies.',
          topics: ['Arrays, linked lists', 'Stacks & queues', 'Hash maps', 'Binary search', 'Sorting algorithms', 'Big O notation', 'Trees & graphs basics'],
          resources: [
            { title: 'NeetCode 75 (free)', url: 'https://neetcode.io/practice', type: 'practice', free: true },
            { title: 'CS50 (Harvard, free)', url: 'https://cs50.harvard.edu/x/', type: 'course', free: true },
            { title: 'Visualgo (visualisations)', url: 'https://visualgo.net', type: 'practice', free: true },
          ],
          project: 'Solve 20 LeetCode Easy problems. Write your solutions in clean, commented code. Understand the time complexity of each.',
          estimatedDays: 14,
        },
      ],
    },
    {
      id: 'phase-2',
      title: 'Backend Core',
      duration: 'Weeks 6–12',
      summary: 'APIs, databases, and server infrastructure.',
      skills: [
        {
          id: 'fastapi',
          name: 'FastAPI (Python Web Framework)',
          description: 'The fastest growing Python web framework. Great for REST APIs and now widely used for AI-powered backends.',
          why: 'FastAPI is used by major companies and is the go-to choice for Python APIs in 2025/2026. Easy to learn, hard to outgrow.',
          topics: ['Routes & path parameters', 'Pydantic models (validation)', 'Async endpoints', 'Dependency injection', 'OpenAPI docs auto-generation', 'Background tasks'],
          resources: [
            { title: 'FastAPI Docs', url: 'https://fastapi.tiangolo.com', type: 'docs', free: true },
            { title: 'FastAPI Full Course', url: 'https://www.youtube.com/watch?v=7t2alSnE2-I', type: 'video', free: true },
          ],
          project: 'Build a task management REST API: CRUD for tasks, user authentication with JWT, input validation with Pydantic.',
          estimatedDays: 8,
        },
        { ...fullstackPath.phases[1].skills[1] }, // PostgreSQL
        { ...fullstackPath.phases[1].skills[2] }, // Auth & Security
        {
          id: 'cloud-basics',
          name: 'Cloud & Deployment (AWS basics)',
          description: 'Where your code actually runs. AWS is the most used cloud in Australia.',
          why: 'AWS knowledge is mentioned in 50% of backend job listings in Australia. Even basic knowledge gets you ahead.',
          topics: ['EC2 (virtual machines)', 'S3 (file storage)', 'RDS (managed databases)', 'Environment variables & secrets', 'Basic networking (VPC, security groups)', 'GitHub Actions for CI/CD'],
          resources: [
            { title: 'AWS Free Tier', url: 'https://aws.amazon.com/free/', type: 'practice', free: true },
            { title: 'AWS Cloud Practitioner — FreeCodeCamp', url: 'https://www.youtube.com/watch?v=SOTamWNgDKc', type: 'video', free: true },
          ],
          project: 'Deploy your FastAPI app to AWS EC2 or Render. Set up a CI/CD pipeline with GitHub Actions that auto-deploys on push.',
          estimatedDays: 7,
        },
      ],
    },
    {
      id: 'phase-3',
      title: 'Advanced & Job Ready',
      duration: 'Weeks 13–18',
      summary: 'Distinguish yourself from other candidates.',
      skills: [
        { ...fullstackPath.phases[1].skills[0] }, // Docker
        {
          id: 'system-design-basics',
          name: 'System Design Basics',
          description: 'How to think about building systems that scale. Asked in junior interviews at larger companies.',
          why: 'Even junior backend devs are asked "how would you design X?" knowing the vocabulary impresses interviewers.',
          topics: ['Client-server model', 'Caching (Redis basics)', 'Load balancing', 'Database scaling (read replicas, sharding)', 'Message queues (basics)', 'REST vs GraphQL vs gRPC'],
          resources: [
            { title: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer', type: 'docs', free: true },
            { title: 'ByteByteGo YouTube', url: 'https://www.youtube.com/@ByteByteGo', type: 'video', free: true },
          ],
          project: 'Design (on paper) a URL shortener: draw the system diagram, explain the database schema, describe how you\'d handle 1M requests/day.',
          estimatedDays: 5,
        },
        { ...frontendPath.phases[2].skills[3] }, // Portfolio Project
        { ...frontendPath.phases[2].skills[4] }, // Interview Prep
      ],
    },
  ],
};

// ─── PATH 4: Junior Data Engineer ─────────────────────────────
const dataEngineerPath: SkillPath = {
  id:          'junior-data-engineer',
  title:       'Junior Data Engineer',
  emoji:       '📊',
  description: 'Build data pipelines, warehouses, and analytics infrastructure. One of the fastest-growing roles in AU tech — Atlassian, CBA, REA all hiring.',
  timeline:    '20 weeks',
  avgSalary:   'AUD $75,000–$100,000',
  demand:      'Very High',
  phases: [
    {
      id: 'de-phase-1',
      title: 'Data Foundations',
      duration: 'Weeks 1–5',
      summary: 'SQL and Python are table stakes for every data engineering interview.',
      skills: [
        {
          id: 'sql-advanced',
          name: 'SQL — Intermediate to Advanced',
          description: 'Data engineers write complex SQL daily. Window functions, CTEs, and query optimisation are tested in every technical screen.',
          why: 'Every AU data engineering JD lists SQL as required. Companies like Atlassian and ANZ test window functions specifically.',
          topics: ['Window functions (ROW_NUMBER, RANK, LAG/LEAD)', 'CTEs and recursive queries', 'Aggregations and GROUP BY', 'Joins (inner, left, cross, self)', 'Indexes and query plans (EXPLAIN)', 'Transactions and ACID properties'],
          resources: [
            { title: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/', type: 'course', free: true },
            { title: 'SQLZoo', url: 'https://sqlzoo.net', type: 'practice', free: true },
          ],
          project: 'Write 10 SQL queries on a public dataset (Kaggle or BigQuery public data) covering window functions, CTEs, and aggregations.',
          estimatedDays: 7,
        },
        {
          id: 'python-data',
          name: 'Python for Data Engineering',
          description: 'Python is the scripting language of data pipelines. Pandas for transformation, requests for APIs, and file I/O for ETL jobs.',
          why: 'Listed in 90%+ of AU data engineer job ads. Pandas data transformation is the #1 tested skill after SQL.',
          topics: ['Pandas: read_csv, merge, groupby, apply', 'File I/O: CSV, JSON, Parquet', 'REST API calls with requests', 'Error handling and logging', 'Virtual environments and requirements.txt', 'Basic OOP for pipeline classes'],
          resources: [
            { title: 'Pandas User Guide', url: 'https://pandas.pydata.org/docs/user_guide/', type: 'docs', free: true },
            { title: 'Real Python — Pandas Tutorials', url: 'https://realpython.com/pandas-dataframe/', type: 'article', free: true },
          ],
          project: 'Build an ETL script that pulls data from a public API (e.g. Open-Meteo weather), transforms it with Pandas, and writes to a local SQLite database.',
          estimatedDays: 7,
        },
        {
          id: 'data-modeling',
          name: 'Data Modelling Fundamentals',
          description: 'How data is structured in warehouses — star schemas, normalisation, and dimensional modelling.',
          why: 'Interviewers at Canva, REA, and Seek ask candidates to design a data model from scratch in technical screens.',
          topics: ['Star schema vs snowflake schema', 'Fact and dimension tables', '3NF normalisation', 'Slowly Changing Dimensions (SCD Type 1, 2)', 'Data vault basics', 'When to denormalise'],
          resources: [
            { title: 'Kimball Group — Data Warehouse Toolkit (free chapters)', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/', type: 'docs', free: true },
            { title: 'dbt Learn — Data Modelling', url: 'https://courses.getdbt.com', type: 'course', free: true },
          ],
          project: 'Design a star schema for an e-commerce dataset: orders, customers, products, dates. Write the DDL and document the design.',
          estimatedDays: 5,
        },
      ],
    },
    {
      id: 'de-phase-2',
      title: 'Pipeline Engineering',
      duration: 'Weeks 6–12',
      summary: 'The core tools: orchestration, transformation, and cloud storage.',
      skills: [
        {
          id: 'airflow',
          name: 'Apache Airflow',
          description: 'The industry-standard workflow orchestrator. Airflow DAGs define when and how pipelines run.',
          why: 'Listed in 70%+ of AU senior data engineer JDs. Even juniors are expected to have run a DAG.',
          topics: ['DAG structure: tasks, operators, dependencies', 'PythonOperator and BashOperator', 'XComs for task communication', 'Connections and variables', 'Scheduling with cron expressions', 'Backfilling and retries'],
          resources: [
            { title: 'Apache Airflow Documentation', url: 'https://airflow.apache.org/docs/', type: 'docs', free: true },
            { title: 'Astronomer — Learn Airflow', url: 'https://docs.astronomer.io/learn', type: 'course', free: true },
          ],
          project: 'Build an Airflow DAG that runs daily: fetch data from an API → transform with Pandas → load to PostgreSQL.',
          estimatedDays: 7,
        },
        {
          id: 'dbt',
          name: 'dbt (data build tool)',
          description: 'dbt is how modern data teams write SQL transformations — version-controlled, tested, and documented.',
          why: 'dbt adoption in AU is exploding. Atlassian, Seek, and Xero use it. A dbt project on your resume is a strong differentiator.',
          topics: ['dbt models: ref(), source()', 'Materialisation: table, view, incremental', 'dbt tests: not_null, unique, relationships', 'Jinja templating in SQL', 'dbt documentation and lineage', 'dbt Cloud vs CLI'],
          resources: [
            { title: 'dbt Learn — Free Fundamentals Course', url: 'https://courses.getdbt.com/courses/fundamentals', type: 'course', free: true },
            { title: 'dbt Docs', url: 'https://docs.getdbt.com', type: 'docs', free: true },
          ],
          project: 'Connect dbt to a local DuckDB or PostgreSQL instance, model 3+ tables from a public dataset, add tests, and generate the docs site.',
          estimatedDays: 7,
        },
        {
          id: 'cloud-storage',
          name: 'Cloud Storage & Data Formats',
          description: 'S3 / GCS / ADLS, Parquet, Delta Lake — the raw layer of every modern data platform.',
          why: 'Every AU cloud data job uses object storage. Parquet is the de facto format. Knowing Delta Lake adds significant value.',
          topics: ['S3 / GCS bucket concepts, policies, versioning', 'Parquet vs CSV: columnar storage benefits', 'Delta Lake: ACID on object storage, time travel', 'Iceberg basics', 'Partitioning strategies', 'boto3 / google-cloud-storage SDK'],
          resources: [
            { title: 'AWS S3 Developer Guide', url: 'https://docs.aws.amazon.com/s3/', type: 'docs', free: true },
            { title: 'Delta Lake Documentation', url: 'https://docs.delta.io', type: 'docs', free: true },
          ],
          project: 'Write a Python script that reads a CSV, converts it to Parquet, uploads it to a local MinIO bucket (S3-compatible), and reads it back.',
          estimatedDays: 4,
        },
      ],
    },
    {
      id: 'de-phase-3',
      title: 'Cloud Platforms & Big Data',
      duration: 'Weeks 13–20',
      summary: 'Scale up to real data volumes with Spark and cloud-native warehouses.',
      skills: [
        {
          id: 'spark-basics',
          name: 'Apache Spark Fundamentals',
          description: 'Spark is the distributed processing engine behind most large-scale data pipelines.',
          why: 'Required for senior DE roles, but juniors who know Spark basics stand out significantly at scale-ups.',
          topics: ['RDDs vs DataFrames vs Datasets', 'PySpark: read, filter, join, groupBy', 'Lazy evaluation and DAG execution', 'Spark on Databricks (common in AU)', 'Partitioning and shuffles', 'Writing to Parquet / Delta'],
          resources: [
            { title: 'Databricks Community Edition (free)', url: 'https://community.cloud.databricks.com', type: 'practice', free: true },
            { title: 'Learning Spark (O\'Reilly, free preview)', url: 'https://pages.databricks.com/rs/094-YMS-629/images/LearningSpark2.0.pdf', type: 'docs', free: true },
          ],
          project: 'On Databricks Community Edition: read a 1M-row public dataset into a Spark DataFrame, aggregate by date and category, write to Delta table.',
          estimatedDays: 8,
        },
        {
          id: 'cloud-warehouse',
          name: 'Cloud Data Warehouse (BigQuery / Snowflake)',
          description: 'Managed column-store databases used by virtually every AU data team.',
          why: 'BigQuery or Snowflake appears in 80%+ of AU DE job descriptions. Hands-on experience is the fastest way to pass technical screens.',
          topics: ['BigQuery: datasets, tables, partitioning, clustering', 'Snowflake: virtual warehouses, stages, streams', 'Query cost optimisation', 'Materialised views', 'Loading data from GCS/S3', 'Connecting dbt to BigQuery/Snowflake'],
          resources: [
            { title: 'BigQuery Sandbox (free 1TB/month)', url: 'https://cloud.google.com/bigquery/docs/sandbox', type: 'practice', free: true },
            { title: 'Snowflake 30-day Free Trial', url: 'https://signup.snowflake.com', type: 'practice', free: true },
          ],
          project: 'Load a public dataset into BigQuery sandbox, build 3 dbt models on top of it, and document the lineage.',
          estimatedDays: 6,
        },
        {
          id: 'de-portfolio',
          name: 'Portfolio Data Pipeline Project',
          description: 'End-to-end project that demonstrates all skills: ingestion → transformation → modelling → visualisation.',
          why: 'AU data teams want to see a real pipeline, not just course certificates. One well-documented project beats 10 certificates.',
          topics: ['Choose a public data source (GitHub API, transport data, financial data)', 'Ingest raw data to S3/GCS', 'Transform with dbt or PySpark', 'Load to BigQuery/Snowflake', 'Build a simple Metabase or Looker Studio dashboard', 'Write a README documenting architecture decisions'],
          resources: [
            { title: 'Zoomcamp Data Engineering (free)', url: 'https://github.com/DataTalksClub/data-engineering-zoomcamp', type: 'course', free: true },
          ],
          project: 'Build and publish the end-to-end pipeline on GitHub. Include an architecture diagram and a live dashboard link.',
          estimatedDays: 14,
        },
      ],
    },
  ],
};

// ─── PATH 5: Junior DevOps / Cloud Engineer ───────────────────
const devOpsPath: SkillPath = {
  id:          'junior-devops',
  title:       'Junior DevOps / Cloud Engineer',
  emoji:       '☁️',
  description: 'CI/CD, containers, Kubernetes, and cloud infrastructure. High demand at AU scale-ups, banks, and government.',
  timeline:    '20 weeks',
  avgSalary:   'AUD $80,000–$110,000',
  demand:      'Very High',
  phases: [
    {
      id: 'devops-phase-1',
      title: 'Linux & Containers',
      duration: 'Weeks 1–6',
      summary: 'Every DevOps role starts here. Linux and Docker are non-negotiable.',
      skills: [
        {
          id: 'linux-cli',
          name: 'Linux Command Line',
          description: 'DevOps engineers spend their days in the terminal. File system, processes, networking, and scripting are all tested.',
          why: 'Every AU DevOps JD lists Linux. Almost all cloud compute runs Linux. Shell scripting is tested in 80%+ of interviews.',
          topics: ['File system navigation and permissions (chmod, chown)', 'Process management (ps, top, kill, systemctl)', 'Networking commands (curl, netstat, ss, nslookup)', 'Shell scripting: variables, loops, conditionals, functions', 'Text processing: grep, awk, sed, jq', 'SSH, SCP, and key management'],
          resources: [
            { title: 'Linux Command Line Basics (freeCodeCamp)', url: 'https://www.freecodecamp.org/news/linux-command-line-tutorial/', type: 'article', free: true },
            { title: 'OverTheWire: Bandit (interactive Linux wargame)', url: 'https://overthewire.org/wargames/bandit/', type: 'practice', free: true },
          ],
          project: 'Write a bash script that monitors a directory for new files, logs their sizes, and alerts (echo) when total size exceeds 100MB.',
          estimatedDays: 6,
        },
        {
          id: 'docker',
          name: 'Docker & Containerisation',
          description: 'Docker is how modern apps are packaged and deployed. Every cloud deployment goes through containers.',
          why: 'Docker appears in 95%+ of DevOps job ads in Australia. Junior interviews always include "explain what a Dockerfile does".',
          topics: ['Dockerfile: FROM, RUN, COPY, CMD, EXPOSE', 'docker build, run, exec, logs', 'Docker Compose: multi-service local dev', 'Volumes and bind mounts', 'Networking between containers', 'Multi-stage builds for smaller images', 'Pushing to Docker Hub / ECR / GCR'],
          resources: [
            { title: 'Docker Official Get Started Guide', url: 'https://docs.docker.com/get-started/', type: 'docs', free: true },
            { title: 'TechWorld with Nana — Docker Course', url: 'https://www.youtube.com/@TechWorldwithNana', type: 'video', free: true },
          ],
          project: 'Containerise a simple Node.js or Python web app: write the Dockerfile, set up Docker Compose with a Postgres service, and document how to run it.',
          estimatedDays: 6,
        },
        {
          id: 'ci-cd',
          name: 'CI/CD Pipelines',
          description: 'Continuous integration and deployment automates build, test, and release. GitHub Actions is the AU market standard.',
          why: 'Every AU tech company uses CI/CD. "Set up a GitHub Actions pipeline" is the most common take-home assignment for DevOps roles.',
          topics: ['GitHub Actions: workflows, jobs, steps, triggers', 'YAML syntax for pipelines', 'Build and test stages', 'Secrets management in CI', 'Docker build + push in CI', 'Environment-based deployments (staging → prod)'],
          resources: [
            { title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions', type: 'docs', free: true },
            { title: 'GitHub Actions — Starter Workflows', url: 'https://github.com/actions/starter-workflows', type: 'docs', free: true },
          ],
          project: 'Add a GitHub Actions workflow to any of your projects: lint → test → build Docker image → push to Docker Hub on main branch push.',
          estimatedDays: 5,
        },
      ],
    },
    {
      id: 'devops-phase-2',
      title: 'Kubernetes & Cloud',
      duration: 'Weeks 7–14',
      summary: 'Container orchestration and cloud provider fundamentals.',
      skills: [
        {
          id: 'kubernetes',
          name: 'Kubernetes Fundamentals',
          description: 'Kubernetes orchestrates containerised workloads at scale. The CKA certification is highly valued in AU.',
          why: 'K8s appears in 60%+ of senior DevOps JDs and increasingly in junior ones. Atlassian, Canva, and Xero all run on Kubernetes.',
          topics: ['Pods, Deployments, ReplicaSets, Services', 'ConfigMaps and Secrets', 'Ingress and networking', 'Persistent Volumes', 'Helm charts basics', 'kubectl: get, describe, logs, exec, apply'],
          resources: [
            { title: 'Kubernetes Official Interactive Tutorial', url: 'https://kubernetes.io/docs/tutorials/', type: 'docs', free: true },
            { title: 'TechWorld with Nana — Kubernetes Course', url: 'https://www.youtube.com/@TechWorldwithNana', type: 'video', free: true },
          ],
          project: 'Deploy a multi-service app on local Minikube: frontend + backend + database, exposed via an Ingress, with ConfigMap for environment variables.',
          estimatedDays: 10,
        },
        {
          id: 'aws-fundamentals',
          name: 'AWS Cloud Fundamentals',
          description: 'AWS dominates AU cloud adoption (~55% market share). EC2, S3, IAM, RDS, and Lambda are the core services.',
          why: 'AWS is listed in more AU DevOps JDs than any other cloud. AWS Cloud Practitioner certification is worth getting as a junior.',
          topics: ['IAM: users, roles, policies, least privilege', 'EC2: instances, security groups, key pairs', 'S3: buckets, policies, static hosting', 'RDS: managed databases, backups', 'VPC: subnets, route tables, NAT gateway', 'Lambda: serverless functions basics', 'CloudWatch: logs and alarms'],
          resources: [
            { title: 'AWS Free Tier (12 months free)', url: 'https://aws.amazon.com/free/', type: 'practice', free: true },
            { title: 'AWS Cloud Practitioner Essentials (free)', url: 'https://explore.skillbuilder.aws/learn/course/134', type: 'course', free: true },
          ],
          project: 'Deploy a Dockerised app to EC2 (or ECS Fargate): configure IAM roles, put it behind an Application Load Balancer, and set up CloudWatch alarms.',
          estimatedDays: 10,
        },
        {
          id: 'terraform',
          name: 'Infrastructure as Code (Terraform)',
          description: 'Terraform lets you define cloud infrastructure as code — version-controlled, repeatable, and reviewable.',
          why: 'Terraform is the AU market standard for IaC. It appears in 50%+ of mid-to-senior DevOps JDs and is increasingly expected at junior level.',
          topics: ['HCL: providers, resources, variables, outputs', 'terraform init, plan, apply, destroy', 'State management and remote backends (S3)', 'Modules: reusable infrastructure components', 'AWS provider: EC2, S3, RDS, VPC resources', 'tfvars and workspaces for multi-env'],
          resources: [
            { title: 'Terraform Learn — Get Started with AWS', url: 'https://developer.hashicorp.com/terraform/tutorials/aws-get-started', type: 'docs', free: true },
            { title: 'TechWorld with Nana — Terraform Course', url: 'https://www.youtube.com/@TechWorldwithNana', type: 'video', free: true },
          ],
          project: 'Write Terraform to provision a VPC with public/private subnets, an EC2 instance, an S3 bucket, and an RDS Postgres instance. Store state in S3.',
          estimatedDays: 7,
        },
      ],
    },
    {
      id: 'devops-phase-3',
      title: 'Observability & Portfolio',
      duration: 'Weeks 15–20',
      summary: 'Monitoring, alerting, and a capstone project that proves you can do the job.',
      skills: [
        {
          id: 'observability',
          name: 'Monitoring & Observability',
          description: 'Logs, metrics, and traces — the three pillars. Prometheus/Grafana for metrics, ELK or Loki for logs.',
          why: 'Observability is a critical gap in AU teams. Juniors who can set up alerting are immediately more valuable.',
          topics: ['Metrics vs logs vs traces', 'Prometheus: scrape configs, PromQL basics', 'Grafana: dashboards, alert rules', 'CloudWatch Logs Insights', 'Structured logging (JSON logs)', 'Alerting: PagerDuty / OpsGenie basics'],
          resources: [
            { title: 'Prometheus Getting Started', url: 'https://prometheus.io/docs/prometheus/latest/getting_started/', type: 'docs', free: true },
            { title: 'Grafana Play (interactive demo)', url: 'https://play.grafana.org', type: 'practice', free: true },
          ],
          project: 'Add Prometheus + Grafana to your Docker Compose project: scrape app metrics, build a dashboard, add an alert for error rate > 1%.',
          estimatedDays: 5,
        },
        {
          id: 'devops-portfolio',
          name: 'DevOps Portfolio Project',
          description: 'An end-to-end project demonstrating the full pipeline: code → CI/CD → cloud → monitoring.',
          why: 'AU DevOps teams want proof you can ship to production, not just theory. One real pipeline beats 5 certifications.',
          topics: ['Application: containerised web app or API', 'CI/CD: GitHub Actions pipeline (lint → test → build → deploy)', 'Infrastructure: Terraform (VPC, EC2/ECS, S3)', 'Monitoring: Prometheus + Grafana or CloudWatch', 'Documentation: architecture diagram, README with runbook', 'Clean git history with meaningful commit messages'],
          resources: [
            { title: 'roadmap.sh — DevOps Roadmap', url: 'https://roadmap.sh/devops', type: 'docs', free: true },
            { title: 'AWS Well-Architected Framework', url: 'https://aws.amazon.com/architecture/well-architected/', type: 'docs', free: true },
          ],
          project: 'Deploy a complete application: Terraform infrastructure → Docker containers → CI/CD → monitoring. Write a post-mortem style README explaining every design decision.',
          estimatedDays: 14,
        },
      ],
    },
  ],
};

export const SKILL_PATHS: SkillPath[] = [frontendPath, fullstackPath, backendPath, dataEngineerPath, devOpsPath];

export function getPathById(id: string): SkillPath | undefined {
  return SKILL_PATHS.find(p => p.id === id);
}

export function getAllSkillIds(path: SkillPath): string[] {
  return path.phases.flatMap(ph => ph.skills.map(s => s.id));
}
