// Rich educational content for each skill.
// Topics have real explanations + concrete examples, not just names.
// This sits separately from skill-paths.ts so the data file stays manageable.

export type RichTopic = {
  id:      string;
  text:    string;    // short label shown in the checklist
  detail:  string;    // 1–2 sentence explanation
  example: string;    // concrete code snippet or real-world analogy
};

export type SkillContent = {
  realWorld:  string;      // "At a Brisbane company, this looks like..."
  takeaways:  string[];    // 3 things to remember after mastering this
  topics:     RichTopic[];
};

export const SKILL_CONTENT: Record<string, SkillContent> = {

  // ─── HTML ────────────────────────────────────────────────────
  'html-basics': {
    realWorld: `At most companies you'll never write raw HTML from scratch — it comes from a component library or CMS. But you do read and debug it constantly. When a screen reader breaks, when Google can't crawl a page, when a form doesn't submit — it's almost always a semantic HTML problem.`,
    takeaways: [
      'A div has no meaning. A nav, article, or section tells both browsers and screen readers what they\'re looking at.',
      'Forms without proper labels are inaccessible. Every input needs a <label for="..."> or aria-label.',
      'The heading hierarchy (h1 → h2 → h3) is how search engines and screen readers understand page structure — don\'t skip levels.',
    ],
    topics: [
      {
        id: 'document-structure',
        text: 'Document structure',
        detail: 'Every valid HTML page has a skeleton: <!DOCTYPE html> tells the browser which version of HTML to use, <html> wraps everything, <head> holds metadata the user never sees, and <body> holds everything visible.',
        example: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>My Page</title>\n  </head>\n  <body>\n    <h1>Hello world</h1>\n  </body>\n</html>`,
      },
      {
        id: 'semantic-elements',
        text: 'Semantic elements (nav, main, article, section)',
        detail: 'Semantic tags describe the purpose of content, not just its visual layout. A screen reader reading <nav> knows to announce "navigation" — a <div> gives it no information at all.',
        example: `<!-- Non-semantic (bad) -->\n<div class="header">\n  <div class="nav">...</div>\n</div>\n\n<!-- Semantic (good) -->\n<header>\n  <nav aria-label="Main">\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</header>`,
      },
      {
        id: 'forms',
        text: 'Forms, inputs, and labels',
        detail: 'A form without labels is unusable by keyboard and screen reader users — and technically broken. The "for" attribute on a label must exactly match the "id" on the input.',
        example: `<!-- Broken — input has no label -->\n<input type="email" placeholder="Email" />\n\n<!-- Correct -->\n<label for="email">Email address</label>\n<input\n  type="email"\n  id="email"\n  name="email"\n  required\n  autocomplete="email"\n/>`,
      },
      {
        id: 'accessibility-attrs',
        text: 'Accessibility attributes (alt, aria-label, role)',
        detail: 'alt text is read aloud by screen readers for images. An empty alt="" tells screen readers the image is decorative. aria-label adds a label to elements that have no visible text, like icon buttons.',
        example: `<!-- Image with context -->\n<img src="henry.jpg" alt="Henry presenting at a developer meetup" />\n\n<!-- Decorative image -->\n<img src="divider.svg" alt="" />\n\n<!-- Icon button needs a label -->\n<button aria-label="Close menu">\n  <svg>...</svg>\n</button>`,
      },
      {
        id: 'meta-seo',
        text: 'Meta tags and SEO basics',
        detail: 'The <title> tag and meta description are what appear in Google search results. Open Graph tags control how your page looks when shared on LinkedIn or Slack.',
        example: `<head>\n  <title>Henry Tsai — Full Stack Developer</title>\n  <meta name="description" content="Brisbane-based developer building AI tools." />\n\n  <!-- Open Graph (LinkedIn, Slack previews) -->\n  <meta property="og:title" content="Henry Tsai" />\n  <meta property="og:description" content="Full Stack Developer in Brisbane" />\n  <meta property="og:image" content="/og-image.png" />\n</head>`,
      },
    ],
  },

  // ─── CSS FUNDAMENTALS ────────────────────────────────────────
  'css-fundamentals': {
    realWorld: `A designer hands you a Figma file. You need to match it pixel-for-pixel in code. Every mismatch is a CSS problem — wrong spacing (box model), style getting overridden unexpectedly (specificity), or a hover state not working (pseudo-classes). These aren't framework problems, they're vanilla CSS.`,
    takeaways: [
      'The box model means every element is a rectangle: content + padding + border + margin. Padding is inside the border, margin is outside.',
      'Specificity wins over source order. An ID selector (#id) always beats a class (.class), which always beats a tag (div). !important overrides everything and should almost never be used.',
      'CSS custom properties (variables) are not just for design systems — they make dark mode, theming, and dynamic values much easier to maintain.',
    ],
    topics: [
      {
        id: 'box-model',
        text: 'The box model',
        detail: 'Every HTML element is a box with four layers: content (the text/image), padding (space inside the border), border (the visible edge), and margin (space outside the border). box-sizing: border-box makes width include padding and border, which is almost always what you want.',
        example: `/* Default — width is content only, border + padding add on top */\n.box { width: 200px; padding: 20px; border: 2px solid; }\n/* Actual rendered width: 200 + 40 + 4 = 244px */\n\n/* Better — width includes padding and border */\n* { box-sizing: border-box; }\n.box { width: 200px; padding: 20px; border: 2px solid; }\n/* Actual rendered width: 200px */`,
      },
      {
        id: 'specificity',
        text: 'Selectors and specificity',
        detail: 'When two rules conflict, the one with higher specificity wins regardless of order. The specificity score is (inline styles, IDs, classes, tags). This is why your carefully written class is overridden by someone\'s old ID selector from 2018.',
        example: `/* Specificity: (0, 0, 1) — one tag */\np { color: blue; }\n\n/* Specificity: (0, 1, 0) — one class — wins */\n.text { color: red; }\n\n/* Specificity: (1, 0, 0) — one ID — always wins */\n#title { color: green; }\n\n/* Real debugging tip: if your style isn't applying,\n   open DevTools and look for strikethrough rules */`,
      },
      {
        id: 'units',
        text: 'CSS units (rem, em, px, %, vw)',
        detail: 'px is fixed. rem is relative to the root font size (usually 16px). em is relative to the parent element\'s font size. % is relative to the parent. vw/vh are percentages of the viewport. Use rem for font sizes and spacing, % or vw for widths.',
        example: `/* rem — always relative to root, predictable */\nh1 { font-size: 2rem; }     /* 32px if root is 16px */\np  { font-size: 1rem; }     /* 16px */\n\n/* em — relative to parent, can compound */\n.card { font-size: 1.2rem; }\n.card p { font-size: 0.9em; }  /* 0.9 * 1.2rem = 1.08rem */\n\n/* vw — responsive full-width hero text */\nh1 { font-size: clamp(1.5rem, 4vw, 3rem); }`,
      },
      {
        id: 'pseudo-classes',
        text: 'Pseudo-classes and pseudo-elements',
        detail: 'Pseudo-classes target elements in a specific state (:hover, :focus, :first-child). Pseudo-elements create virtual elements that don\'t exist in the HTML (::before, ::after). Both are used constantly in real codebases.',
        example: `/* Pseudo-classes */\na:hover  { color: red; }\ninput:focus { outline: 2px solid blue; }\nli:first-child { font-weight: bold; }\nli:nth-child(2n) { background: #f5f5f5; } /* even rows */\n\n/* Pseudo-elements */\n.quote::before { content: '"'; }\n.quote::after  { content: '"'; }\n\n/* Clearfix technique */\n.container::after {\n  content: '';\n  display: block;\n  clear: both;\n}`,
      },
      {
        id: 'css-variables',
        text: 'CSS custom properties (variables)',
        detail: 'CSS variables are defined with -- prefix and used with var(). Unlike Sass variables, they\'re live in the browser and can be changed with JavaScript or overridden in media queries. This makes dark mode and theming trivial.',
        example: `/* Define on :root to make them global */\n:root {\n  --color-bg: #fafaf0;\n  --color-text: #1a1208;\n  --spacing-md: 1rem;\n}\n\n/* Dark mode override */\n[data-theme="dark"] {\n  --color-bg: #0c0a12;\n  --color-text: #f2ebe0;\n}\n\n/* Use anywhere — updates automatically on theme change */\nbody {\n  background: var(--color-bg);\n  color: var(--color-text);\n  padding: var(--spacing-md);\n}`,
      },
    ],
  },

  // ─── CSS LAYOUT ──────────────────────────────────────────────
  'css-layout': {
    realWorld: `Almost every interface you build uses both Flexbox and Grid. Flexbox is for one-dimensional layouts — a navbar, a row of cards, a form. Grid is for two-dimensional layouts — a page structure, a dashboard, an image gallery. Most devs use Flexbox by default and reach for Grid when they need rows AND columns.`,
    takeaways: [
      'Flexbox works on one axis at a time. The main axis is defined by flex-direction (row or column). justify-content controls the main axis, align-items controls the cross axis.',
      'Grid\'s repeat(auto-fill, minmax(200px, 1fr)) is one of the most useful CSS patterns — it creates a responsive grid with no media queries.',
      'position: sticky is underused. It keeps an element fixed relative to its scroll container, not the viewport — perfect for sticky headers inside a scrollable div.',
    ],
    topics: [
      {
        id: 'flexbox',
        text: 'Flexbox — axes, alignment, wrapping',
        detail: 'The flex container controls its children. justify-content aligns along the main axis (default: horizontal), align-items aligns along the cross axis (default: vertical). flex-wrap: wrap lets items flow to a new row instead of shrinking.',
        example: `/* Classic navbar: logo left, links right */\n.navbar {\n  display: flex;\n  justify-content: space-between;  /* main axis */\n  align-items: center;              /* cross axis */\n  padding: 1rem;\n}\n\n/* Card row that wraps on mobile */\n.cards {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n}\n.card {\n  flex: 1 1 280px; /* grow, shrink, min-width */\n}`,
      },
      {
        id: 'grid',
        text: 'CSS Grid — template columns, areas, auto-fill',
        detail: 'Grid lets you define both rows and columns. grid-template-columns defines the column structure. fr is a fractional unit — 1fr takes up "one fraction" of remaining space.',
        example: `/* 3-column layout, equal width */\n.grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  gap: 1.5rem;\n}\n\n/* Responsive grid, no media queries needed */\n.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));\n  gap: 1rem;\n}\n\n/* Named areas — page layout */\n.page {\n  display: grid;\n  grid-template-areas:\n    "header header"\n    "sidebar content"\n    "footer footer";\n  grid-template-columns: 240px 1fr;\n}`,
      },
      {
        id: 'responsive-layout',
        text: 'Responsive layout patterns',
        detail: 'Mobile-first means writing styles for small screens first, then using min-width media queries to adjust for larger screens. This is what major frameworks like Tailwind and Bootstrap do internally.',
        example: `/* Mobile first */\n.layout {\n  display: flex;\n  flex-direction: column; /* stacked on mobile */\n  gap: 1rem;\n}\n\n/* Tablet and above */\n@media (min-width: 768px) {\n  .layout {\n    flex-direction: row; /* side by side */\n  }\n}\n\n/* Desktop */\n@media (min-width: 1200px) {\n  .layout {\n    max-width: 1200px;\n    margin: 0 auto;\n  }\n}`,
      },
      {
        id: 'positioning',
        text: 'Position — relative, absolute, sticky, fixed',
        detail: 'Static is the default (normal flow). Relative shifts the element but keeps its space. Absolute takes it out of flow and positions it relative to the nearest positioned ancestor. Fixed pins to the viewport. Sticky is like fixed, but only within its scroll container.',
        example: `/* Tooltip — absolute inside relative */\n.wrapper { position: relative; }\n.tooltip {\n  position: absolute;\n  top: -2rem;\n  left: 50%;\n  transform: translateX(-50%);\n}\n\n/* Sticky header that stops at parent boundary */\n.sidebar-header {\n  position: sticky;\n  top: 1rem;\n}\n\n/* Fixed nav — always visible */\nnav {\n  position: fixed;\n  top: 0; left: 0; right: 0;\n  z-index: 50;\n}`,
      },
    ],
  },

  // ─── JAVASCRIPT ──────────────────────────────────────────────
  'javascript-basics': {
    realWorld: `Every bug report you ever investigate will involve JavaScript. It's the logic layer of the web. Reading someone else's codebase, adding a feature, writing a quick script to transform data — you do this in JavaScript. The array methods (map, filter, reduce) are used in React constantly to render lists from data.`,
    takeaways: [
      'const doesn\'t mean the value is immutable — it means the variable binding can\'t be reassigned. const arr = [] lets you push to arr freely; you just can\'t do arr = [].',
      'Closures are why callbacks work. A function "closes over" variables from its outer scope, keeping them alive even after the outer function returns.',
      'async/await is just syntactic sugar over Promises. The await keyword pauses execution of that function until the Promise resolves — it doesn\'t block the entire thread.',
    ],
    topics: [
      {
        id: 'variables',
        text: 'let, const, var and when to use each',
        detail: 'Use const by default. Use let when you need to reassign. Never use var — it has function scope and hoisting behaviour that causes bugs that are hard to track down.',
        example: `const name = 'Henry';    // can't reassign\nlet count = 0;            // can reassign\ncount++;                  // fine\n\n// const with objects — you can mutate, can't reassign\nconst user = { name: 'Henry', age: 27 };\nuser.age = 28;            // fine — mutating the object\n// user = {};             // error — can't reassign\n\n// Why not var?\nfunction example() {\n  if (true) {\n    var x = 1;  // leaks to function scope\n    let y = 2;  // stays in the if block\n  }\n  console.log(x); // 1 — var leaked out\n  console.log(y); // ReferenceError — let stayed scoped\n}`,
      },
      {
        id: 'array-methods',
        text: 'Array methods — map, filter, reduce, find',
        detail: 'These are the bread and butter of JavaScript development. map transforms every element. filter returns elements that pass a test. reduce collapses an array to a single value. You\'ll use map and filter in React every time you render a list.',
        example: `const jobs = [\n  { title: 'Frontend Dev', salary: 75000, remote: true },\n  { title: 'Backend Dev',  salary: 85000, remote: false },\n  { title: 'Full Stack',   salary: 90000, remote: true },\n];\n\n// map — transform each item\nconst titles = jobs.map(job => job.title);\n// ['Frontend Dev', 'Backend Dev', 'Full Stack']\n\n// filter — keep matching items\nconst remoteJobs = jobs.filter(job => job.remote);\n// [Frontend Dev, Full Stack]\n\n// find — get first match\nconst highPay = jobs.find(job => job.salary > 80000);\n// { title: 'Backend Dev', ... }\n\n// reduce — aggregate\nconst total = jobs.reduce((sum, job) => sum + job.salary, 0);\n// 250000`,
      },
      {
        id: 'destructuring',
        text: 'Destructuring and spread operator',
        detail: 'Destructuring pulls values out of objects and arrays into variables. The spread operator (...) copies values. Both are used constantly in React — props are destructured, state updates use spread.',
        example: `// Object destructuring\nconst { name, age, location = 'Brisbane' } = user;\n// location defaults to 'Brisbane' if not in user\n\n// Array destructuring (how useState works)\nconst [count, setCount] = useState(0);\n\n// Spread — immutable state update pattern in React\nconst updatedUser = { ...user, age: 28 };\n// Creates new object, doesn't mutate original\n\n// Function parameter destructuring\nfunction greet({ name, location }) {\n  return \`Hi \${name} from \${location}\`;\n}`,
      },
      {
        id: 'async-await',
        text: 'Promises and async/await',
        detail: 'Fetching data from an API is asynchronous — the browser sends the request and continues running other code while waiting. async/await lets you write that async code in a readable, top-to-bottom style without .then() chains.',
        example: `// Without async/await (Promise chain)\nfetch('/api/jobs')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n\n// With async/await (same thing, cleaner)\nasync function loadJobs() {\n  try {\n    const res  = await fetch('/api/jobs');\n    const data = await res.json();\n    console.log(data);\n  } catch (err) {\n    console.error('Failed to load jobs', err);\n  }\n}\n\n// Real-world: Next.js page data fetching\nasync function getServerSideProps() {\n  const res  = await fetch('https://api.example.com/jobs');\n  const jobs = await res.json();\n  return { props: { jobs } };\n}`,
      },
      {
        id: 'dom-events',
        text: 'DOM manipulation and events',
        detail: 'In React you rarely touch the DOM directly, but understanding how events bubble and how the DOM works makes you a much better debugger. Event delegation — attaching one listener to a parent instead of many to children — is a common interview topic.',
        example: `// Direct DOM manipulation (vanilla JS)\nconst btn = document.querySelector('#submit');\nbtn.addEventListener('click', (event) => {\n  event.preventDefault(); // stop form submission\n  console.log(event.target); // the button element\n});\n\n// Event delegation — one listener for many buttons\ndocument.querySelector('.list').addEventListener('click', (e) => {\n  if (e.target.matches('.delete-btn')) {\n    e.target.closest('li').remove();\n  }\n});\n\n// In React — same concept, different syntax\n<button onClick={(e) => {\n  e.preventDefault();\n  handleSubmit();\n}}>Submit</button>`,
      },
    ],
  },

  // ─── REACT ───────────────────────────────────────────────────
  'react-fundamentals': {
    realWorld: `React is a component factory. You define what a piece of UI looks like as a function, React figures out how to update the DOM efficiently. In a real codebase you'll have dozens of components composing together — a Button inside a Form inside a Modal inside a Page. Understanding when components re-render (and how to prevent it) is what separates junior from mid-level React devs.`,
    takeaways: [
      'A component re-renders whenever its state or props change. That\'s it. If you\'re confused about why something re-rendered, ask: "did state or props change?"',
      'useEffect runs after render, not during. The dependency array controls when it runs: [] = once on mount, [value] = whenever value changes, nothing = every render (almost always a mistake).',
      'Key props on lists tell React which element is which. Without keys, React can\'t efficiently update the list and may produce wrong output when items are added or removed.',
    ],
    topics: [
      {
        id: 'jsx',
        text: 'JSX — what it actually is',
        detail: 'JSX is just syntax sugar for React.createElement(). The browser doesn\'t understand it — Babel or TypeScript compiles it to regular JavaScript. Understanding this helps when you get cryptic JSX errors.',
        example: `// What you write\nfunction Button({ label, onClick }) {\n  return <button onClick={onClick}>{label}</button>;\n}\n\n// What it compiles to\nfunction Button({ label, onClick }) {\n  return React.createElement(\n    'button',\n    { onClick },\n    label\n  );\n}\n\n// JSX rules:\n// 1. Return a single root element (or <> fragment)\n// 2. className not class, htmlFor not for\n// 3. All tags must be closed: <img /> not <img>`,
      },
      {
        id: 'state-props',
        text: 'Props vs state — the core distinction',
        detail: 'Props are data passed into a component (read-only). State is data owned by a component (can change). When state changes, the component re-renders. This is React\'s entire mental model.',
        example: `// Props — passed in, component doesn't own them\nfunction UserCard({ name, location }) {\n  return <p>{name} from {location}</p>;\n}\n<UserCard name="Henry" location="Brisbane" />\n\n// State — owned by component, triggers re-render on change\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>+1</button>\n    </div>\n  );\n}\n\n// Rule: never mutate state directly\n// setCount(count + 1) ✓\n// count++ ✗ — React won't detect this`,
      },
      {
        id: 'use-effect',
        text: 'useEffect — side effects and cleanup',
        detail: 'useEffect is for things that happen outside React\'s render cycle: fetching data, setting up subscriptions, timers. The cleanup function runs before the next effect or when the component unmounts.',
        example: `// Fetch on mount\nuseEffect(() => {\n  async function load() {\n    const res  = await fetch('/api/user');\n    const data = await res.json();\n    setUser(data);\n  }\n  load();\n}, []); // [] means run once after first render\n\n// Re-run when userId changes\nuseEffect(() => {\n  fetchUser(userId);\n}, [userId]);\n\n// With cleanup (e.g. event listeners, timers)\nuseEffect(() => {\n  const id = setInterval(() => tick(), 1000);\n  return () => clearInterval(id); // cleanup!\n}, []);`,
      },
      {
        id: 'lists-and-keys',
        text: 'Rendering lists and keys',
        detail: 'To render a list you use .map() to convert an array of data to an array of JSX. Keys are required — they must be unique and stable (not index if the list can reorder).',
        example: `const jobs = [\n  { id: 1, title: 'Frontend Dev', company: 'Atlassian' },\n  { id: 2, title: 'Full Stack',   company: 'Canva' },\n];\n\n// Correct — key from stable unique ID\nfunction JobList() {\n  return (\n    <ul>\n      {jobs.map(job => (\n        <li key={job.id}>           {/* stable ID as key */}\n          {job.title} at {job.company}\n        </li>\n      ))}\n    </ul>\n  );\n}\n\n// Wrong — using index as key (breaks on reorder/delete)\n{jobs.map((job, index) => (\n  <li key={index}>...</li>  // don't do this\n))}`,
      },
      {
        id: 'component-composition',
        text: 'Component composition and children',
        detail: 'Instead of making one giant component, break UI into small pieces. The children prop lets a component render whatever is passed between its tags — like the slot pattern in Vue or Web Components.',
        example: `// Small, composable components\nfunction Card({ children, className }) {\n  return (\n    <div className={\`card \${className}\`}>\n      {children}\n    </div>\n  );\n}\n\n// Used like HTML tags\n<Card className="featured">\n  <h2>Software Developer</h2>\n  <p>Atlassian · Brisbane</p>\n  <Button>Apply</Button>\n</Card>\n\n// Real pattern: Layout with slots\nfunction PageLayout({ header, sidebar, children }) {\n  return (\n    <div className="layout">\n      <header>{header}</header>\n      <aside>{sidebar}</aside>\n      <main>{children}</main>\n    </div>\n  );\n}`,
      },
    ],
  },

  // ─── TYPESCRIPT ──────────────────────────────────────────────
  'typescript-basics': {
    realWorld: `TypeScript errors are your first line of defence before runtime errors crash production. When you refactor a function name, TypeScript instantly shows every file that broke. When you call an API, you define what the response looks like and TypeScript will catch you if you try to access a field that doesn't exist.`,
    takeaways: [
      'TypeScript doesn\'t make JavaScript slower. It compiles away to JavaScript — at runtime, there is no TypeScript. It\'s a build-time tool only.',
      'Define types at boundaries: function parameters, API responses, component props. Inside a function body, let TypeScript infer types — you don\'t need to annotate every variable.',
      'The most useful utility types: Partial<T> (all fields optional), Pick<T, K> (only some fields), Omit<T, K> (all except some), and Record<K, V> (object with typed keys and values).',
    ],
    topics: [
      {
        id: 'basic-types',
        text: 'Primitive types and arrays',
        detail: 'TypeScript adds type annotations with a colon after the variable name. For most variables, TypeScript can infer the type without you writing it — annotation is only required when the type can\'t be inferred.',
        example: `// TypeScript infers these — no annotation needed\nconst name = 'Henry';   // TypeScript knows: string\nconst age  = 27;        // TypeScript knows: number\nconst active = true;    // TypeScript knows: boolean\n\n// Annotation needed when TypeScript can't infer\nlet title: string;      // declared but not assigned yet\nconst ids: number[] = [];\n\n// Function parameters always need types\nfunction greet(name: string, age: number): string {\n  return \`\${name} is \${age}\`;\n}`,
      },
      {
        id: 'interfaces',
        text: 'Interfaces and type aliases',
        detail: 'An interface describes the shape of an object. A type alias is similar but more flexible. Use interface for objects and public APIs (they\'re extendable). Use type for unions, primitives, and complex types.',
        example: `// Interface — for objects\ninterface User {\n  id:       number;\n  name:     string;\n  email:    string;\n  location?: string;  // optional field\n}\n\n// Type alias — for unions and complex types\ntype Status = 'applied' | 'interview' | 'offer' | 'rejected';\ntype JobId  = string | number;  // union type\n\n// Extending an interface\ninterface AdminUser extends User {\n  role: 'admin';\n  permissions: string[];\n}\n\n// Using them as prop types in React\nfunction UserCard({ user }: { user: User }) {\n  return <p>{user.name}</p>;\n}`,
      },
      {
        id: 'generics',
        text: 'Generics — writing reusable typed functions',
        detail: 'Generics let you write a function that works with any type while still being type-safe. Think of <T> as a placeholder that gets filled in when the function is called. You\'ve been using generics all along — useState<string>() uses them.',
        example: `// Without generics — works, but loses type info\nfunction first(arr: any[]): any { return arr[0]; }\n\n// With generics — type is preserved\nfunction first<T>(arr: T[]): T { return arr[0]; }\n\nconst str = first(['a', 'b', 'c']); // TypeScript knows: string\nconst num = first([1, 2, 3]);       // TypeScript knows: number\n\n// React useState uses generics\nconst [jobs, setJobs] = useState<Job[]>([]);\n// setJobs(['wrong']) — TypeScript error!\n// setJobs([{ id: 1, title: '...' }]) — correct\n\n// API response typing\nasync function fetchUser(id: number): Promise<User> {\n  const res = await fetch(\`/api/users/\${id}\`);\n  return res.json() as User;\n}`,
      },
      {
        id: 'utility-types',
        text: 'Utility types (Partial, Pick, Omit)',
        detail: 'TypeScript has built-in utility types that transform existing types. These are used constantly in real codebases to avoid rewriting types.',
        example: `interface Job {\n  id:      number;\n  title:   string;\n  company: string;\n  salary:  number;\n  url:     string;\n}\n\n// Partial — all fields optional (useful for update payloads)\ntype JobUpdate = Partial<Job>;\n// { id?: number; title?: string; ... }\n\n// Pick — only these fields\ntype JobPreview = Pick<Job, 'title' | 'company'>;\n// { title: string; company: string }\n\n// Omit — all except these\ntype NewJob = Omit<Job, 'id'>;\n// { title: string; company: string; salary: number; url: string }\n\n// Record — typed dictionary\nconst statusColors: Record<Status, string> = {\n  applied:   '#3b82f6',\n  interview: '#f59e0b',\n  offer:     '#10b981',\n  rejected:  '#ef4444',\n};`,
      },
    ],
  },

  // ─── GIT ─────────────────────────────────────────────────────
  'git-basics': {
    realWorld: `On your first day at a company, you'll clone the repo, create a feature branch, push commits, and open a pull request — all before lunch. Git is not optional. The most common junior mistake is committing directly to main and losing someone else's work.`,
    takeaways: [
      'Never commit directly to main on a shared project. Always branch → work → PR → merge.',
      'Commit messages should explain why, not what. "Fix login bug" is bad. "Fix session not persisting across page refreshes due to missing cookie options" is good.',
      'git stash is a lifesaver when you need to switch branches without committing unfinished work.',
    ],
    topics: [
      {
        id: 'core-commands',
        text: 'Core workflow: init, add, commit, push, pull',
        detail: 'Git tracks changes in snapshots called commits. git add stages changes (chooses what goes into the next commit). git commit saves the snapshot. git push sends it to the remote. git pull fetches and merges the latest from remote.',
        example: `# Start a new project\ngit init\ngit remote add origin https://github.com/username/repo.git\n\n# Daily workflow\ngit status                    # see what changed\ngit add src/components/Button.tsx  # stage specific file\ngit add .                     # stage everything (be careful)\ngit commit -m "Add hover state to Button component"\ngit push origin main\n\n# Get latest from the team\ngit pull origin main`,
      },
      {
        id: 'branching',
        text: 'Branching and merging',
        detail: 'A branch is a parallel version of your code. You create one for each feature or fix, work on it without affecting main, then merge it back when done. This is how every professional team works.',
        example: `# Create and switch to a new branch\ngit checkout -b feature/job-search-filters\n# or with newer git\ngit switch -c feature/job-search-filters\n\n# Work, commit, push\ngit add .\ngit commit -m "Add salary filter to job search"\ngit push origin feature/job-search-filters\n\n# On GitHub: open a Pull Request from\n# feature/job-search-filters → main\n\n# After PR is merged, clean up locally\ngit switch main\ngit pull origin main\ngit branch -d feature/job-search-filters`,
      },
      {
        id: 'merge-conflicts',
        text: 'Resolving merge conflicts',
        detail: 'A conflict happens when two branches changed the same line. Git marks the conflicting section and you decide which version to keep. Don\'t panic — it\'s just text editing.',
        example: `# Git marks conflicts like this:\n<<<<<<< HEAD (your branch)\nconst PORT = 3001;\n=======\nconst PORT = 3000;\n>>>>>>> main\n\n# You decide — delete the markers and keep what's right:\nconst PORT = process.env.PORT || 3000;\n\n# Then:\ngit add .\ngit commit -m "Resolve PORT conflict with main"`,
      },
    ],
  },

  // ─── REST APIs ───────────────────────────────────────────────
  'rest-apis': {
    realWorld: `Every button that loads data, every form submission, every "save to favourites" — these are REST API calls. In React, you fetch data in useEffect on mount, show a loading state while waiting, then display the result. Error handling isn't optional — APIs fail, networks drop out.`,
    takeaways: [
      'GET fetches data (no body). POST creates data (has body). PUT/PATCH updates. DELETE removes. These are conventions — not rules the browser enforces — but everyone follows them.',
      'Always handle the three states: loading, success, and error. A UI that silently fails is worse than one that shows an error message.',
      'Store API keys in environment variables (.env), never in code that gets committed to GitHub.',
    ],
    topics: [
      {
        id: 'http-methods',
        text: 'HTTP methods and status codes',
        detail: 'HTTP status codes tell you what happened: 200 = OK, 201 = Created, 400 = Bad request (your fault), 401 = Unauthorised, 403 = Forbidden, 404 = Not found, 500 = Server error (their fault).',
        example: `// GET — fetch a list\nGET /api/jobs?location=Brisbane\n// 200 OK → returns array of jobs\n\n// POST — create something\nPOST /api/saved-jobs\nBody: { jobId: '123', title: 'Frontend Dev' }\n// 201 Created → returns the created record\n\n// DELETE — remove something\nDELETE /api/saved-jobs/123\n// 204 No Content → success, nothing to return\n\n// In practice — always check status\nconst res = await fetch('/api/jobs');\nif (!res.ok) {\n  throw new Error(\`API error: \${res.status}\`);\n}\nconst data = await res.json();`,
      },
      {
        id: 'fetch-patterns',
        text: 'fetch() with loading and error states',
        detail: 'The pattern you\'ll use in every React component that loads data: start with loading = true, fetch data, either set the data or set an error, set loading = false regardless.',
        example: `function JobList() {\n  const [jobs,    setJobs]    = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [error,   setError]   = useState(null);\n\n  useEffect(() => {\n    async function load() {\n      try {\n        const res  = await fetch('/api/jobs');\n        if (!res.ok) throw new Error('Failed to fetch');\n        const data = await res.json();\n        setJobs(data);\n      } catch (err) {\n        setError(err.message);\n      } finally {\n        setLoading(false); // always runs\n      }\n    }\n    load();\n  }, []);\n\n  if (loading) return <p>Loading...</p>;\n  if (error)   return <p>Error: {error}</p>;\n  return <ul>{jobs.map(j => <li key={j.id}>{j.title}</li>)}</ul>;\n}`,
      },
    ],
  },

  // ─── NEXT.JS ─────────────────────────────────────────────────
  'nextjs': {
    realWorld: `Next.js is what most Brisbane companies mean when they say "React experience required". It adds routing, server-side rendering, and API routes on top of React. The App Router (introduced in Next.js 13) is now the standard — Server Components run on the server with no JavaScript sent to the client, which makes pages load faster.`,
    takeaways: [
      'Server Components are the default in the App Router. They can\'t use useState, useEffect, or browser APIs. Add "use client" only when you need interactivity.',
      'Route handlers (app/api/route.ts) are serverless functions. Each one becomes an API endpoint automatically on deployment to Vercel.',
      'Metadata (title, description, OG tags) is exported from page.tsx as a constant — Next.js handles injecting it into the <head> automatically.',
    ],
    topics: [
      {
        id: 'app-router',
        text: 'App Router — file-based routing',
        detail: 'In the App Router, the folder structure defines your URLs. A file at app/blog/[slug]/page.tsx becomes the route /blog/anything. Folders named in square brackets are dynamic segments.',
        example: `app/\n├── page.tsx           → /\n├── about/\n│   └── page.tsx       → /about\n├── blog/\n│   ├── page.tsx       → /blog\n│   └── [slug]/\n│       └── page.tsx   → /blog/my-post\n└── api/\n    └── jobs/\n        └── route.ts   → /api/jobs (GET, POST)\n\n// Dynamic page — receives params\nexport default function BlogPost({\n  params\n}: {\n  params: { slug: string }\n}) {\n  return <h1>{params.slug}</h1>;\n}`,
      },
      {
        id: 'server-vs-client',
        text: 'Server vs Client Components',
        detail: 'Server Components run on the server — they can read from databases directly, keep secrets out of the bundle, and have no JavaScript in the client. Client Components run in the browser and handle interactivity.',
        example: `// Server Component (default) — no 'use client'\n// Can: fetch from DB, read env vars, be async\nexport default async function JobsPage() {\n  const jobs = await db.query('SELECT * FROM jobs');\n  return <JobList jobs={jobs} />; // pass to client component\n}\n\n// Client Component — interactive, runs in browser\n'use client';\nimport { useState } from 'react';\n\nexport default function JobList({ jobs }) {\n  const [filter, setFilter] = useState('');\n  const filtered = jobs.filter(j =>\n    j.title.includes(filter)\n  );\n  return (\n    <div>\n      <input onChange={e => setFilter(e.target.value)} />\n      {filtered.map(j => <div key={j.id}>{j.title}</div>)}\n    </div>\n  );\n}`,
      },
    ],
  },
};
