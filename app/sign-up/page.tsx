"use client"

import { useActionState } from "react";
import { signUp } from "../actions/auth";


export default function SignUpPage() {
    const [state, formAction, isPending] = useActionState(signUp, undefined)
    return (
        <div>
            {state?.success && <p className="text-green-500">{state.message}</p>}
            {!state?.success && <p className="text-red-500">{state?.message}</p>}
            <form action={formAction} className="max-w-sm mx-auto flex flex-col gap-4 p-8 rounded-md bg-gray-800 [&_label]:block [&_input]:w-full">
                <div>
                    <label htmlFor="username">Username</label>
                    <input defaultValue={state?.data?.username} id="username" type="text" name="username" placeholder="Enter username" className="flex-1 py-2 px-4 inline-block bg-white rounded-md text-black" />
                    {state?.errors?.username && <p className="text-red-500">{state.errors.username[0]}</p>}
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input defaultValue={state?.data?.email} id="email" type="text" name="email" placeholder="Enter your email address" className="flex-1 py-2 px-4 inline-block bg-white rounded-md text-black" />
                    {state?.errors?.email && <p className="text-red-500">{state.errors.email[0]}</p>}
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input defaultValue={state?.data?.password} id="password" type="password" name="password" placeholder="Type new password" className="flex-1 py-2 px-4 inline-block bg-white rounded-md text-black" />
                    {state?.errors?.password && <p className="text-red-500">{state.errors.password[0]}</p>}
                </div>
                <div>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input id="confirmPassword" type="password" name="confirmPassword" placeholder="Confirm your password" className="flex-1 py-2 px-4 inline-block bg-white rounded-md text-black" />
                    {state?.errors?.confirmPassword && <p className="text-red-500">{state.errors.confirmPassword[0]}</p>}
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-500 rounded-md cursor-pointer hover:bg-blue-600">Sign Up</button>
            </form>
        </div>
    );
}