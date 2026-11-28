# Judging preparation status — November 28, 2026

## Verified work

- Baseline inspected: `5b0c38a89f32aeacfa8eac1e1fdf887b92c81661`.
- Baseline: 5/5 tests and production build passed.
- Candidate: 13/13 local tests and production build passed on Node 24.22.3. Unit SDK fixtures are synthetic; no test response is an AI inference result.
- A synthetic local-debug sentinel was absent from the production bundle.
- The CAGE multi-model planner, append-only event store, competition replay and learning process were actually executed from pinned canonical source `f805fde49060f9fd995e9ef96d669e9170f665cf`. Source blob checks matched. Planning made no external model calls, and it did not run a separate reviewer.
- CAGE retained the blocked inference gate and lesson. No submission or score event was recorded.
- The owner's connected Chrome opened the existing app at https://value-study-studio.vercel.app. The deliberate wrong order and corrected order behaved as expected.

## Real browser attempts on the existing hosted build

| Requested mode | Observed result | Verified inference |
| --- | --- | --- |
| On device only | “The AI coach needs a judging Firebase project. The palette exercise works here.” | No |
| In the cloud | Same configuration failure before inference | No |
| On device, with cloud fallback | Same configuration failure before inference | No |

The observed hosted script URL was `https://value-study-studio.vercel.app/assets/index-Bsh8Za4o.js`. No provider revision attestation was available. The new candidate has not been deployed or browser-tested; do not transfer the hosted baseline observations to the candidate.

Both inspected Firebase accounts displayed a welcome/setup page without an existing Firebase project. The Brick Bruce account initially displayed a two-step verification gate, which cleared on a later read. Its Google Cloud project picker listed `Default Gemini Project`; adding Firebase would change that existing project and was not performed. The inspected CAGE credential manifest listed no Firebase/App Check configuration. The local public configuration check returned exit code 2 (blocked). These checks do not establish that no project exists elsewhere.

## Repairs prepared

- Hybrid mode now initializes the device model before asking Firebase to generate or fall back.
- Service loading occurs in a separate preparation step before the request click initiates device initialization.
- Strict mode accepts only its expected SDK-reported source. Missing sources and empty responses fail.
- The browser can export real preparation/request outcomes with source fingerprint, selected mode, actual route and response, timestamps and environment. It does not export raw SDK exception messages or Firebase settings.
- Public configuration template and validation reject unfinished placeholders and credential-bearing extra fields. The Node requirement now matches the pinned Firebase package.
- Existing authorized App Check debug tokens can be used only in private loopback development; production retains normal App Check.

## Remaining steps

1. Approve the prepared, unsubmitted `Value Study Studio Judging` project proposal (proposed ID `value-study-studio-judging`) with a web app, AI Logic and App Check on a no-billing Spark plan, including the Firebase terms step; or identify an existing isolated judging project.
2. Obtain its authorized web configuration, App Check provider and matching HTTPS origin, or an existing authorized local debug token. Creating resources, registering new debug access, changing origins or billing needs specific approval. Optional Developer Program signup is off; no terms were accepted.
3. Run the candidate in that authorized Chrome environment, capture real `ON_DEVICE` and `IN_CLOUD` responses, then check the actual hybrid outcome. Retain failures and the original evidence export.
4. Review the development-only App Check path before any merge/release. Self-review and targeted regressions are recorded; no separate development reviewer or provider approval is claimed.

`true_rsi=false`, `true_agi=false`. No new deployment, video publication, Devpost submission, Firebase resource or billing change was performed. The review branch disables its own automatic Vercel deployment. Keep this PR draft/unmerged while the no-deploy instruction remains in force.
