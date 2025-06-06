import crypto from "crypto";

export function encrypt(
  data: string,
  key: string
): { encrypted: string; salt: string; iv: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const iv = crypto.randomBytes(16);
  const keyBuffer = Buffer.from(key.padEnd(32, "\0").slice(0, 32), "utf8"); // Pad/truncate to 32 bytes
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encrypted, salt, iv: iv.toString("hex") };
}

export function decrypt(encrypted: string, key: string, iv: string): string {
  const keyBuffer = Buffer.from(key.padEnd(32, "\0").slice(0, 32), "utf8");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    keyBuffer,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
