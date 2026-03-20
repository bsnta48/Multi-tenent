import { signUpSchema } from "@/lib/schema";

export async function signUp(state: typeof signUpSchema, formData: FormData) {
    try{
        const res = await fetch("/api/auth/sign-up", {
            method: "POST",
            body: formData
        })
        const data = await res.json()
        return data
    } catch (error){
        return error
    }
}