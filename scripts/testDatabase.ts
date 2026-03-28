import { isRetracted } from "../lib/retractionWatch";

const sample = isRetracted("10.1016/j.scitotenv.2024.174802");
if (sample) {
  console.log("Retracted — standardized fields:", JSON.stringify(sample, null, 2));
} else {
  console.log("isRetracted returned null (clean / not in database).");
}
