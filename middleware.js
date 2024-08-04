import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


const isProtectedRoute = createRouteMatcher([
    '/',
    '/pantry(.*)',
    '/analytics(.*)',
    '/ai(.*)',
    '/api/gemini(.*)',
]);


export default clerkMiddleware((auth, req) => {
    if (isProtectedRoute(req)) {
        if (!auth.userId) {
            const signInUrl = new URL('/sign-in', req.url);
            // signInUrl.searchParams.set('redirect_url', req.url);
            return NextResponse.redirect(signInUrl);
        }
        return auth().protect();
    }
});



export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};