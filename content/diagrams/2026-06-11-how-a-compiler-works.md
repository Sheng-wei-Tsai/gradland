---
title: "How a Compiler Works"
date: "2026-06-11"
topic: "Backend"
difficulty: "intermediate"
mermaid: |
  flowchart LR
    source["Source Code"]
    lexer["Lexer<br/>Tokens"]
    parser["Parser<br/>AST"]
    semantic["Semantic<br/>Analysis"]
    codegen["Code<br/>Generation"]
    opt["Optimization"]
    binary["Machine Code"]
    
    source --> lexer
    lexer --> parser
    parser --> semantic
    semantic --> codegen
    codegen --> opt
    opt --> binary
    
    style parser fill:#c0281c,color:#fff,stroke:#140a05,stroke-width:2px
---

A compiler transforms human-readable source code into machine-executable instructions by parsing syntax, analyzing semantics, and generating optimized binary output. Understanding compilers matters because it reveals how languages enforce correctness, how optimizations impact runtime performance, and how to write better code that cooperates with the compiler's optimization passes.
