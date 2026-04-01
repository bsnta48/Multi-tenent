"use client"

import { resetPassword } from "@/app/actions/auth/auth.actions"
import FieldsError from "@/components/FieldErrors"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useActionState } from "react"
import { useParams } from "next/navigation"

export default function ResetPasswordPage() {
    const params = useParams()
    const token = params.token as string
    const [state, formAction, isPending] = useActionState(resetPassword, undefined)
    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold mb-4">Reset your password?</CardTitle>
                <CardDescription></CardDescription>
                <CardAction>
                    <Button variant="link" asChild>
                        <Link href="/sign-in">Sign In</Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <form action={(formData) => formAction({ formData, token })}>
                <CardContent>
                    <FieldSet>
                        <FieldGroup>
                            {!state?.success && <FieldError>{state?.message}</FieldError>}
                            {state?.success && <FieldError className="text-green-500">{state?.message}</FieldError>}
                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input type="password" defaultValue={state?.data?.password} id="password" name="password" aria-invalid={!!state?.error?.password?.errors[0]} />
                                <FieldsError errors={state?.error?.password?.errors} />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                                <Input type="password" defaultValue={state?.data?.confirmPassword} id="confirm-password" name="confirm-password" aria-invalid={!!state?.error?.confirmPassword?.errors[0]} />
                                <FieldsError errors={state?.error?.confirmPassword?.errors} />
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                    <FieldSeparator className="my-2" />
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                    <Button type="submit" disabled={isPending}>{isPending ? "Resetting..." : "Reset"}</Button>
                </CardFooter>
            </form>
        </Card>
    );
}