---
title: "How OAuth 2.0 Works"
date: "2026-06-30"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor User
      participant App as Client App
      participant Auth as Auth Server
      participant API as Resource Server
      
      User->>App: 1. Click login
      App->>Auth: 2. Redirect
      User->>Auth: 3. Authenticate
      Auth->>App: 4. Code
      App->>Auth: 5. Exchange code
      Auth->>App: 6. Access token
      App->>API: 7. Request
      API->>App: 8. Resource data
---

OAuth 2.0 is an authorization protocol that lets users grant third-party apps access to their resources without sharing passwords. It matters because it's the industry standard for secure delegated access, enabling you to build integrations that users trust and reducing your app's liability for storing credentials.
