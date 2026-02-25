import { type NextRequest, NextResponse } from 'next/server';
import { extractSubdomain } from '@/helpers/helpers';
import { getSession } from './lib/session';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const subdomain = extractSubdomain({ request });
    const session = await getSession();

    if (subdomain) {
        // Block access to admin page from subdomains
        if (pathname.startsWith('/create-tenent')) {
            return NextResponse.redirect(new URL('/sign-up', request.url));
        }
    }

    // if (pathname.startsWith('/sign-up') || pathname.startsWith('/verify-token')) {
    //     if (!subdomain) {
    //         return NextResponse.redirect(new URL('/create-tenent', request.url))
    //     }
    // }

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
