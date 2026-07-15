import crypto from "crypto";

export default function generateSdkKey() {
  return (
    "sdk_" +
    crypto.randomBytes(24).toString("hex")
  );
}