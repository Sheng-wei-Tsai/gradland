---
title: "How OAuth 2.0 Works"
date: "2026-06-20"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor User
      participant App as Client App
      participant Auth as Auth Server
      participant API as Resource Server
      
      User->>App: 1. Click login
      App->>Auth: 2. Request authorization
      Auth->>User: 3. Consent screen
      User->>Auth: 4. Grant access
      Auth->>App: 5. Send auth code
      App->>Auth: 6. Exchange code→token
      Auth->>App: 7. Return token
      App->>API: 8. Access resource
      API->>App: 9. Return data
      App->>User: 10. Authenticated
---

OAuth 2.0 is an authorization protocol that lets users grant third-party apps access to their resources without sharing passwords — the user authenticates with the original service, which then issues a token the app can use. It matters because it's the industry standard for secure delegation: it eliminates password sharing, limits what each app can access, and makes revocation instant.
