/**
 * Encoding utilities for Client Tracker.
 * Provides functions to encode strings to ArrayBuffer and decode ArrayBuffer to strings.
 * Why: Supports Web Crypto API for encryption/decryption with AES-GCM.
 * How: Uses TextEncoder and TextDecoder for UTF-8 encoding.
 * Changes:
 * - Added input validation to prevent undefined or invalid buffers.
 */
export function encode(str: string): ArrayBuffer {
  if (!str || typeof str !== "string") {
    console.error("encode: Invalid input string", { str });
    throw new Error("Invalid input string for encoding");
  }
  console.log("Encoding string:", str.slice(0, 10) + "...");
  try {
    return new TextEncoder().encode(str).buffer as ArrayBuffer;
  } catch (error) {
    console.error("Encoding error:", error);
    throw new Error(`Failed to encode string: ${(error as Error).message}`);
  }
}

export function decode(buffer: ArrayBuffer | null | undefined): string {
  if (!buffer || !(buffer instanceof ArrayBuffer)) {
    console.error("decode: Invalid buffer input", { buffer });
    throw new Error("Invalid or undefined buffer for decoding");
  }
  console.log("Decoding buffer of length:", buffer.byteLength);
  try {
    return new TextDecoder().decode(buffer);
  } catch (error) {
    console.error("Decoding error:", error);
    throw new Error(`Failed to decode buffer: ${(error as Error).message}`);
  }
}
