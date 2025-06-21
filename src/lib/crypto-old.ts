// /**
//  * Cryptographic utilities for Client Tracker.
//  * Provides encryption and decryption using Node.js crypto module.
//  * Why: Secures sensitive data (clients, pitch decks, strategies) with AES-256-CBC.
//  * How: Uses userKey with padding, 16-byte IV, and salt.
//  * Changes:
//  * - Added legacy 12-byte IV support for pitch_decks decryption.
//  * - Enhanced logging for IV issues.
//  */
// import crypto from "crypto";

// export function encrypt(
//   data: string,
//   key: string
// ): { encrypted: string; salt: string; iv: string } {
//   try {
//     console.log("Encrypting data with key:", key.slice(0, 4) + "...");
//     const salt = crypto.randomBytes(16).toString("hex");
//     const iv = crypto.randomBytes(16);
//     const keyBuffer = Buffer.from(key.padEnd(32, "\0").slice(0, 32), "utf8");
//     const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
//     let encrypted = cipher.update(data, "utf8", "hex");
//     encrypted += cipher.final("hex");
//     const result = { encrypted, salt, iv: iv.toString("hex") };
//     console.log("Encryption successful:", {
//       encrypted: result.encrypted.slice(0, 20) + "...",
//       iv: result.iv.slice(0, 20) + "...",
//       salt: result.salt.slice(0, 20) + "...",
//     });
//     return result;
//   } catch (error) {
//     console.error("Encryption error:", error);
//     throw new Error(`Encryption failed: ${(error as Error).message}`);
//   }
// }

// export function decrypt(encrypted: string, key: string, iv: string): string {
//   try {
//     console.log("Decrypting data with key:", key.slice(0, 4) + "...", {
//       hasEncrypted: !!encrypted,
//       hasIV: !!iv,
//     });
//     let ivBuffer = Buffer.from(iv, "hex");
//     if (ivBuffer.length === 12) {
//       console.warn("Legacy 12-byte IV detected; padding to 16 bytes");
//       const paddedIV = Buffer.concat([ivBuffer, Buffer.alloc(4)]);
//       ivBuffer = paddedIV;
//     }
//     if (ivBuffer.length !== 16) {
//       throw new Error(`Invalid IV length: ${ivBuffer.length}, expected 16`);
//     }
//     const keyBuffer = Buffer.from(key.padEnd(32, "\0").slice(0, 32), "utf8");
//     const decipher = crypto.createDecipheriv(
//       "aes-256-cbc",
//       keyBuffer,
//       ivBuffer
//     );
//     let decrypted = decipher.update(encrypted, "hex", "utf8");
//     decrypted += decipher.final("utf8");
//     console.log("Decryption successful:", decrypted.slice(0, 20) + "...");
//     return decrypted;
//   } catch (error) {
//     console.error("Decryption error:", {
//       message: (error as Error).message,
//       encrypted: encrypted?.slice(0, 20) + "...",
//       iv: iv?.slice(0, 20) + "...",
//     });
//     throw new Error(`Decryption failed: ${(error as Error).message}`);
//   }
// }

/**
 * Cryptographic utilities for Client Tracker.
 * Provides encryption and decryption using Node.js crypto module.
 * Why: Secures sensitive data with AES-256-CBC.
 * How: Uses userKey with padding, 16-byte IV, and salt.
 * Changes:
 * - Handled double-hex-encoded IVs (64-char to 16-byte).
 * - Improved logging for decryption errors.
 */
// import crypto from "crypto";

// export function encrypt(
//   data: string,
//   key: string
// ): { encrypted: string; salt: string; iv: string } {
//   try {
//     console.log("Encrypting data with key:", key.slice(0, 4) + "...");
//     const salt = crypto.randomBytes(16).toString("hex");
//     const iv = crypto.randomBytes(16);
//     const keyBuffer = Buffer.from(key.padEnd(32, "\0").slice(0, 32), "utf8");
//     const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
//     let encrypted = cipher.update(data, "utf8", "hex");
//     encrypted += cipher.final("hex");
//     const result = { encrypted, salt, iv: iv.toString("hex") };
//     console.log("Encryption successful:", {
//       encrypted: result.encrypted.slice(0, 20) + "...",
//       iv: result.iv,
//       salt: result.salt.slice(0, 20) + "...",
//     });
//     return result;
//   } catch (error) {
//     console.error("Encryption error:", error);
//     throw new Error(`Encryption failed: ${(error as Error).message}`);
//   }
// }

// export function decrypt(encrypted: string, key: string, iv: string): string {
//   try {
//     console.log("Decrypting data with key:", key.slice(0, 4) + "...", {
//       encryptedLength: encrypted.length,
//       ivLength: iv.length,
//     });
//     let ivBuffer = Buffer.from(iv, "hex");
//     if (ivBuffer.length === 32) {
//       console.warn("Possible double-hex-encoded IV (32 bytes); decoding again");
//       ivBuffer = Buffer.from(ivBuffer.toString("hex"), "hex");
//     }
//     if (ivBuffer.length === 12) {
//       console.warn("Legacy 12-byte IV detected; padding to 16 bytes");
//       ivBuffer = Buffer.concat([ivBuffer, Buffer.alloc(4)]);
//     }
//     if (ivBuffer.length !== 16) {
//       throw new Error(`Invalid IV length: ${ivBuffer.length}, expected 16`);
//     }
//     const keyBuffer = Buffer.from(key.padEnd(32, "\0").slice(0, 32), "utf8");
//     const decipher = crypto.createDecipheriv(
//       "aes-256-cbc",
//       keyBuffer,
//       ivBuffer
//     );
//     let decrypted = decipher.update(encrypted, "hex", "utf8");
//     decrypted += decipher.final("utf8");
//     console.log("Decryption successful:", decrypted.slice(0, 20) + "...");
//     return decrypted;
//   } catch (error) {
//     console.error("Decryption error:", {
//       message: (error as Error).message,
//       encrypted: encrypted.slice(0, 20) + "...",
//       iv: iv.slice(0, 20) + "...",
//     });
//     throw new Error(`Decryption failed: ${(error as Error).message}`);
//   }
// }
/**
 * Cryptographic utilities for Client Tracker.
 * Provides encryption, decryption, and hashing using Node.js crypto module.
 * Why: Secures sensitive data with AES-256-CBC and key validation.
 * How: Uses userKey with padding, 16-byte IV, and salt.
 * Changes:
 * - Added hashKey for key validation.
 */
// import crypto from "crypto";

// export function encrypt(
//   data: string,
//   key: string
// ): { encrypted: string; salt: string; iv: string } {
//   try {
//     console.log("Encrypting data with key:", key.slice(0, 4) + "...");
//     const salt = crypto.randomBytes(16).toString("hex");
//     const iv = crypto.randomBytes(16);
//     const keyBuffer = Buffer.from(key.padEnd(32, "\0").slice(0, 32), "utf8");
//     const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
//     let encrypted = cipher.update(data, "utf8", "hex");
//     encrypted += cipher.final("hex");
//     const result = { encrypted, salt, iv: iv.toString("hex") };
//     console.log("Encryption successful:", {
//       encrypted: result.encrypted.slice(0, 20) + "...",
//       iv: result.iv,
//       salt: result.salt.slice(0, 20) + "...",
//     });
//     return result;
//   } catch (error) {
//     console.error("Encryption error:", error);
//     throw new Error(`Encryption failed: ${(error as Error).message}`);
//   }
// }

// export function decrypt(encrypted: string, key: string, iv: string): string {
//   try {
//     console.log("Decrypting data with key:", key.slice(0, 4) + "...", {
//       encryptedLength: encrypted.length,
//       ivLength: iv.length,
//     });
//     let ivBuffer = Buffer.from(iv, "hex");
//     if (ivBuffer.length === 32) {
//       console.warn("Possible double-hex-encoded IV (32 bytes); decoding again");
//       ivBuffer = Buffer.from(ivBuffer.toString("hex"), "hex");
//     }
//     if (ivBuffer.length === 12) {
//       console.warn("Legacy 12-byte IV detected; padding to 16 bytes");
//       ivBuffer = Buffer.concat([ivBuffer, Buffer.alloc(4)]);
//     }
//     if (ivBuffer.length !== 16) {
//       throw new Error(`Invalid IV length: ${ivBuffer.length}, expected 16`);
//     }
//     const keyBuffer = Buffer.from(key.padEnd(32, "\0").slice(0, 32), "utf8");
//     const decipher = crypto.createDecipheriv(
//       "aes-256-cbc",
//       keyBuffer,
//       ivBuffer
//     );
//     let decrypted = decipher.update(encrypted, "hex", "utf8");
//     decrypted += decipher.final("utf8");
//     console.log("Decryption successful:", decrypted.slice(0, 20) + "...");
//     return decrypted;
//   } catch (error) {
//     console.error("Decryption error:", {
//       message: (error as Error).message,
//       encrypted: encrypted.slice(0, 20) + "...",
//       iv: iv.slice(0, 20) + "...",
//     });
//     throw new Error(`Decryption failed: ${(error as Error).message}`);
//   }
// }

// export function hashKey(key: string): string {
//   return crypto.createHash("sha256").update(key).digest("hex");
// }

// src/lib/crypto.ts (Replacing your existing content)
/**
 * Cryptographic utilities for Client Tracker.
 * Provides key derivation (PBKDF2), encryption (AES-GCM), and decryption (AES-GCM)
 * using the browser's Web Crypto API.
 * Why: Ensures client-side encryption with modern, secure, and performant standards.
 * How: Generates a derived key from user passphrase + salt, uses random IV for AES-GCM.
 */

const VALIDATION_TEST_MESSAGE = "CLIENT_TRACKER_VALIDATION_SUCCESS";

// --- Key Derivation Function (PBKDF2) ---
export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(passphrase);

  const iterations = 600000; // Adjust based on performance testing

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  return derivedKey;
}

// --- Encryption Function (AES-GCM) ---
export async function encryptData(
  data: string,
  key: CryptoKey
): Promise<{ ciphertextWithTag: string; iv: string }> {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes for AES-GCM IV
    const encoded = new TextEncoder().encode(data);

    const algorithm = { name: "AES-GCM", iv: iv };

    const result = await crypto.subtle.encrypt(algorithm, key, encoded);

    // AES-GCM output includes ciphertext + authentication tag
    const ciphertextBuffer = new Uint8Array(result);

    return {
      ciphertextWithTag: btoa(String.fromCharCode(...ciphertextBuffer)), // Base64 encode full output
      iv: btoa(String.fromCharCode(...iv)), // Base64 encode IV
    };
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error(`Encryption failed: ${(error as Error).message}`);
  }
}

// --- Decryption Function (AES-GCM) ---
export async function decryptData(
  ciphertextWithTagBase64: string,
  ivBase64: string,
  key: CryptoKey
): Promise<string> {
  try {
    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
    const decodedCiphertextWithTag = Uint8Array.from(
      atob(ciphertextWithTagBase64),
      (c) => c.charCodeAt(0)
    );

    const algorithm = { name: "AES-GCM", iv: iv };

    const decryptedBuffer = await crypto.subtle.decrypt(
      algorithm,
      key,
      decodedCiphertextWithTag
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error(`Decryption failed: ${(error as Error).message}`);
  }
}

// --- Key Validation (Test Value) Functions ---
export async function createEncryptedTestValue(passphrase: string): Promise<{
  salt: string;
  iv: string;
  encryptedData: string;
}> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivedKey = await deriveKeyFromPassphrase(passphrase, salt);

  const { ciphertextWithTag, iv } = await encryptData(
    VALIDATION_TEST_MESSAGE,
    derivedKey
  );

  return {
    salt: btoa(String.fromCharCode(...salt)),
    iv: iv,
    encryptedData: ciphertextWithTag,
  };
}

export async function validatePassphrase(
  passphrase: string,
  storedSaltBase64: string,
  storedIvBase64: string,
  storedEncryptedData: string
): Promise<CryptoKey | null> {
  try {
    const salt = Uint8Array.from(atob(storedSaltBase64), (c) =>
      c.charCodeAt(0)
    );
    const derivedKey = await deriveKeyFromPassphrase(passphrase, salt);

    const decryptedMessage = await decryptData(
      storedEncryptedData,
      storedIvBase64,
      derivedKey
    );

    if (decryptedMessage === VALIDATION_TEST_MESSAGE) {
      console.log("Passphrase validation successful!");
      return derivedKey;
    } else {
      console.warn("Passphrase validation failed: Mismatched test message.");
      return null;
    }
  } catch (error) {
    console.error("Passphrase validation error:", error);
    return null;
  }
}
