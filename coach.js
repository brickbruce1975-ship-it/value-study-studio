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
  const { firebaseConfig, appCheckSiteKey } = await response.json();
  if (
    !firebaseConfig?.apiKey ||
    !firebaseConfig?.projectId ||
    !firebaseConfig?.appId ||
    !appCheckSiteKey
  ) {
    throw new Error(
      "The project configuration needs a Firebase web app and an App Check site key."
    );
  }
  const app = initializeApp(firebaseConfig);
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

export async function coach(prompt, mode) {
  if (!["device", "cloud", "hybrid"].includes(mode))
    throw new Error("Choose an inference mode.");
  const modes = {
    device: InferenceMode.ONLY_ON_DEVICE,
    cloud: InferenceMode.ONLY_IN_CLOUD,
    hybrid: InferenceMode.PREFER_ON_DEVICE,
  };
  const model = getGenerativeModel(await loadService(), { mode: modes[mode] });
  if (mode === "device") await model.initializeDeviceModel();
  const { response } = await model.generateContent(prompt);
  const message = response.text().trim();
  if (!message) throw new Error("The coach returned no exercise. Try again.");
  return { message, route: response.inferenceSource };
}
