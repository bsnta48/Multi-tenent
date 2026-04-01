"use client"

import { forgotPassword } from "@/app/actions/auth/auth.actions"
import FieldsError from "@/components/FieldErrors"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useActionState } from "react"

export default function ForgotPasswordPage() {
    const [state, formAction, isPending] = useActionState(forgotPassword, undefined)
    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold mb-4">Forgot your password?</CardTitle>
                <CardDescription></CardDescription>
                <CardAction>
                    <Button variant="link" asChild>
                        <Link href="/sign-in">Sign In</Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <form action={formAction}>
                <CardContent>
                    <FieldSet>
                        <FieldGroup>
                            {!state?.success && <FieldError>{state?.message}</FieldError>}
                            {state?.success && <FieldError className="text-green-500">{state?.message}</FieldError>}
                            {!state?.success && <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input defaultValue={state?.data?.email} id="email" name="email" aria-invalid={!!state?.error?.email?.errors[0]} />
                                <FieldsError errors={state?.error?.email?.errors} />
                            </Field>}
                        </FieldGroup>
                    </FieldSet>
                    <FieldSeparator className="my-2" />
                </CardContent>
                {!state?.success && <CardFooter className="flex items-center justify-between">
                    <Button type="submit" disabled={isPending}>{isPending ? "Sending..." : "Send"}</Button>
                </CardFooter>}
            </form>
        </Card>
    );
}