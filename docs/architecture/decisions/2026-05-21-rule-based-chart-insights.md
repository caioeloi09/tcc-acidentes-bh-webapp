# ADR-0006: Rule-based chart insights instead of an LLM

**Date:** 2026-05-21

## Status

Accepted

## Stakeholders

- Caio Eloi Campos (Developer)
- Prof. João Guilherme Maia de Menezes (Advisor)

## Context and Problem Description

Each chart on the dashboard is accompanied by a short natural-language
"How to interpret" note that summarises the most relevant pattern (the peak year,
the busiest hour, the leading accident type, and so on). The goal is to make the
visualisations accessible to non-technical users.

The decision is **how to generate that explanatory text**: call a Large Language
Model (LLM) at runtime, or derive the text deterministically from the same data
that feeds the chart.

## Decision Criteria

- Correctness and consistency with the displayed numbers
- Latency and runtime cost
- External dependencies and API keys/secrets
- Reproducibility and testability
- Privacy (no data sent to third parties)

## Options Considered

1. **Rule-based generation** in the frontend from the chart data
2. **LLM-generated text** at runtime via an external API
3. **No textual insight** (charts only)

## Decision Outcome

Chosen option: **rule-based, deterministic generation** implemented in
`ChartInsight.tsx`.

For each chart type (`byYear`, `byHour`, `byWeekday`, `byType`,
`topNeighborhoods`) a pure function computes the relevant statistics —
peak/maximum, trend direction, share of total, weekday-vs-weekend averages — and
formats a sentence with locale-aware number formatting (`pt-BR`). The functions
are covered by unit tests in `ChartInsight.test.tsx`.

### Justification

Because the insight is a deterministic summary of values already present on the
client, it can be computed instantly, for free, and is guaranteed to match the
chart. This avoids network latency, API keys, per-request cost, and the risk of an
LLM producing numbers that disagree with the visualisation. It is also fully
unit-testable, which an LLM call is not. The trade-off — that the phrasing is
templated rather than free-form — is acceptable for short interpretive captions.

### Positive Consequences

- Insights always agree with the numbers in the chart.
- No external API, no API key/secret, no per-request cost, no added latency.
- Deterministic and unit-tested.
- No accident data leaves the user's browser.

### Negative Consequences

- The wording is templated and less flexible than free-form generation.
- New kinds of insight require new code rather than a prompt change.
- The heuristics (e.g. mapping an hour to "morning/afternoon/evening") are
  hand-authored and must be maintained.

## Pros and Cons of the Options

### Rule-based generation

**Pros:** correct, instant, free, testable, private.
**Cons:** templated phrasing; new insights need code.

### LLM at runtime

**Pros:** flexible, fluent, can surface unexpected angles.
**Cons:** latency and cost; requires secrets; risk of hallucinated numbers; not deterministic; sends data to a third party.

### No textual insight

**Pros:** simplest possible implementation.
**Cons:** less accessible to non-technical users; misses the educational goal.

## Links

- `frontend/src/components/ChartInsight.tsx`
- `frontend/src/components/ChartInsight.test.tsx`
- [ADR-0007 — Per-layer testing strategy with GitHub Actions CI](./2026-05-21-testing-and-ci-strategy.md)
