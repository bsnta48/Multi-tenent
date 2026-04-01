import { type NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/verify-token", "/forgot-password", "/reset-password"];
const ADMIN_ROUTES = ["/dashboard/users", "/dashboard/invite", "/dashboard/users/[id]", "/dashboard/requests", "/dashboard/team"];
const PROTECTED_ROUTES = ["/dashboard", ...ADMIN_ROUTES];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const refreshToken = request.cookies.get("refreshToken")?.value
    const accessToken = request.cookies.get("accessToken")?.value
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
    const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route))

    if (isPublicRoute && accessToken && refreshToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (!accessToken && !refreshToken && isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // On the root domain, allow normal access
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. all root files inside /public (e.g. /favicon.ico)
         */
        '/((?!api|_next|[\\w-]+\\.\\w+).*)',
    ]
};
