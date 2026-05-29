---
title: "Consistent Hashing"
date: "2026-05-29"
topic: "Distributed Systems"
difficulty: "advanced"
mermaid: |
  flowchart TD
      Ring["Consistent<br/>Hash Ring"]
      S1["Server 1"]
      S2["Server 2"]
      S3["Server 3"]
      AddNew["Add Server 4"]
      Impact["~25% keys<br/>remapped"]
      
      Ring --> S1
      Ring --> S2
      Ring --> S3
      AddNew --> Impact
      
      style AddNew fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

Consistent hashing maps keys to nodes in a distributed system so that adding or removing nodes only remaps a small fraction of keys, not all of them. This is crucial because it minimizes cache misses and rebalancing overhead when scaling clusters, making systems like Redis, Memcached, and CDNs efficient.
