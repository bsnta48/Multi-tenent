import { type NextRequest, NextResponse } from 'next/server';
import { extractSubdomain } from '@/helpers/helpers';
import { getSession } from './lib/session';

const AUTH_ROUTES = ["/sign-in", "/sign-up", "/verify-token"];
const PUBLIC_ROUTES = ["/", ...AUTH_ROUTES];
const PROTECTED_ROUTES = ["/dashboard"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const subdomain = extractSubdomain({ request });
    const session = await getSession();
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isProtectedRoute = PROTECTED_ROUTES.includes(pathname);
    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if(isProtectedRoute && !session?.userId){
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    if(isPublicRoute && session?.userId){
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // if(!subdomain && isPublicRoute && !session?.userId){
    //     return NextResponse.redirect(new URL('/create-tenent', request.url))
    // }

    if(subdomain && pathname.startsWith("/create-tenent")){
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
        '/((?!api|_next|[\\w-]+\\.\\w+).*)'
    ]
};
