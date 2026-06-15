# CLAUDE.md — Autonomous Execution Protocol

> Loaded into context at the start of every session. Hard rules, not suggestions.

## 1. Prime Directive
Execute the entire task end-to-end, then report. Never stop mid-stream to ask whether to continue. "Shall I continue?" is banned. The only legitimate stops are the irreversible actions in §4.

## 2. Self-Continuation
Announcing a next step IS the trigger to do it — not to hand control back. End a turn only when the backlog is empty, you hit a §4 stop, or a §5 context checkpoint. Work in a loop: pull next BACKLOG item → implement fully → verify (§9) → commit+push → check off → next, no pause between items.

## 3. Decisions You Make Yourself (never ask)
Naming, structure, which utility/library, code style, minor refactors, obvious error handling/types/tests, choosing the clearly-better approach, obviously-needed files, clearly-required deps. State the choice in one line; don't open a question.

## 4. The ONLY Reasons to Stop and Ask
- History rewrite (rebase, reset --hard, force-push, amending pushed commits)
- Destructive data (dropping tables, deleting data, rm -rf on non-build paths)
- Secrets (writing real keys/passwords/tokens into the codebase)
- Production side effects (real emails/payments/prod webhooks/prod DB writes)
- Massive scope jump far outside what was asked

Everything else: decide → act → report. When unsure, take the reversible path and note it.

## 5. Context Survival
Commit at every task boundary. Self-compact at clean boundaries (~60% context). Never compact mid-implementation. State lives in files (CLAUDE.md, BACKLOG.md, git history), not conversation.

## 6. Plan Before Big Work
For >2 files or a new module: trace code read-only, write a short plan (files, approach, edge cases, verification), restate it, execute. Skip for small fixes.

## 7. Backlog-Driven Autonomy
Work queue lives in BACKLOG.md. Always pull the next unchecked item yourself. Check off with commit SHA. Append new sub-tasks instead of stopping. Only ask for direction if BACKLOG.md is missing or empty.

## 8. Git Workflow (pre-authorized)
add/commit/push, branches, PRs, git config for own identity, merging own green branch. Commit small and often, conventional-style. Confirmation only for §4 history-rewrite ops.

## 9. Definition of Done
All must pass (run them, don't assume): every step complete · tsc green · lint green · tests green · build succeeds · committed+pushed · PR updated if exists · BACKLOG item checked with SHA. Red gate → fix → re-run.

## 10. Final Report Format
One compact block: Done count · Changes (sha/type/what) · Decisions · Verification · Backlog (X done/Y remaining) · For you to check. Then keep going if backlog has items.

## 11. Errors
Fix yourself first. Blocked after 2 attempts → report what failed and what you tried. Never stop silently.

## 12. Tone
Terse. No preamble. Lead with the work. Inline one-liners over paragraphs.

-----

## Project context
This repo is **Content OS** (see `Constitution` / README) — marka beyni + sektör zekası ile yayına hazır sosyal medya içerik paketi üreten SaaS. Stack: Next.js App Router + TS + Tailwind, Anthropic Claude API (`claude-sonnet-4-6`), Supabase (opsiyonel).

Verification chain: `npm run typecheck` · `npm run lint` · `npm test` · `npm run build`.
