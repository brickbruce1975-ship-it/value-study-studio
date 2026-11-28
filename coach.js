import { initializeApp } from "firebase/app";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  InferenceMode,
} from "firebase/ai";
import { createCoachSession } from "./coach-session.js";
import { validateJudgeConfig } from "./judge-config.js";

let pendingService;
async function configureService() {
  const response = await fetch(import.meta.env.BASE_URL + "judge-config.json", {
    cache: "no-store",
  });
  if (
    !response.ok ||
    !response.headers.get("content-type")?.includes("application/json")
  ) {
    throw new Error(
      "The AI coach needs a judging Firebase project. The palette exercise works here."
    );
  }
  const { firebaseConfig, appCheckSiteKey } = validateJudgeConfig(await response.json());
  const app = initializeApp(firebaseConfig);
  // An existing private debug token is usable only in a local development build.
  // Production builds eliminate this branch. Never safelist localhost in reCAPTCHA.
  if (import.meta.env.DEV && ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)) {
    const debugToken = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
    if (debugToken) self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
  return getAI(app, { backend: new GoogleAIBackend() });
}

function loadService() {
  if (!pendingService) {
    pendingService = configureService().catch((error) => {
      pendingService = undefined;
      throw error;
    });
  }
  return pendingService;
}

export async function prepareCoach(mode) {
  if (!["device", "cloud", "hybrid"].includes(mode))
    throw new Error("Choose an inference mode.");
  const modes = {
    device: InferenceMode.ONLY_ON_DEVICE,
    cloud: InferenceMode.ONLY_IN_CLOUD,
    hybrid: InferenceMode.PREFER_ON_DEVICE,
  };
  const model = getGenerativeModel(await loadService(), { mode: modes[mode] });
  return createCoachSession(model, mode);
}
