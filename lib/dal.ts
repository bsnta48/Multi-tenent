"server-only"

import { getSession } from "@/lib/session";
import { cache } from "react";
import { redirect } from "next/navigation";

export const verifySession = cache(async () => {
    const session = await getSession()
    if (!session?.userId) {
        redirect("/sign-in")
    }

    return { isAuth: true, user: session }

})