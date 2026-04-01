"use client"

import FieldsError from "@/components/FieldErrors";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { User } from "@/lib/modules/user/user.types";
import { signUp } from "@/lib/modules/user/user.actions";
import Link from "next/link";
import { useActionState } from "react";


export default function SignUpPage() {
    const [state, formAction, isPending] = useActionState(signUp, undefined)
    const fieldErrors = (state && "error" in state && typeof state.error === "object") ? (state.error as Record<string, string[]>) : {}
    const formData = !state?.success ? (state?.data as User.CreateUser | undefined) : undefined;
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
            {!state?.success && state?.message && <FieldError>{state?.message}</FieldError>}
            <form action={formAction}>
                <CardContent>
                    <FieldSet>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="organization-name">Organization Name</FieldLabel>
                                <Input defaultValue={formData?.organizationName} id="organization-name" name="organization-name" aria-invalid={!!fieldErrors?.organizationName} />
                                {fieldErrors?.organizationName && <FieldsError errors={fieldErrors?.organizationName || []} />}
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                    <FieldSeparator className="my-2" />
                    <FieldSet>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="username">Username</FieldLabel>
                                <Input defaultValue={formData?.username} id="username" name="username" aria-invalid={!!fieldErrors?.username} />
                                {fieldErrors?.username && <FieldsError errors={fieldErrors?.username || []} />}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input defaultValue={formData?.email} id="email" name="email" aria-invalid={!!fieldErrors?.email} />
                                {fieldErrors?.email && <FieldsError errors={fieldErrors?.email || []} />}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input type="password" defaultValue={formData?.password} id="password" name="password" aria-invalid={!!fieldErrors?.password} />
                                {fieldErrors?.password && <FieldsError errors={fieldErrors?.password || []} />}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                                <Input type="password" defaultValue={formData?.confirmPassword} id="confirm-password" name="confirm-password" aria-invalid={!!fieldErrors?.confirmPassword} />
                                {fieldErrors?.confirmPassword && <FieldsError errors={fieldErrors?.confirmPassword || []} />}
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