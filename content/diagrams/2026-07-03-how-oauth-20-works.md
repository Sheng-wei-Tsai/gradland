---
title: "How OAuth 2.0 Works"
date: "2026-07-03"
topic: "Security"
difficulty: "intermediate"
mermaid: |
  sequenceDiagram
      actor User
      participant Client as Client App
      participant Auth as Auth Server
      participant Resource as Resource Server
  
      User->>Client: 1. Login
      Client->>Auth: 2. Redirect with client_id
      Auth->>User: 3. Login & consent screen
      User->>Auth: 4. Authenticate
      Auth->>Client: 5. Authorization code
      Client->>Auth: 6. Exchange code (backend)
      Auth->>Client: 7. Access token
      Client->>Resource: 8. Request user data
      Resource->>Client: 9. User data
      Client->>User: 10. Session created
---

OAuth 2.0 is a protocol that lets users authorize third-party applications to access their resources on another service without sharing their password directly, using tokens instead. It matters because it improves security by limiting app access, eliminates password sharing across services, and enables seamless platform integration.
