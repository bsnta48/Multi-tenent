"use client"

/**
 * RootProvider handles hydration mismatches caused by Radix UI ID generation.
 * During SSR, Radix components generate IDs, but during hydration on the client,
 * they may generate different IDs, causing warnings.
 * 
 * This provider should be placed as high as possible in the component tree to
 * prevent Radix UI ID generation mismatches.
 */
export default function RootProvider({ children }: { children: React.ReactNode }) {

    return <>{children}</>
}

