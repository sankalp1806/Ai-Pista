import type { SharedChatData } from './types';

/**
 * Encodes shared chat data to a URL-safe Base64 string
 */
export function encodeShareData(data: SharedChatData): string {
  try {
    const jsonString = JSON.stringify(data);
    let base64: string;

    if (typeof window === 'undefined') {
      // Node.js/SSR environment
      base64 = Buffer.from(jsonString, 'utf8').toString('base64');
    } else {
      // Browser environment - use TextEncoder for proper UTF-8 handling
      const encoder = new TextEncoder();
      const bytes = encoder.encode(jsonString);
      const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
      base64 = btoa(binary);
    }

    // Make URL-safe by replacing problematic characters
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    throw new Error('Failed to encode share data: ' + (error as Error).message);
  }
}

/**
 * Decodes a Base64 string back to shared chat data
 */
export function decodeShareData(encoded: string): SharedChatData | null {
  try {
    // Restore URL-safe Base64 to standard Base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const padLength = Math.ceil(base64.length / 4) * 4;
    base64 = base64.padEnd(padLength, '=');

    let jsonString: string;

    if (typeof window === 'undefined') {
      // Node.js/SSR environment
      jsonString = Buffer.from(base64, 'base64').toString('utf8');
    } else {
      // Browser environment - use TextDecoder for proper UTF-8 handling
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
      const decoder = new TextDecoder();
      jsonString = decoder.decode(bytes);
    }

    const data = JSON.parse(jsonString) as SharedChatData;

    // Validate the decoded data structure
    if (!isValidSharedChatData(data)) {
      console.warn('Invalid shared chat data structure', {
        hasTitle: typeof (data as SharedChatData)?.title === 'string',
        hasMessages: Array.isArray((data as SharedChatData)?.messages),
        version: (data as SharedChatData)?.version
      });
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Failed to decode share data:', error);
    // Return null for any decoding errors (malformed data, invalid JSON, etc.)
    return null;
  }
}

/**
 * Validates that decoded data has the expected SharedChatData structure
 */
function isValidSharedChatData(data: unknown): data is SharedChatData {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  // Check required fields
  if (typeof obj.version !== 'number') return false;
  if (typeof obj.title !== 'string') return false;
  if (typeof obj.createdAt !== 'number') return false;
  if (!Array.isArray(obj.messages)) return false;
  if (typeof obj.truncated !== 'boolean') return false;

  // Validate messages structure
  const hasValidMessages = obj.messages.every((msg: unknown) =>
    msg &&
    typeof msg === 'object' &&
    msg !== null &&
    typeof (msg as Record<string, unknown>).role === 'string' &&
    typeof (msg as Record<string, unknown>).content === 'string'
  );

  if (!hasValidMessages) return false;

  // Optional fields validation
  if (obj.originalMessageCount !== undefined && typeof obj.originalMessageCount !== 'number') {
    return false;
  }

  if (obj.originalUserMessageCount !== undefined && typeof obj.originalUserMessageCount !== 'number') {
    return false;
  }

  if (obj.projectContext !== undefined) {
    if (typeof obj.projectContext !== 'object' || obj.projectContext === null || typeof (obj.projectContext as Record<string, unknown>).name !== 'string') {
      return false;
    }
  }

  return true;
}

/**
 * Estimates the URL length that would be generated for the given data
 */
export function estimateUrlLength(data: SharedChatData, baseUrl: string = ''): number {
  try {
    const encoded = encodeShareData(data);
    return baseUrl.length + '/shared/'.length + encoded.length;
  } catch {
    return Infinity; // Return infinity if encoding fails
  }
}

/**
 * Checks if the encoded data would exceed typical URL length limits
 */
export function isUrlTooLong(data: SharedChatData, baseUrl: string = '', maxLength: number = 8000): boolean {
  return estimateUrlLength(data, baseUrl) > maxLength;
}