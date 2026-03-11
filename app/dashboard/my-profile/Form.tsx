"use client"

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
    FieldTitle,
} from "@/components/ui/field"

import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useActionState } from "react"
import { DatePicker } from "@/components/DatePicker"

export default function Form() {
    const [state, formAction, isPending] = useActionState(() => { }, undefined)
    return <form action={formAction}>
        <FieldSet>
            <FieldLegend className="text-2xl">Profile</FieldLegend>
            <FieldDescription>This appears on invoices and emails.</FieldDescription>
            <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel htmlFor="firstName">First name</FieldLabel>
                        <Input id="firstName" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                        <Input id="lastName" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <Input id="username" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input id="email" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="phone">Phone</FieldLabel>
                        <Input id="phone" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="dob">Date of Birth</FieldLabel>
                        <DatePicker />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                    </Field>
                </div>
                <Field>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input id="username" autoComplete="off" aria-invalid />
                    <FieldError>Choose another username.</FieldError>
                </Field>
                <Field orientation="horizontal">
                    <Switch id="newsletter" />
                    <FieldLabel htmlFor="newsletter">Subscribe to the newsletter</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                    <Button type="submit">Save</Button>
                </Field>
            </FieldGroup>
        </FieldSet>
    </form>
}