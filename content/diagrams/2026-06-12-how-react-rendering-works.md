---
title: "How React Rendering Works"
date: "2026-06-12"
topic: "Frontend"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      A["User calls<br/>setState"] --> B["Enqueue<br/>render"]
      B --> C["Render phase<br/>no DOM changes"]
      C --> D["Reconciliation<br/>diff vDOM"]
      D --> E["Commit phase<br/>update real DOM"]
      E --> F["Browser paint<br/>useEffect"]
      
      style A fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

React renders components by converting JSX into a virtual representation, compares it to the previous state to find differences, then updates only the changed DOM elements. Understanding this reconciliation process helps you write performant components, avoid unnecessary re-renders, and make informed decisions about component architecture and state management.
