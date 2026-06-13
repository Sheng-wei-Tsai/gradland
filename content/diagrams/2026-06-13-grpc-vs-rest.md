---
title: "gRPC vs REST"
date: "2026-06-13"
topic: "APIs"
difficulty: "intermediate"
mermaid: |
  flowchart LR
      A["gRPC"]
      B["REST"]
      C["Protobuf Serialization"]
      D["JSON Serialization"]
      E["HTTP/2 + Streaming"]
      F["HTTP/1.1 + Stateless"]
      G["Code Generation"]
      H["Manual Implementation"]
      
      A --> C
      A --> E
      A --> G
      B --> D
      B --> F
      B --> H
      
      style A fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

gRPC uses Protocol Buffers and HTTP/2 for high-speed binary communication between services, while REST uses JSON over HTTP/1.1 for human-readable text-based APIs. gRPC is faster and more efficient for service-to-service communication, but REST is simpler to debug and better for public APIs; choose gRPC for performance-critical internal systems and REST for broad compatibility.
