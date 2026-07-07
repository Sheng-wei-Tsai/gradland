---
title: "Build a Public RAG Eval Suite in 4 Hours"
date: "2026-07-07"
excerpt: "Most 485 holders have built RAG prototypes. Almost none can prove their output quality with numbers. Here's how to fix that in a single weeknight."
tags: ["Career Edge", "RAG Evaluation", "RAGAS", "Portfolio", "485 Visa"]
coverEmoji: "📊"
pillar: "eval-driven-projects"
cross_link: "/learn"
visa_pathway: "485"
auto_generated: true
---

Building a RAG pipeline is now entry-level work for any AI engineering role in Australia. The question that separates candidates in 2026 is not "can you build one?" — it's "how do you know it works?" When a tech lead asks that in an interview, "I tested it manually" is not the answer they want. They want metrics. They want regression detection. They want a number that goes up or down when you change the chunking strategy.

The gap is publicly demonstrable. Most 485 holders I've spoken to have built RAG things — during uni, in side projects, at internships. Almost none of them can open a GitHub tab in the interview and show a structured eval suite with scored outputs. The ones who can have a concrete advantage.

This article is specifically about the public part. Not a perfect eval framework — a real one, live on GitHub, with actual scores in the README, that you can build on a weeknight.

---

## Why "public" beats "polished"

Private projects don't answer the hiring question. A recruiter or tech lead looking at your resume can't verify "built RAG pipeline with LLM evaluation" — it reads like every other AI resume claim in 2026.

A public repository changes the verification dynamic entirely. A tech lead can clone it, read the eval code, check the metric scores, and form their own opinion about your technical depth. You don't need a perfect project — you need a credible one. Credibility comes from specificity: real documents, real questions, real metric scores that show you understand what the numbers mean.

The standard tool for this in 2026 is RAGAS. The GitHub repo (`github.com/explodinggradients/ragas`) has 14.7k stars as of this writing, which makes it the most widely recognised RAG evaluation library in Python. It provides four metrics out of the box — faithfulness, answer relevancy, context precision, and context recall — that map directly to the failure modes tech leads worry about in production RAG systems.

---

## Hour 1: Environment and documents

Start with your Python environment and a document corpus. The corpus choice matters for your portfolio narrative — pick something AU-specific so it reads as intentional.

Good options:
- ATO plain-English tax guides (publicly licensed, downloadable from ato.gov.au)
- DIBP visa condition fact sheets (public government documents)
- ASX-listed company annual reports (free PDFs, large, chunky)

Aim for 5-10 documents totalling 50-200 pages. Small enough to process quickly, large enough to produce realistic retrieval results.

Install dependencies:

```bash
pip install ragas langchain langchain-openai langchain-community \
            faiss-cpu openai python-dotenv
```

You'll need an OpenAI API key — RAGAS's LLM-as-judge evaluators default to GPT-4o-mini, which costs fractions of a cent per evaluation call. A 30-question eval run over three metrics costs well under $1.

Build your RAG pipeline. Nothing fancy — chunked documents, FAISS vector store, a simple retrieval chain:

```python
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA

loader = PyPDFDirectoryLoader("data/raw/")
docs = loader.load()

splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=50)
chunks = splitter.split_documents(docs)

embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(chunks, embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    return_source_documents=True
)
```

---

## Hour 2: Build your eval dataset

This is the most important step and the one most people skip. Your eval dataset is what makes the project credible — it's proof you understand that evaluation requires ground truth.

Create `data/eval_dataset.json` with 25-30 questions and expected answers drawn from your documents. For each entry you need: the question, the expected answer (what the document actually says), and an optional reference to which document it comes from.

```json
[
  {
    "question": "What is the standard working hours condition for a 485 visa holder?",
    "ground_truth": "Subclass 485 visa holders have unrestricted work rights and can work any number of hours for any employer.",
    "source": "visa-485-conditions.pdf"
  },
  {
    "question": "What is the Medicare levy surcharge rate for individuals earning above the threshold?",
    "ground_truth": "The Medicare levy surcharge is between 1% and 1.5% depending on income tier.",
    "source": "ato-medicare-guide.pdf"
  }
]
```

Write 25-30 of these. Yes, it takes 30-45 minutes. That's the work. The dataset is what makes your eval suite distinguishable from someone who just called `evaluate()` on random outputs.

Run your chain over each question and collect the responses and retrieved contexts:

```python
import json

with open("data/eval_dataset.json") as f:
    dataset = json.load(f)

results = []
for item in dataset:
    response = chain.invoke(item["question"])
    results.append({
        "question": item["question"],
        "ground_truth": item["ground_truth"],
        "answer": response["result"],
        "contexts": [doc.page_content for doc in response["source_documents"]]
    })
```

---

## Hour 3: Run the three metrics that matter

RAGAS provides four core metrics. Use three of them for this project.

**Faithfulness** measures whether the answer makes claims that can be supported by the retrieved context. RAGAS breaks the answer into individual statements, checks each against the retrieved documents, and divides supported claims by total claims — giving a score from 0 to 1. (Source: docs.ragas.io/en/latest/concepts/metrics/available_metrics/faithfulness/) A faithfulness score below 0.7 in a production system means your RAG is regularly making things up. A score of 1.0 means every statement in every answer was grounded in what was retrieved.

**Answer Relevancy** measures whether the answer actually addresses the question. The calculation is deliberately clever: RAGAS asks an LLM to reverse-engineer questions from your answer, then measures cosine similarity between those reconstructed questions and the original question. (Source: docs.ragas.io/en/latest/concepts/metrics/available_metrics/answer_relevance/) A high score means if someone read only your answer, they'd reconstruct a question close to the one asked. A low score means your answer is off-topic or evasive.

**Context Precision** measures whether the retrieved documents are actually relevant — specifically, whether the most relevant chunks appeared at the top of the retrieval results. This is where chunking and retrieval strategy show up as numbers.

Run all three with RAGAS:

```python
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision

ragas_dataset = Dataset.from_list([
    {
        "question": r["question"],
        "answer": r["answer"],
        "contexts": r["contexts"],
        "ground_truth": r["ground_truth"]
    }
    for r in results
])

scores = evaluate(ragas_dataset, metrics=[
    faithfulness,
    answer_relevancy,
    context_precision
])

print(scores)
```

Save the output to `results/baseline.json`. This is your baseline — the numbers your pipeline produced at chunk size 512, `k=4` retrieval.

Now make one deliberate change. Change chunk size to 1024 or change `k` from 4 to 8. Re-run the chain over the same dataset. Save to `results/experiment_01.json`. Did faithfulness go up or down? Did context precision improve?

That comparison is the entire point. You've demonstrated the eval loop: change something, measure the effect, know whether it helped.

---

## Hour 4: Write the README and publish

This is where most engineers underinvest. Your README is the interface between your work and the tech lead reading it. Structure it in this exact order:

**1. What this evaluates (one sentence):** e.g., "A RAG pipeline over Australian Tax Office plain-English guides, evaluated on faithfulness, answer relevancy, and context precision using RAGAS."

**2. Results table (required):**

```markdown
| Metric             | Baseline (chunk=512) | Experiment 1 (chunk=1024) |
|--------------------|---------------------|--------------------------|
| Faithfulness       | 0.84                | 0.79                     |
| Answer Relevancy   | 0.91                | 0.88                     |
| Context Precision  | 0.73                | 0.81                     |
```

Show your real numbers, not invented ones. If an experiment made things worse, say so — that's what makes it credible. "I tried increasing chunk size and faithfulness dropped" is a more sophisticated finding than a table where everything goes up.

**3. Architecture (bullet list):** Loader → chunker → FAISS vector store → GPT-4o-mini generator → RAGAS evaluator. Two sentences max.

**4. How to reproduce:** `git clone`, `pip install -r requirements.txt`, `python src/run_evals.py`. If it doesn't work in under five minutes for someone who clones it, fix it.

**5. What I'd do next:** One honest sentence: "Next step is adding context recall and testing a cross-encoder reranker." This signals you understand what's missing.

Name the repo `rag-eval-[domain]`. Push it. Pin it on your GitHub profile.

Then write one sentence for your LinkedIn Projects section that cites an actual number: "Built a RAGAS eval suite over a 30-question AU government document dataset; detected a 5-point faithfulness drop when increasing chunk size from 512 to 1024 tokens."

The specificity of that sentence — one real number, one real finding — does more work than any vague AI experience claim.

---

## What this does for the visa pathway

The 485 visa gives you two to four years of post-study work rights. The conversion to a 186 (employer nomination) or 190 (state nomination) requires demonstrating that an employer wants to sponsor you — and for that, you need to be demonstrably good at something they can't easily hire locally.

In AI engineering, "demonstrably good" increasingly means showing you can own quality, not just ship features. Eval expertise sits at the intersection of software engineering rigour and ML awareness — it's a skill that translates directly to production credibility. A tech lead who sees your eval suite doesn't need to take your word for your technical depth; they can verify it.

For an ACS skills assessment — which you'll need for most state nomination pathways — the assessment looks at whether your documented work demonstrates competency at the appropriate ANZSCO skill level. Public GitHub work you can reference in your personal statement is stronger than private experience that can't be verified. That's not the primary reason to build this project, but it's a real secondary benefit.

The primary reason is that you'll answer the interview question better than anyone else in the room.

---

## This week

- **Tonight:** Pick a public-domain AU document corpus (ATO guides, DIBP visa fact sheets) and download 5-10 files.
- **Tomorrow night:** Build the RAGAS pipeline and write your 25-question eval dataset — this is the slow part, budget 45 minutes for the questions.
- **Night three:** Run baseline evals, run one experiment, record both in `results/`.
- **Night four:** Write the README with your results table, push to GitHub, pin the repo.
- **Before Monday:** Update LinkedIn Projects with one sentence that cites a real metric and a real finding.

---

If you want a structured path through AI engineering that covers evals in the context of a full learning curriculum, [Gradland's learning paths →](/learn) organise the skills in the order AU employers are actually hiring for.

For context on how AI engineering roles sit within the 485 → 186 visa pathway and which ANZSCO codes apply, the earlier Career Edge piece on [AI Engineering on the 2026 Core Skills Occupation List](/career-edge/2026-06-21-ai-engineering-csol-2026-485-to-186-path) covers the ACS assessment and occupation list in detail.
