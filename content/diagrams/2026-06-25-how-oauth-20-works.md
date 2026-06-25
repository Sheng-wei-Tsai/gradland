---
title: "How OAuth 2.0 Works"
date: "2026-06-25"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor User
      participant Client as Client App
      participant Auth as Auth Server
      participant Resource as Resource Server
      
      User->>Client: Click "Login"
      Client->>Auth: Redirect (client_id, scope)
      Auth->>User: Login & consent screen
      User->>Auth: Approve access
      Auth->>Client: Redirect with code
      Client->>Auth: Exchange code for token
      Auth->>Client: Return access token
      Client->>Resource: Request with token
      Resource->>Client: Return user data
---

OAuth 2.0 is a protocol that allows users to grant third-party applications access to their resources without sharing passwords, using authorization tokens instead. It matters because it enables secure delegated access, reduces password exposure, and powers the "Sign in with Google/GitHub" patterns you see everywhere.
