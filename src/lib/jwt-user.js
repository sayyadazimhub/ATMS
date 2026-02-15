import * as jose from 'jose';

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'user-jwt-secret');
const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Sign a JWT for User (jose - works in Node and Edge)
 */
export async function signUserToken(payload) {
  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret());
  return token;
}

/**
 * Verify User JWT (jose - use in API routes and middleware)
 */
export async function verifyUserToken(token) {
  try {
    const { payload } = await jose.jwtVerify(token, secret(), {
      maxAge: expiresIn,
    });
    return payload;
  } catch {
    return null;
  }
}

/**
 * Sync verify for middleware (Edge doesn't support top-level await in same way - jose.jwtVerify is async)
 * Middleware in Next.js can be async, so we can use verifyUserToken in middleware.
 */
export { verifyUserToken as verifyUserTokenEdge };
