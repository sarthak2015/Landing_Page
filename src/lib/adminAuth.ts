import crypto from "crypto";

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return secret;
}

export function createSessionToken(): string {
  const payloadB64 = Buffer.from(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS })).toString("base64url");
  const sig = crypto.createHmac("sha256", getSecret()).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token) return false;

  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return false;
  }

  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return false;

  const expectedSig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    return typeof payload.exp === "number" && Date.now() < payload.exp;
  } catch {
    return false;
  }
}

// Constant-time string comparison, tolerant of mismatched lengths (which
// crypto.timingSafeEqual rejects outright), for verifying login credentials.
export function safeCompare(a: string, b: string): boolean {
  const aHash = crypto.createHash("sha256").update(a).digest();
  const bHash = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(aHash, bHash);
}
