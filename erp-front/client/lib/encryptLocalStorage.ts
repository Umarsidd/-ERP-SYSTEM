// // Lightweight TypeScript module for encrypting values stored in localStorage
// // PBKDF2 (SHA-256) -> AES-GCM (256)
// // Usage:
// //   import { setEncryptedItem, getDecryptedItem } from './lib/encryptLocalStorage'
// //   await setEncryptedItem('key', { a: 1 }, 'passphrase')
// //   const val = await getDecryptedItem<{ a: number }>('key', 'passphrase')

// export interface EncryptedPayload {
//   v: number; // version
//   iterations: number;
//   salt: string; // base64
//   iv: string; // base64
//   ct: string; // base64 ciphertext
// }

// const textEncoder = new TextEncoder();
// const textDecoder = new TextDecoder();

// function arrayBufferToBase64(buffer: ArrayBuffer): string {
//   const bytes = new Uint8Array(buffer);
//   const chunkSize = 0x8082;
//   let binary = "";
//   for (let i = 0; i < bytes.length; i += chunkSize) {
//     const sub = bytes.subarray(i, i + chunkSize);
//     binary += String.fromCharCode.apply(null, Array.from(sub));
//   }
//   return btoa(binary);
// }

// function base64ToArrayBuffer(base64: string): ArrayBuffer {
//   const binary = atob(base64);
//   const len = binary.length;
//   const bytes = new Uint8Array(len);
//   for (let i = 0; i < len; i++) {
//     bytes[i] = binary.charCodeAt(i);
//   }
//   return bytes.buffer;
// }

// async function deriveKeyFromPassphrase(
//   passphrase: string,
//   salt: ArrayBuffer,
//   iterations = 200_000,
// ): Promise<CryptoKey> {
//   const passKey = await crypto.subtle.importKey(
//     "raw",
//     textEncoder.encode(passphrase),
//     { name: "PBKDF2" },
//     false,
//     ["deriveKey"],
//   );

//   const key = await crypto.subtle.deriveKey(
//     {
//       name: "PBKDF2",
//       salt,
//       iterations,
//       hash: "SHA-256",
//     },
//     passKey,
//     { name: "AES-GCM", length: 256 },
//     false,
//     ["encrypt", "decrypt"],
//   );

//   return key;
// }

// export async function encryptString(
//   plainText: string,
//   passphrase: string,
//   options?: { iterations?: number; saltBytes?: number; ivBytes?: number },
// ): Promise<EncryptedPayload> {
//   const iterations = options?.iterations ?? 200_000;
//   const saltBytes = options?.saltBytes ?? 16;
//   const ivBytes = options?.ivBytes ?? 12;

//   const salt = crypto.getRandomValues(new Uint8Array(saltBytes));
//   const iv = crypto.getRandomValues(new Uint8Array(ivBytes));

//   const key = await deriveKeyFromPassphrase(
//     passphrase,
//     salt.buffer,
//     iterations,
//   );

//   const cipherBuffer = await crypto.subtle.encrypt(
//     { name: "AES-GCM", iv },
//     key,
//     textEncoder.encode(plainText),
//   );

//   return {
//     v: 1,
//     iterations,
//     salt: arrayBufferToBase64(salt.buffer),
//     iv: arrayBufferToBase64(iv.buffer),
//     ct: arrayBufferToBase64(cipherBuffer),
//   };
// }

// export async function decryptToString(
//   payload: EncryptedPayload,
//   passphrase: string,
// ): Promise<string> {
//   if (!payload || payload.v !== 1)
//     throw new Error("Unsupported payload version");

//   const iterations = payload.iterations ?? 200_000;
//   const salt = base64ToArrayBuffer(payload.salt);
//   const iv = base64ToArrayBuffer(payload.iv);
//   const ct = base64ToArrayBuffer(payload.ct);

//   const key = await deriveKeyFromPassphrase(passphrase, salt, iterations);

//   const plainBuffer = await crypto.subtle.decrypt(
//     { name: "AES-GCM", iv: new Uint8Array(iv) },
//     key,
//     ct,
//   );

//   return textDecoder.decode(plainBuffer);
// }

// // Public convenience helpers for typed values
// export async function setEncryptedItem<T = unknown>(
//   storageKey: string,
//   value: T,
//   passphrase: string,
//   options?: { iterations?: number; saltBytes?: number; ivBytes?: number },
// ): Promise<void> {
//   if (typeof storageKey !== "string")
//     throw new TypeError("storageKey must be a string");
//   if (!passphrase || typeof passphrase !== "string")
//     throw new TypeError("passphrase must be a non-empty string");

//   const plain =
//     typeof value === "string"
//       ? (value as unknown as string)
//       : JSON.stringify(value);
//   const payload = await encryptString(plain, passphrase, options);
//   localStorage.setItem(storageKey, JSON.stringify(payload));
// }

// export async function getDecryptedItem<T = unknown>(
//   storageKey: string,
//   passphrase: string,
// ): Promise<T | string | null> {
//   if (typeof storageKey !== "string")
//     throw new TypeError("storageKey must be a string");
//   if (!passphrase || typeof passphrase !== "string")
//     throw new TypeError("passphrase must be a non-empty string");

//   const raw = localStorage.getItem(storageKey);
//   if (!raw) return null;

//   let payload: EncryptedPayload;
//   try {
//     payload = JSON.parse(raw) as EncryptedPayload;
//   } catch (e) {
//     throw new Error("Stored value is not a valid encrypted payload");
//   }

//   const plain = await decryptToString(payload, passphrase);

//   try {
//     return JSON.parse(plain) as T;
//   } catch {
//     return plain;
//   }
// }

// export function removeEncryptedItem(storageKey: string): void {
//   localStorage.removeItem(storageKey);
// }

// export function isWebCryptoAvailable(): boolean {
//   return typeof crypto !== "undefined" && !!crypto.subtle;
// }
