import { InferenceSource } from "firebase/ai";
// This adapter never chooses the reported route: it comes from the Firebase response.
export function createCoachSession(model, mode) {
  if (!["device", "cloud", "hybrid"].includes(mode))
    throw new Error("Choose an inference mode.");
  return async (prompt, onProgress = () => {}) => {
    // Called directly by the prepared coach's click handler, before any network work.
    if (mode !== "cloud") {
      try {
        onProgress({ stage: "device_initialization" });
        await model.initializeDeviceModel((progress) => onProgress({ stage: "model_download", progress }));
      } catch (error) {
        if (mode === "device") throw error;
        // PREFER_ON_DEVICE delegates fallback to Firebase, not to a fabricated reply.
      }
    }
    onProgress({ stage: "generation" });
    const { response } = await model.generateContent(prompt);
    const message = response.text().trim();
    if (!message) throw new Error("The coach returned no exercise. Try again.");
    const route = response.inferenceSource;
    if (![InferenceSource.ON_DEVICE, InferenceSource.IN_CLOUD].includes(route))
      throw new Error("The SDK did not report a recognized inference source.");
    if ((mode === "device" && route !== InferenceSource.ON_DEVICE) ||
        (mode === "cloud" && route !== InferenceSource.IN_CLOUD))
      throw new Error("The SDK inference source did not match the requested strict route.");
    return { message, route };
  };
}
