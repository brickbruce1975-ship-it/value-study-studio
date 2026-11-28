# Value Study Studio judging run

Deadline: November 30, 2026 at **4 p.m. Central** (22:00 UTC). The organizer's November 27 reminder identifies this deadline and requests a public demonstration of about three minutes. This build has not been deployed, filmed, published or submitted by the preparation task.

## Current proof boundary

- The original five scoring tests passed and the original production build succeeded on Node 24.22.3.
- Additional control-flow/configuration tests use synthetic SDK doubles. They never contact a model.
- Genuine device and cloud inference remain **unverified** until the live sequence below produces the corresponding SDK sources and real responses.
- The existing repository homepage, https://value-study-studio.vercel.app, was opened in the owner's connected Chrome on November 28. Incorrect and correct palette flows passed. Device-only, cloud-only and hybrid requests each reported that the AI coach needs a judging Firebase project; these are real configuration failures before inference. This existing hosted build is separate from the new local candidate. Its observed script URL ended in `assets/index-Bsh8Za4o.js`; no provider revision attestation was available.
- `true_rsi=false`, `true_agi=false`. Build success, an SDK import or a configured project does not change those flags or CAGE runtime classifications.

## Existing configuration, with no new resources

1. In Chrome, open the existing Firebase console under the account that owns the judging project. The November 28 inspection saw no project under the Arsenal account. The Brick Bruce account was blocked by Firebase's required two-step verification. The account owner must complete that personal security setup; do not disable or bypass it.
2. Select an already authorized, isolated judging project. In Project settings → General → Your apps, select its existing web app and copy the public web configuration. Do not use a production project merely because it is accessible.
3. Confirm Firebase AI Logic is already enabled with the Gemini Developer API. Confirm App Check is enforced for AI Logic and the existing web app is registered with reCAPTCHA Enterprise for the exact HTTPS judging origin. Read-only confirmation is safe; creating a project/app/key, registering a debug token, enabling services, changing origins or changing billing requires the owner's specific approval first.
4. Create the directory `public` and copy `judge-config.example.json` to `public/judge-config.json`. Replace every placeholder with public settings from that same web app. Optional Firebase settings can be omitted if absent in the console. Keep the file untracked. Run `npm run check:config`.
5. Do not put service credentials, private keys, a server-side Gemini API key, an App Check debug token or production configuration in the public file, video, screenshots or logs.

## Local Chrome development without deploying

Use Node 24.12+ and `npm ci`. For cloud inference on localhost with App Check enforced, use an **existing authorized App Check debug token** only in a private `.env.local`:

```dotenv
VITE_FIREBASE_APPCHECK_DEBUG_TOKEN=EXISTING_AUTHORIZED_LOCAL_DEBUG_TOKEN
```

Do not fill that placeholder with a new token without obtaining the approval described above. Never add localhost to the reCAPTCHA allowlist. `npm run dev -- --host 127.0.0.1` serves the app locally; open its printed URL in the same Chrome device. The debug setting is active only for development mode on loopback hosts and is eliminated from the production bundle. A debug token is a credential: keep it private and out of source and recordings.

`npm run build` produces `dist/`. `npm run preview` can inspect that production build locally, but it does not enable the dev-only debug provider. Successful cloud attestation in a production build requires the already authorized HTTPS judging origin. Do not deploy without owner authorization. The test container's localhost is a different machine from the user's connected Chrome; a successful container build does not establish a Chrome test.

## Device readiness

Firebase documents Chrome Desktop 139+ and the Prompt API on a supported device. The on-device model may need a download. Check Chrome's current hardware/model requirements and existing flag state against the official guide. Do not alter browser flags or restart the user's browser silently. Device initialization must start from a user interaction; the separate preparation and request clicks implement that sequence. Download time is not inference latency.

## Genuine route checks

Use the same source fingerprint, origin and palette for the route comparison. Retain original failures as well as successes. Keep the console and credential setup outside video capture.

| Step | Action | Required observation |
| --- | --- | --- |
| Incorrect answer | Lantern → Plum → Canopy | Locally measured reversal and Plum 0.055 → Canopy 0.210 → Lantern 0.448 |
| Correct answer | Try again; Plum → Canopy → Lantern | Locally measured correct order |
| Device | Select On device only → Prepare AI coach → Get a painting exercise | Real nonempty exercise and SDK source `ON_DEVICE`; a failure is retained as failure |
| Cloud | Select In the cloud → Prepare AI coach → Get a painting exercise | Real nonempty exercise and SDK source `IN_CLOUD` |
| Hybrid | Select On device, with cloud fallback → Prepare AI coach → Get a painting exercise | Actual SDK source recorded; either value can be valid, and an on-device success alone does not demonstrate a fallback event |
| Preserve | Download inference evidence | Original JSON plus screen recording showing selected mode, response and SDK source; hash the exact exported file |

Review each response for a useful two-sentence painting exercise grounded in the actual reversed pair. Do not count the prepared example prompt or deterministic luminance output as AI. A failed strict device request must never be shown as an on-device success. This export contains no Firebase config or raw SDK exception message. Its source fingerprint binds application/lock/config-code bytes, not private settings; retain the project ID and authorized origin separately in private evidence. It is not an independent attestation, and manual review remains necessary.

## Three-minute recording outline

| Time | Show and explain |
| --- | --- |
| 0:00–0:25 | James's digital-media classroom use: learning to see value through hue with a short art warm-up |
| 0:25–0:55 | Deliberately wrong palette, grayscale proof and computed luminance |
| 0:55–1:15 | Correct order and why the local measurement stays useful without AI |
| 1:15–1:55 | Genuine prepared device-only request and its SDK-reported `ON_DEVICE` result |
| 1:55–2:30 | Genuine cloud-only request and its SDK-reported `IN_CLOUD` result |
| 2:30–3:00 | Actual hybrid outcome, Firebase integration in code and evidence export |

These are recording directions, not a claim that footage or inference exists. If one route remains blocked, describe the limitation accurately. Publishing the video, deploying and submitting to Devpost are outside this preparation task.

The review branch `cage/judging-preflight-20261128` is excluded from automatic Vercel Git deployments in `vercel.json`. Other branches keep their existing defaults. Do not merge this preparation PR while the no-deploy instruction is in force, since a main-branch merge can deploy the app.

## Sources

- [Firebase hybrid setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)
- [SDK source and mode configuration](https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options)
- [Firebase local App Check guidance](https://firebase.google.com/docs/app-check/web/debug-provider)
- [Hackathon rules](https://firebasehybridaihackathon.devpost.com/rules)
