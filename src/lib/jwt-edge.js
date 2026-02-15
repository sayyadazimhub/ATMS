// import * as jose from 'jose';

// export function verifyTokenEdge(token) {
//   try {
//     const secret = new TextEncoder().encode(process.env.JWT_SECRET);
//     const { payload } = jose.jwtVerify(token, secret, {
//       maxAge: process.env.JWT_EXPIRES_IN || '7d',
//     });
//     return payload;
//   } catch {
//     return null;
//   }
// }

// export async function verifyUserToken(token) {
//   try {
//     const { payload } = await jose.jwtVerify(token, secret(), {
//       maxAge: expiresIn,
//     });
//     return payload;
//   } catch {
//     return null;
//   }
// }
