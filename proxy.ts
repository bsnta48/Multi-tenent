import { type NextRequest, NextResponse } from 'next/server';
import { verifyUser } from './lib/auth';

const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/verify-token"];
const PROTECTED_ROUTES = ["/dashboard"];
const ADMIN_ROUTES = ["/dashboard/users"];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const user = await verifyUser()
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isProtectedRoute = PROTECTED_ROUTES.includes(pathname);
    const isAdminRoute = ADMIN_ROUTES.includes(pathname);

    if (isAdminRoute) {
        if (user?.role !== "admin") {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    if (isProtectedRoute) {
        if (!user?.userId) {
            return NextResponse.redirect(new URL('/sign-in', request.url))
        }
    }

    if (isPublicRoute) {
        if (user?.userId) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
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
        '/((?!api|_next|[\\w-]+\\.\\w+).*)'
    ]
};
