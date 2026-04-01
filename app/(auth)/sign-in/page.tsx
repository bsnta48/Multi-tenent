"use client"

import { signIn } from "@/lib/modules/auth/auth.actions"
import FieldErrors from "@/components/FieldErrors"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useActionState } from "react"

export default function SignInPage() {
    const [state, formAction, isPending] = useActionState(signIn, undefined)
    const fieldErrors = state?.error && typeof state.error === "object" ? (state.error as Record<string, string[]>) : {}
    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold mb-4">Sign in your account</CardTitle>
                <CardDescription></CardDescription>
                <CardAction>
                    <Button variant="link" asChild>
                        <Link href="/sign-up">Sign Up</Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <form action={formAction}>
                <CardContent>
                    <FieldSet>
                        <FieldGroup>
                            {!state?.success && state?.message && <FieldError>{state?.message}</FieldError>}
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input defaultValue={(state?.data?.email as string) || ""} id="email" name="email" aria-invalid={!!fieldErrors?.email} />
                                {fieldErrors?.email && <FieldErrors errors={fieldErrors?.email || []} />}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input type="password" defaultValue={(state?.data?.password as string) || ""} id="password" name="password" aria-invalid={!!fieldErrors?.password} />
                                {fieldErrors?.password && <FieldErrors errors={fieldErrors?.password || []} />}
                            </Field>
                            <Field orientation="horizontal">
                                <Checkbox defaultChecked={state?.data?.rememberMe === "on"} id="rememberMe" name="rememberMe" />
                                <FieldLabel htmlFor="rememberMe">Remember Me</FieldLabel>
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                    <FieldSeparator className="my-2" />
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                    <Button type="submit" disabled={isPending}>{isPending ? "Signing In..." : "Sign In"}</Button>
                    <Button variant="link" asChild>
                        <Link href="/forgot-password">Forgot Password?</Link>
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}