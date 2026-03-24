"use client"

import { signUp } from "@/app/actions/auth";
import FieldsError from "@/components/FieldsError";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState } from "react";


export default function SignUpPage() {
    const [state, formAction, isPending] = useActionState(signUp, undefined)

    if (state?.success) {
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
    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold mb-4">Create your account</CardTitle>
                <CardDescription></CardDescription>
                <CardAction>
                    <Button variant="link" asChild>
                        <Link href="/sign-in">Sign In</Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <form action={formAction}>
                <CardContent>
                    {!state?.success && state?.message && <FieldError>{state?.message}</FieldError>}
                    <FieldSet>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="organization-name">Organization Name</FieldLabel>
                                <Input defaultValue={state?.data?.organizationName} id="organization-name" name="organization-name" />
                                <FieldsError errors={state?.error?.organizationName?.errors} />
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
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input defaultValue={state?.data?.email} id="email" name="email" />
                                <FieldsError errors={state?.error?.email?.errors} />
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
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isPending}>{isPending ? "Signing Up..." : "Sign Up"}</Button>
                </CardFooter>
            </form>
        </Card>
    );
}