"use client"

import { verifyEmail } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardDescription, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function VerifyEmail() {
    const [state, setState] = useState<any>(null)
    const params = useParams()
    const token = params.token as string
    const verify = async () => {
        const res = await verifyEmail(token)
        setState(res)
    }
    useEffect(() => {
        verify()
    }, [token])
    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardDescription>{state.message}</CardDescription>
                <CardAction>
                    <Button variant="link" asChild>
                        <Link href="/sign-in">Sign In</Link>
                    </Button>
                </CardAction>
            </CardHeader>
        </Card>
    )
}