---
title: "How a Search Engine Indexes Pages"
date: "2026-06-11"
topic: "System Design"
difficulty: "intermediate"
mermaid: |
  flowchart TD
      Web["Web Pages"]
      Crawler["Crawler"]
      Parser["Parser"]
      Index["Inverted Index"]
      Query["Query"]
      Serving["Query Serving"]
      Ranking["Ranking"]
      Results["Results"]
      
      Web --> Crawler
      Crawler --> Parser
      Parser --> Index
      Query --> Serving
      Index --> Serving
      Serving --> Ranking
      Ranking --> Results
      
      style Index fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A search engine index is a massive inverted data structure that maps words and phrases to the documents containing them, built by crawlers that fetch pages, extract content, and store searchable metadata in a distributed database. Knowing how indexing works teaches you about crawlers, distributed systems, data structures, caching, and ranking—core patterns you'll apply to your own search features and databases.
