import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from './lib/session';

const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/verify-token"];
const PROTECTED_ROUTES = ["/dashboard"];
const ADMIN_ROUTES = ["/dashboard/users"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const host = request.headers.get('host') || '';
    const domains = host.split('.')
    const subdomain = domains.length > 1 ? domains[0] : '';
    const session = await getSession();
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isProtectedRoute = PROTECTED_ROUTES.includes(pathname);
    const isAdminRoute = ADMIN_ROUTES.includes(pathname);

    if (isAdminRoute) {
        if (session?.role !== "admin") {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    if (isProtectedRoute) {
        if (!session?.userId) {
            return NextResponse.redirect(new URL('/sign-in', request.url))
        }
    }

    if (isPublicRoute) {
        if (session?.userId) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        if (!subdomain && !session?.userId) {
            return NextResponse.redirect(new URL('/create-tenent', request.url))
        }
    }

    if (subdomain) {
        if (pathname.startsWith("/create-tenent")) {
            return NextResponse.redirect(new URL('/sign-in', request.url))
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
