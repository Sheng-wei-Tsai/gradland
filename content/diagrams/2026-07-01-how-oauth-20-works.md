---
title: "How OAuth 2.0 Works"
date: "2026-07-01"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      autonumber
      actor U as User
      participant C as Client
      participant A as Auth Server
      participant R as Resource Server
      
      U->>C: Login
      C->>A: Authorize
      A->>U: Consent?
      U->>A: Yes
      A->>C: Code
      C->>A: Code+Secret
      A->>C: Token
      C->>R: Access
      R->>C: Data
      C->>U: Done
---

OAuth 2.0 is an authorization protocol that allows users to grant third-party applications access to their resources on another service without sharing passwords, using tokens instead of credentials. It eliminates the need to trust third-party apps with passwords, enables fine-grained permission scoping, and is the industry standard for secure delegated access across APIs.
