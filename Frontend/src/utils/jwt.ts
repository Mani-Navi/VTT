import { User } from "../types";

export interface DecodedToken {
  sub: string;
  username: string;
  role: string;
  exp: number;
  iat: number;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload as DecodedToken;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

export function generateMockToken(user: User): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  );
  const signature = btoa("mock_signature_persian_vtt");
  return `${header}.${payload}.${signature}`;
}
