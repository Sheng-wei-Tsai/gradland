---
title: "How Git Works Internally"
date: "2026-06-11"
topic: "DevOps"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      Blob["Blob"]
      Tree["Tree"]
      Commit["Commit"]
      Parent["Previous commit"]
      Branch["Branch"]
      
      Blob -->|stored in| Tree
      Tree -->|stored in| Commit
      Parent -->|parent of| Commit
      Branch -->|points to| Commit
      
      style Commit fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Git uses content-addressable storage where files and commits are identified by SHA-1 hashes of their contents, stored as immutable objects in a directed acyclic graph. Understanding this model helps developers predict how branching, merging, and recovery work without fear of losing committed work.
