"use client"

import { createTenent } from "@/app/actions/auth";
import { useActionState } from "react";

export default function CreateTenentPage() {
    const [state, formAction] = useActionState(createTenent, undefined);
    return (
        <div>
            <form action={formAction} className="max-w-sm mx-auto flex flex-col gap-4 p-8 rounded-md bg-gray-800">
                <div>
                    <label htmlFor="organizationName">Organization name</label>
                    <input defaultValue={state?.data?.organizationName} type="text" name="organizationName" placeholder="example" className="w-full flex-1 py-2 px-4 inline-block bg-white rounded-md text-black" />
                    {state?.errors?.organizationName && <p className="text-red-500">{state.errors.organizationName[0]}</p>}
                </div>
                <div>
                    <label htmlFor="domain">Subdomain</label>
                    <div className="flex">
                        <input defaultValue={state?.data?.subdomain} type="text" name="subdomain" placeholder="example" className="flex-1 py-2 px-4 inline-block bg-white rounded-l-md text-black" />
                        <span className="py-2 px-4 inline-block bg-gray-200 rounded-r-md text-black">.localhost:3000</span>
                    </div>
                    {state?.errors?.subdomain && <p className="text-red-500">{state.errors.subdomain[0]}</p>}
                </div>
                <hr/>
                <div>
                    <label htmlFor="username">Create username</label>
                    <input defaultValue={state?.data?.username} type="text" name="username" placeholder="example" className="w-full flex-1 py-2 px-4 inline-block bg-white rounded-md text-black" />
                    {state?.errors?.username && <p className="text-red-500">{state.errors.username[0]}</p>}
                </div>
                <div>
                    <label htmlFor="email">Your email address</label>
                    <input defaultValue={state?.data?.email} type="email" name="email" placeholder="example" className="w-full flex-1 py-2 px-4 inline-block bg-white rounded-md text-black" />
                    {state?.errors?.email && <p className="text-red-500">{state.errors.email[0]}</p>}
                </div>
                <div>
                    <label htmlFor="password">Your password</label>
                    <input defaultValue={state?.data?.password} type="password" name="password" placeholder="example" className="w-full flex-1 py-2 px-4 inline-block bg-white rounded-md text-black" />
                    {state?.errors?.password && <p className="text-red-500">{state.errors.password[0]}</p>}
                </div>
                <div>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input defaultValue={state?.data?.confirmPassword} id="confirmPassword" type="password" name="confirmPassword" placeholder="Confirm your password" className="w-full flex-1 py-2 px-4 inline-block bg-white rounded-md text-black" />
                    {state?.errors?.confirmPassword && <p className="text-red-500">{state.errors.confirmPassword[0]}</p>}
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-500 rounded-md cursor-pointer hover:bg-blue-600">Create Tenent</button>
            </form>
        </div>
    );
}