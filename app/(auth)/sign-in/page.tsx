"use client"

import { useActionState } from "react"
import { signIn } from "@/app/actions/auth-actions"

export default function SignInPage() {
    const [state, formAction, isPending] = useActionState(signIn, undefined)
    return (
        <div className="max-w-sm mx-auto">
            <h1 className="text-2xl font-bold mb-4">Sign In</h1>
            {state?.success && <p className="text-green-500">{state.message}</p>}
            {!state?.success && <p className="text-red-500">{state?.message}</p>}
            <form action={formAction} className="flex flex-col gap-4 p-8 rounded-md bg-gray-800 [&_label]:block [&_input]:w-full">
                <div>
                    <label htmlFor="email">Email</label>
                    <input defaultValue={state?.data?.email} id="email" type="text" name="email" placeholder="Enter your email address" className="flex-1 py-2 px-4 inline-block bg-white rounded-md text-black" />
                    {state?.errors?.email && <p className="text-red-500">{state.errors.email[0]}</p>}
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input defaultValue={state?.data?.password} id="password" type="password" name="password" placeholder="Type new password" className="flex-1 py-2 px-4 inline-block bg-white rounded-md text-black" />
                    {state?.errors?.password && <p className="text-red-500">{state.errors.password[0]}</p>}
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-500 rounded-md cursor-pointer hover:bg-blue-600" disabled={isPending}>{isPending ? "Signing In..." : "Sign In"}</button>
            </form>
        </div>
    )
}