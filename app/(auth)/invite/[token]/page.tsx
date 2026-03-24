"use client"

import { acceptInvite } from "@/app/actions/auth";
import FieldsError from "@/components/FieldsError";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState, useEffect, useState, use } from "react";

export default function InviteSignUpPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params)
    const [inviteData, setInviteData] = useState<{ email: string, role: string, tenentId: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [pageError, setPageError] = useState<string | null>(null)

    useEffect(() => {
        const fetchInvite = async () => {
            try {
                const res = await fetch(`/api/invites/accept/${token}`)
                const result = await res.json()
                if (result.success) {
                    setInviteData(result.data)
                } else {
                    setPageError(result.error)
                }
            } catch (err) {
                setPageError("Failed to verify invite")
            } finally {
                setLoading(false)
            }
        }
        if (token) {
            fetchInvite()
        }
    }, [token])

    const [state, formAction, isPending] = useActionState((state: any, formData: FormData) => {
        if (!inviteData) return state;
        return acceptInvite(state, {
            formData,
            token,
            email: inviteData.email,
            role: inviteData.role,
            tenentId: inviteData.tenentId
        });
    }, undefined)

    if (loading) {
        return (
            <Card className="w-full max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold mb-4">Accept Invite</CardTitle>
                    <CardDescription>Verifying your invitation...</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (pageError || !inviteData) {
        return (
            <Card className="w-full max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold mb-4 text-red-500">Invalid Invite</CardTitle>
                    <CardDescription>{pageError || "This invite link is invalid or has expired."}</CardDescription>
                    <CardAction>
                        <Button variant="link" asChild>
                            <Link href="/sign-in">Return to Sign In</Link>
                        </Button>
                    </CardAction>
                </CardHeader>
            </Card>
        )
    }

    if (state?.success) {
        return (
            <Card className="w-full max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold mb-4">Account Created</CardTitle>
                    <CardDescription>{state.message || "Your account has been created successfully."}</CardDescription>
                    <CardAction>
                        <Button variant="link" asChild>
                            <Link href="/sign-in">Sign In</Link>
                        </Button>
                    </CardAction>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold mb-4">Accept Invitation</CardTitle>
                <CardDescription>Join as {inviteData.email}</CardDescription>
                <CardAction>
                    <Button variant="link" asChild>
                        <Link href="/sign-in">Sign In Instead</Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <form action={formAction}>
                <CardContent>
                    <FieldSet>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input disabled value={inviteData.email} id="email" name="email" className="text-muted-foreground bg-muted" />
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                    <FieldSeparator className="my-2" />
                    <FieldSet>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="username">Username</FieldLabel>
                                <Input defaultValue={state?.data?.username} id="username" name="username" />
                                <FieldsError errors={state?.error?.username?.errors} />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input type="password" defaultValue={state?.data?.password} id="password" name="password" />
                                <FieldsError errors={state?.error?.password?.errors} />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                                <Input type="password" defaultValue={state?.data?.confirmPassword} id="confirm-password" name="confirm-password" />
                                <FieldsError errors={state?.error?.confirmPassword?.errors} />
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                    <FieldSeparator className="my-2" />
                    {typeof state?.error === 'string' && (
                        <p className="text-sm text-red-500 mb-4 font-medium">{state.error}</p>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isPending}>{isPending ? "Creating Account..." : "Create Account"}</Button>
                </CardFooter>
            </form>
        </Card>
    );
}
