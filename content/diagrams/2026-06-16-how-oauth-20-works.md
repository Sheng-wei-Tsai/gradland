---
title: "How OAuth 2.0 Works"
date: "2026-06-16"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor U as User
      participant C as Client App
      participant A as Auth Server
      participant R as Resource Server
      
      U->>C: 1. Click Login
      C->>A: 2. Redirect + client ID
      A->>U: 3. Show consent screen
      U->>A: 4. Grant permission
      A->>C: 5. Return auth code
      C->>A: 6. Exchange code + secret
      A->>C: 7. Return access token
      C->>R: 8. Request resource
      R->>C: 9. Return user data
      C->>U: 10. Logged in ✓
---

OAuth 2.0 is an open standard that lets users authorize third-party applications to access their data on another service without sharing their password. It matters because it eliminates the need for users to trust every app with their credentials, reducing attack surface and enabling secure delegated access across services.
