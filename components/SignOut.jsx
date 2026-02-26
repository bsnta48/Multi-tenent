"use client"

import { signOut } from "@/app/actions/auth";

export default function SignOut() {
    return (
        <button className="px-4 py-2 bg-blue-500 rounded-md cursor-pointer hover:bg-blue-600" onClick={async () => await signOut()}>Sign Out</button>
    )
}