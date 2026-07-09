---
title: "How OAuth 2.0 Works"
date: "2026-07-09"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor User
      participant Client as Client App
      participant Auth as Auth Server
      participant API as API Server
      
      User->>Client: 1. Login
      Client->>Auth: 2. Redirect + client_id
      Auth->>User: 3. Consent Screen
      User->>Auth: 4. Grant Permission
      Auth->>Client: 5. Authorization Code
      Client->>Auth: 6. Exchange Code + Secret
      Auth->>Client: 7. Access Token
      Client->>API: 8. Request Data
      API->>Client: 9. Return User Info
---

OAuth 2.0 is an authorization standard that lets users grant third-party applications access to their accounts at another service (like logging in with Google) without sharing their password. It matters because it eliminates password-sharing risk, enables single sign-on across platforms, and allows services to delegate authentication to trusted providers while maintaining user privacy.
