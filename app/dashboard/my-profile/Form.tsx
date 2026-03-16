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
import { updateUser } from "@/app/actions/dashboard"
import { toast } from "sonner"

export default function Form({ user }: { user: any }) {
    const [state, formAction, isPending] = useActionState(updateUser, undefined)
    const { userProfile: profile } = user
    console.log(state)
    if (state?.success) {
        toast.success(state.message)
    }
    if (state?.errors) {
        toast.error(state.message)
    }
    return <form action={formAction}>
        <FieldSet>
            <FieldLegend className="text-2xl">Profile</FieldLegend>
            <FieldDescription>This appears on invoices and emails.</FieldDescription>
            <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel htmlFor="firstName">First name</FieldLabel>
                        <Input name="firstName" defaultValue={state?.data?.firstName || profile.firstName} id="firstName" autoComplete="off" placeholder="Evil Rabbit" aria-invalid={!!state?.errors?.firstName} />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.firstName && (
                            <FieldError>{state.errors.firstName}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                        <Input name="lastName" defaultValue={state?.data?.lastName || profile.lastName} id="lastName" autoComplete="off" placeholder="Evil Rabbit" aria-invalid={!!state?.errors?.lastName} />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {
                            state?.errors?.lastName && (
                                <FieldError>{state.errors.lastName}</FieldError>
                            )
                        }
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <Input defaultValue={user.username} id="username" autoComplete="off" placeholder="Evil Rabbit" readOnly />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input defaultValue={user.email} id="email" autoComplete="off" placeholder="Evil Rabbit" readOnly />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="phone">Phone</FieldLabel>
                        <Input name="phone" defaultValue={state?.data?.phone || profile.phone} id="phone" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.phone && (
                            <FieldError>{state.errors.phone}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="dob">Date of Birth</FieldLabel>
                        <DatePicker name="dob" defaultValue={state?.data?.dob || profile.dob} id="dob" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.dob && (
                            <FieldError>{state.errors.dob}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="address">Address</FieldLabel>
                        <Input name="address" defaultValue={state?.data?.address || profile.address} id="address" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.address && (
                            <FieldError>{state.errors.address}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="branch">Branch</FieldLabel>
                        <Input name="branch" defaultValue={state?.data?.branch || profile.branch} id="branch" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.branch && (
                            <FieldError>{state.errors.branch}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="department">Department</FieldLabel>
                        <Input name="department" defaultValue={state?.data?.department || profile.department} id="department" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.department && (
                            <FieldError>{state.errors.department}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="jobTitle">Job Title</FieldLabel>
                        <Input name="jobTitle" defaultValue={state?.data?.jobTitle || profile.jobTitle} id="jobTitle" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.jobTitle && (
                            <FieldError>{state.errors.jobTitle}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="jobDescription">Job Description</FieldLabel>
                        <Input name="jobDescription" defaultValue={state?.data?.jobDescription || profile.jobDescription} id="jobDescription" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.jobDescription && (
                            <FieldError>{state.errors.jobDescription}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="joinDate">Join Date</FieldLabel>
                        <DatePicker name="joinDate" defaultValue={state?.data?.joinDate || profile.joinDate} id="joinDate" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.joinDate && (
                            <FieldError>{state.errors.joinDate}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="level">Level</FieldLabel>
                        <Input name="level" defaultValue={state?.data?.level || profile.level} id="level" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.level && (
                            <FieldError>{state.errors.level}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="officialContact">Official Contact</FieldLabel>
                        <Input name="officialContact" defaultValue={state?.data?.officialContact || profile.officialContact} id="officialContact" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.officialContact && (
                            <FieldError>{state.errors.officialContact}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="province">Province</FieldLabel>
                        <Input name="province" defaultValue={state?.data?.province || profile.province} id="province" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.province && (
                            <FieldError>{state.errors.province}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="servicePeriod">Service Period</FieldLabel>
                        <Input name="servicePeriod" defaultValue={state?.data?.servicePeriod || profile.servicePeriod} id="servicePeriod" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.servicePeriod && (
                            <FieldError>{state.errors.servicePeriod}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="status">Status</FieldLabel>
                        <Input name="status" defaultValue={state?.data?.status || profile.status} id="status" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.status && (
                            <FieldError>{state.errors.status}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="subDepartment">Sub Department</FieldLabel>
                        <Input name="subDepartment" defaultValue={state?.data?.subDepartment || profile.subDepartment} id="subDepartment" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.subDepartment && (
                            <FieldError>{state.errors.subDepartment}</FieldError>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="unit">Unit</FieldLabel>
                        <Input name="unit" defaultValue={state?.data?.unit || profile.unit} id="unit" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                        {state?.errors?.unit && (
                            <FieldError>{state.errors.unit}</FieldError>
                        )}
                    </Field>
                </div>
                <Field orientation="horizontal">
                    <Button type="submit" disabled={isPending}>Save</Button>
                </Field>
            </FieldGroup>
        </FieldSet>
    </form>
}