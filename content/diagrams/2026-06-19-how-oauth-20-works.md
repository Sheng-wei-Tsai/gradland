---
title: "How OAuth 2.0 Works"
date: "2026-06-19"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      participant User
      participant Client App
      participant Authorization Server
      participant Resource Server
  
      User->>Client App: Click login
      Client App->>Authorization Server: Request authorization
      Authorization Server->>User: Show permission screen
      User->>Authorization Server: Grant permission
      Authorization Server->>Client App: Return auth code
      Client App->>Authorization Server: Exchange code+secret
      Authorization Server->>Client App: Return access token
      Client App->>Resource Server: Request with token
      Resource Server->>Client App: Return user resource
      Client App->>User: User authenticated
---

OAuth 2.0 lets users authorize third-party apps to access their data without sharing passwords—the user logs into the original service, grants permission, and the app gets a token to make requests on their behalf. It matters because it prevents users from sharing credentials, reduces security risks, and lets services revoke access independently.
