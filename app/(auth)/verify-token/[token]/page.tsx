"use client"

import { useActionState, useEffect, useState } from "react"
import { verifyToken, checkToken } from "@/app/actions/auth"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"

export default function VerifyTokenPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isValidUrl, setIsValidUrl] = useState(true)
    const [state, formAction, isPending] = useActionState(verifyToken, undefined)
    const params = useParams()
    const token = params.token as string

    const isValidToken = async () => {
        const res = await checkToken(token)
        if (res) {
            setIsValidUrl(res.success)
            setIsLoading(false)
        }
    }

    useEffect(() => {
        isValidToken()
    }, [token])

    if (!token) {
        return notFound()
    }
    
    if (state?.success) {
        return (
            <div className="max-w-sm mx-auto text-center">
                <p className="text-green-500 mb-4">{state.message}</p>
                <Link href="/sign-in" className="text-white px-4 py-2 bg-blue-500 rounded-md cursor-pointer hover:bg-blue-600">Sign In</Link>
            </div>
        )
    }

    if(isLoading) {
        return (
            <div className="max-w-sm mx-auto text-center">
                <p className="text-gray-500 mb-4">Loading...</p>
            </div>
        )
    }

    if(!isValidUrl) {
        return (
            <div className="max-w-sm mx-auto text-center">
                <p className="text-red-500 mb-4">Invalid token</p>
                <Link href="/sign-in" className="text-white px-4 py-2 bg-blue-500 rounded-md cursor-pointer hover:bg-blue-600">Sign In</Link>
            </div>
        )
    }

    return (
        <div className="max-w-sm mx-auto">
            <h1 className="text-2xl font-bold mb-4">Verify your token</h1>
            {state?.success && <p className="text-green-500">{state.message}</p>}
            {!state?.success && <p className="text-red-500">{state?.message}</p>}
            <form action={formAction} className="flex flex-col gap-4 p-8 rounded-md bg-gray-800 [&_label]:block [&_input]:w-full">
                <input type="hidden" name="token" value={token} />
                <div>
                    <label htmlFor="verifyCode">Verify Code</label>
                    <input defaultValue={state?.data?.verifyCode} id="verifyCode" type="text" name="verifyCode" placeholder="Enter verification code" className="flex-1 py-2 px-4 inline-block bg-white rounded-md text-black" />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-500 rounded-md cursor-pointer hover:bg-blue-600" disabled={isPending}>{isPending ? "Verifying..." : "Verify"}</button>
            </form>
        </div>
    )
}