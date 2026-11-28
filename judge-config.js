const fields = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId", "measurementId", "databaseURL"];
export function validateJudgeConfig(value) {
  const invalid = () => { throw new Error("Use the judging configuration template with public Firebase web settings and an App Check site key."); };
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  if (Object.keys(value).some((key) => !["firebaseConfig", "appCheckSiteKey"].includes(key))) invalid();
  const config = value.firebaseConfig;
  if (!config || typeof config !== "object" || Array.isArray(config)) invalid();
  if (Object.keys(config).some((key) => !fields.includes(key))) invalid();
  for (const item of [...Object.values(config), value.appCheckSiteKey]) {
    if (typeof item !== "string" || !item.trim() || /REPLACE|YOUR_|<|>|BEGIN .*PRIVATE KEY/i.test(item)) invalid();
  }
  if (!["apiKey", "projectId", "appId"].every((key) => config[key])) invalid();
  return { firebaseConfig: config, appCheckSiteKey: value.appCheckSiteKey };
}
