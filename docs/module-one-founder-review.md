# Revised Module 1 — founder review, November 13, 2026

This is a functioning review implementation in the existing platform repository. It is not a production-ready release. The review entry point deliberately bypasses account initialization and cannot read or write production records. Fictional Rowan/Alex profiles use distinct browser-local keys. They are not authenticated accounts. Browser-local persistence works on one device; account/cross-device persistence remains unimplemented for this revision.

## Verified deployment ownership and existing implementation
- buildotherwise.org belongs to Vercel `buildotherwise-workbook`, project prj_bwtJ5E02BAcZqrIrFceZ825ek9Kj.
- Production source: ash1102/Buildotherwise, feature/discovery-companion-invitations, commit 7d21676bd9cd4234ca4c5f374ecd9503f4c3406a. Main differs. README deployment notes are stale.
- Existing Module 1: src/components/workbook/moduleOne/{NoticeLesson,AttentionLesson,AgreementLesson}.jsx. LessonView selects the existing lesson owners; lesson/module content also lives in Supabase lesson/module tables.
- Existing answers/stepState: workbook.js + store.js, account-scoped local keys and accountSync.js UserStore -> Supabase user_store via supabaseCompat.js. No existing answer keys migrated.
- Existing Life Map: lifeMap.js, LifeMapPage.jsx, map components, workbook lifeMap/account sync. Its existing categories do not encode all six revised evidence types with source revisions.
- Existing companion: GlobalDiscoveryCompanion, CompanionConversation, /api/discoveryCompanion, api/_lib/companion.js, api/_lib/gemini.js. GEMINI_API_KEY is configured for preview and production, verified by metadata only. No key was decrypted. Existing server discovers available Gemini models. No end-to-end Gemini success verified in this assignment. No companion server changes made.
- Base44 configuration/function/entity sources are retained; live custom-domain deployment is Vercel/Supabase. No Base44 editor session was used.
- Supabase entrepalooza project psqlrrpdkgzzaxoihtcs is active. Schema metadata read only; no participant row content read, no SQL mutations.

## Implementation
Review build: VITE_MODULE_ONE_REVIEW=1 npm run build. Deployed preview uses this mode only on the named revision branch in Vercel preview environment. Production builds use normal App. The regular app also registers /preview/module-one-revised under the existing AdminOnly gate, for later integration review.
Reused existing theme, font, Button, and extracted SingleChoice/Panel/P primitives. Existing consumers re-export those unchanged primitives. No modules 2–5, content rows, account sync, or companion implementation replaced.
New review keys and R1 lesson IDs isolate old progress. All lesson routes open without completion gates. Explicit finish state differs from answer presence. Optional examples, deeper investigations, and a no-personal-writing route are supported.

## Lesson walkthrough
1. Identity: examine Sam's organizing example; separate observations, roles, expectations and explanations; choose an ordinary example, fictional investigation, or looking around; optionally compare alternative explanations.
2. Mind: accessible personality/attention/motivation/context explanations; compare Ren's participation in two settings; choose a lens; accept, qualify or reject an interpretation; optionally seek counterexamples.
3. Unexplored possibilities: open sound sequencing, service access, leaf comparison or troubleshooting; try/ imagine/observe and distinguish the encounter mode; record curiosity separately from access barriers; choose a revisable participation agreement and next question.
Each lesson can contribute a participant-selected entry. No answer automatically becomes an identity conclusion.

## Life Map demonstration
Write a tentative question -> preview exact wording/category -> Keep this entry -> Review Life Map -> Save correction -> inspect earlier wording. Six selectable categories: observation, question, interest, possible ability, hypothesis/interpretation, unexplored possibility. Stable IDs and revision history retained. Source changes flag review rather than overwrite accepted text. Remove from map leaves lesson answers intact. Map persistence is review-local, not the existing production map store.

## Companion
Clearly labeled authored, non-AI guidance provides concept-specific alternatives. No input analysis, dynamic follow-up or AI memory is claimed. No second AI service introduced. Connecting the existing authenticated companion to revision context and participant-approved entries remains required after repair verification. No evidence that another repair agent is actively working was available in this session.

## Tests and limits
- Review build passes.
- Three focused tests pass: source-change preservation/revision history; completion/map independence; production-adapter isolation.
- Browser verified: all three lessons accessible; identity feedback; attention lens and disagreement; sound process; saved text; no-disclosure navigation; explicit finish; selected map carry-forward; correction/history after reload; separate Rowan/Alex profiles.
- Existing suite at deployed baseline: 171/176 pass, five failures (three companion mocks/input tests, two dashboard expectations). Same five failures before revision. Do not report a clean full suite.
- Mobile viewport/device, keyboard-only audit, disabled/full storage, concurrent tabs, export download, authenticated fictional accounts, cross-device sync and live Gemini remain untested.
- No production participant records modified; review bundle has no network/production storage adapter. A database-wide before/after audit was not performed.

## Before participant rollout / Module 2
Use a separate test database or branch for authenticated fictional accounts; integrate versioned response/map data with account sync without rewriting existing progress; test source revisions and retry/conflict handling; connect the single existing companion with explicit approved-context selection and verify real Gemini replies; test mobile and accessibility; preserve full existing readings and gallery as accessible resources in the integrated experience; founder curriculum review and explicit production release approval remain necessary. Module 2 development follows the new potential/abilities/motivation/environment emphasis; existing exploration and small-try content stays preserved for reuse in Modules 3 and 5.
