---
title: "How OAuth 2.0 Works"
date: "2026-06-29"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      participant User
      participant Client as Client App
      participant Auth as Auth Server
      participant Resource as Resource Server
      User->>Client: Click login
      Client->>Auth: Redirect for auth
      Auth->>User: Show login form
      User->>Auth: User logs in
      User->>Auth: Grant permission
      Auth->>Client: Return auth code
      Client->>Auth: Exchange code (backend)
      Auth->>Client: Return access token
      Client->>Resource: Request user data
      Resource->>Client: Return user data
      Client->>User: Login complete
---

OAuth 2.0 is an authorization protocol that lets users grant third-party applications access to their resources without sharing passwords, by redirecting them to log in with their identity provider. It matters because it's the industry-standard way to securely delegate access, powering login flows on most platforms while keeping credentials safe and enabling revocable, scoped permissions.
