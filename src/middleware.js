import { NextResponse } from 'next/server';
// import { verifyTokenEdge } from '@/lib/jwt-edge';
import { verifyUserToken } from '@/lib/jwt-user';

function isAdminRoute(pathname) {
  return pathname.startsWith('/');
}

function isAdminPublic(pathname) {
  if (pathname === '/') return true;
  if (pathname === '/login' || pathname.startsWith('/login/')) return true;
  if (pathname === '/register' || pathname.startsWith('/register/')) return true;
  if (pathname.startsWith('/forgot-password')) return true;
  if (pathname.startsWith('/reset-password')) return true;
  return false;
}

function isUserRoute(pathname) {
  return pathname.startsWith('/user');
}

function isUserPublic(pathname) {
  if (pathname === '/user' || pathname === '/user/') return true;
  if (pathname === '/user/register' || pathname.startsWith('/user/register/')) return true;
  if (pathname === '/user/login' || pathname.startsWith('/user/login/')) return true;
  if (pathname.startsWith('/user/forgot-password')) return true;
  if (pathname.startsWith('/user/reset-password')) return true;
  if (pathname.startsWith('/user/verify-otp')) return true;
  return false;
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // ——— User routes (separate UI/API, jose token) ———
  if (isUserRoute(pathname)) {
    const userToken = request.cookies.get('user-token')?.value;
    if (isUserPublic(pathname)) {
      if (userToken) {
        const decoded = await verifyUserToken(userToken);
        if (decoded && (pathname === '/user/login' || pathname === '/user/register' || pathname === '/user/verify-otp')) {
          return NextResponse.redirect(new URL('/user/dashboard', request.url));
        }
      }
      return NextResponse.next();
    }
    if (!userToken) {
      return NextResponse.redirect(new URL('/user/login', request.url));
    }
    const decoded = await verifyUserToken(userToken);
    if (!decoded) {
      const res = NextResponse.redirect(new URL('/user/login', request.url));
      res.cookies.delete('user-token');
      return res;
    }
    return NextResponse.next();
  }

  // ——— Admin routes (existing auth-token, jwt-edge verify) ———
  if (isAdminRoute(pathname)) {
    const token = request.cookies.get('auth-token')?.value;
    if (isAdminPublic(pathname)) {
      if (token) {
        const decoded = await verifyUserToken(token);
        if (decoded && (pathname === '/login' || pathname === '/register')) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
      return NextResponse.next();
    }
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const decoded = await verifyUserToken(token);
    if (!decoded) {
      const res = NextResponse.redirect(new URL('/login', request.url));
      res.cookies.delete('auth-token');
      return res;
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
