// Cryptographic utilities for secure key derivation and encryption/decryption.
// Uses PBKDF2 (600,000 iterations, SHA-256) and AES-GCM (256-bit) for encryption key management.
const VALID_KEY_MARKER = "user_key_set"; // Marker to verify successful key setup.
const LEGACY_KEY_MARKER = "VALID_KEY_MARKER"; // Fallback for keys set before June 15, 2025.

// Generate a test value to store in Supabase for verifying encryption key setup.
export async function createEncryptedTestValue(passphrase: string): Promise<{
  salt: string;
  iv: string;
  encryptedData: string;
}> {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16)); // Random 16-byte salt for PBKDF2.
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Random 12-byte IV for AES-GCM.
    const derivedKey = await deriveKey(passphrase, salt); // Derive key from passphrase.
    const encoder = new TextEncoder();
    const encryptedData = await encryptData(
      encoder.encode(VALID_KEY_MARKER), // Encrypt the marker.
      derivedKey,
      iv
    );

    const saltBase64 = arrayBufferToBase64(salt.buffer); // Encode to Base64 for storage.
    const ivBase64 = arrayBufferToBase64(iv.buffer);
    const encryptedDataBase64 = arrayBufferToBase64(encryptedData);

    return {
      salt: saltBase64,
      iv: ivBase64,
      encryptedData: encryptedDataBase64,
    };
  } catch (err) {
    console.error("Error creating test value:", err);
    throw new Error("Failed to create encrypted test value");
  }
}

// Validate a passphrase against stored metadata in Supabase.
export async function validatePassphrase(
  passphrase: string,
  saltBase64: string,
  ivBase64: string,
  encryptedDataBase64: string
): Promise<CryptoKey | null> {
  try {
    const salt = base64ToArrayBuffer(saltBase64); // Decode Base64 salt.
    const iv = base64ToArrayBuffer(ivBase64); // Decode Base64 IV.
    const encryptedData = base64ToArrayBuffer(encryptedDataBase64); // Decode Base64 encrypted data.

    const derivedKey = await deriveKey(passphrase, salt); // Derive key from passphrase.
    const decryptedData = await decryptData(
      toArrayBuffer(encryptedData), // Convert to ArrayBuffer for decryption.
      derivedKey,
      iv
    );

    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decryptedData); // Decode decrypted data.

    if (
      decryptedText === VALID_KEY_MARKER ||
      decryptedText === LEGACY_KEY_MARKER // Support legacy marker for compatibility.
    ) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `Passphrase validated successfully! Marker: ${decryptedText}`
        );
      }
      return derivedKey; // Return derived key if valid.
    }
    console.log("Passphrase validation failed: Invalid marker.", {
      decryptedText,
    });
    return null;
  } catch (err) {
    console.error("Error validating passphrase:", err);
    return null;
  }
}

// Derive a 256-bit AES-GCM key from a passphrase using PBKDF2.
async function deriveKey(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  try {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(passphrase), // Encode passphrase as raw bytes.
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 600000, // High iteration count for security.
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  } catch (err) {
    console.error("Error deriving key:", err);
    throw new Error("Failed to derive encryption key");
  }
}

// Encrypt data using AES-GCM with the provided key and IV.
async function encryptData(
  data: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  try {
    return await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  } catch (err) {
    console.error("Error encrypting data:", err);
    throw new Error("Failed to encrypt data");
  }
}

// Decrypt data using AES-GCM with the provided key and IV.
async function decryptData(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  try {
    return await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedData
    );
  } catch (err) {
    console.error("Error decrypting data:", err);
    throw new Error("Failed to decrypt data");
  }
}

// Convert ArrayBuffer to Base64 string for storage.
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return btoa(String.fromCharCode(...bytes));
}

// Convert Base64 string to Uint8Array for cryptographic operations.
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Convert Uint8Array to ArrayBuffer for decryption.
function toArrayBuffer(data: Uint8Array): ArrayBuffer {
  const buffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  );
  const newBuffer = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(newBuffer).set(new Uint8Array(buffer));
  return newBuffer;
}
