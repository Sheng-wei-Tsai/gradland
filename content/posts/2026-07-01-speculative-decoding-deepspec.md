---
title: "Speculative Decoding: Faster LLMs Without Bigger Hardware"
date: "2026-07-01"
excerpt: "DeepSeek just dropped a full training framework for speculative decoding draft models. Here's what speculative decoding actually does, why it matters for production AI apps, and how to use it today."
tags: ["AI", "LLM", "Performance"]
coverEmoji: "⚡"
auto_generated: true
source_url: "https://github.com/deepseek-ai/DeepSpec"
---

DeepSeek published [DeepSpec](https://github.com/deepseek-ai/DeepSpec) last week — a full-stack framework for training and evaluating speculative decoding draft models. It hit 5,600+ GitHub stars inside four days. If you're building AI-powered apps and haven't thought seriously about speculative decoding yet, now's a good time.

## What Speculative Decoding Actually Does

The core problem with LLM inference: each new token requires a full forward pass through the model. Those passes can't be parallelised across tokens — you have to wait for token N before generating token N+1. For a 70B parameter model, that's expensive and slow.

Speculative decoding flips this around. Instead of one big model doing all the work, you pair it with a tiny *draft* model — typically 5–10x smaller. The draft model generates a batch of candidate tokens quickly. The large model then verifies the whole batch in a single parallel forward pass.

Here's the key insight: verification is fundamentally cheaper than generation. The large model processes all candidate tokens simultaneously, accepting ones that match what it would have produced and rejecting the first one that doesn't. When the draft model gets a run of tokens right, you've effectively skipped N−1 expensive forward passes.

In practice, acceptance rates depend heavily on how well the draft model matches the target's distribution. A well-trained draft model for a specific domain (code, chat, reasoning) typically achieves 70–85% acceptance rates, translating to 2–3x throughput gains with no change in output quality.

## The Problem DeepSpec Solves

The tricky part isn't the decoding algorithm itself — vLLM, llama.cpp, and HuggingFace Transformers all support speculative decoding already. The hard part is *training a good draft model*.

You can use an existing smaller model (e.g., pair Llama-70B with Llama-7B), but acceptance rates are often mediocre because the smaller model wasn't trained to mimic the larger one's output distribution. A purpose-trained draft model that learns directly from the target model's outputs is significantly better.

That's what DeepSpec provides: a full pipeline to train your own draft model against a specific target.

```bash
# DeepSpec workflow in three stages
# 1. Data prep — download prompts, regenerate target answers,
#    build a target cache (warning: can be 38TB+ for large targets)
python scripts/data/prepare.py

# 2. Train a draft model against cached target outputs
bash scripts/train/train.sh

# 3. Evaluate acceptance rate on benchmarks (gsm8k, math500, etc.)
bash scripts/eval/eval.sh
```

The target cache approach is clever: you pre-compute the large model's token probability distributions offline, then train the draft model to match them — no need to have the target model running during training.

## Using Speculative Decoding Today

You don't need to train a custom draft model to start using this. If you're running models locally or self-hosting, you can enable speculative decoding with existing model pairs right now.

With HuggingFace Transformers:

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load target + draft models
target = AutoModelForCausalLM.from_pretrained("deepseek-ai/DeepSeek-V3")
draft  = AutoModelForCausalLM.from_pretrained("deepseek-ai/DeepSeek-V3-Draft")
tokenizer = AutoTokenizer.from_pretrained("deepseek-ai/DeepSeek-V3")

inputs = tokenizer("Explain async/await in Python:", return_tensors="pt")

# Pass the draft model — transformers handles the speculation loop
outputs = target.generate(
    **inputs,
    assistant_model=draft,
    max_new_tokens=256,
)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

With vLLM (what most production deployments use):

```python
from vllm import LLM, SamplingParams

llm = LLM(
    model="deepseek-ai/DeepSeek-V3",
    speculative_model="deepseek-ai/DeepSeek-V3-Draft",
    num_speculative_tokens=5,   # draft tokens per step
    tensor_parallel_size=4,     # across 4 GPUs
)

outputs = llm.generate(
    ["Write a TypeScript function that debounces an async function:"],
    SamplingParams(temperature=0.7, max_tokens=512)
)
print(outputs[0].outputs[0].text)
```

The `num_speculative_tokens` parameter is worth tuning. Higher values mean more parallelism but lower acceptance rates. 4–8 is a reasonable starting point; profile against your actual prompts.

## What I'd Build With This

**Domain-specific draft models for production services.** If your app always sends prompts in a narrow domain — say, code review comments or visa application summaries — a draft model trained on that domain's outputs should hit much higher acceptance rates than a generic small model. DeepSpec gives you the tooling to build that. For a high-throughput API serving thousands of requests, the latency improvement compounds fast.

**Faster streaming in Next.js AI apps.** Time-to-first-token matters, but so does token generation speed mid-stream. Speculative decoding primarily speeds up throughput (tokens/second), not TTFT — but that directly affects how snappy the stream feels to the user. If you're building with the Vercel AI SDK and self-hosting your model, dropping speculative decoding in front of it is one of the higher-leverage changes you can make.

**Cost-efficient self-hosted inference.** Cloud API calls for high-volume apps get expensive fast. A self-hosted 70B model with a purpose-trained 7B draft model, serving on four A100s, can handle serious load with 2–3x better throughput. DeepSpec makes the "train your own draft" step practical rather than research-grade.

---

The speculative decoding idea has been around since 2022 (the original Google Brain paper), but tooling to actually *build* custom draft models has lagged. DeepSpec closes that gap. Worth watching — and if you're running your own inference, worth experimenting with immediately.
