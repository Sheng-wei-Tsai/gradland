---
title: "How OAuth 2.0 Works"
date: "2026-06-26"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor User
      participant Client App
      participant Auth Server
      participant Resource Server
      
      User->>Client App: Click "Login with Provider"
      Client App->>Auth Server: Redirect to /authorize
      Auth Server->>User: Show login & consent
      User->>Auth Server: Grant permission
      Auth Server->>Client App: Redirect with code
      Client App->>Auth Server: POST code + secret
      Auth Server->>Client App: Return access token
      Client App->>Resource Server: Request data + token
      Resource Server->>Client App: Return protected resource
      Client App->>User: Logged in & authorized
---

OAuth 2.0 is an authorization protocol that lets users grant third-party applications access to their resources on another service without sharing their password. It matters because it enables secure delegated access, reducing credential exposure and letting users revoke app permissions independently without changing their password.
