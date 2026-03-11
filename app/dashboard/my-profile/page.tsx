import { getProfile } from "@/app/actions/dashboard"
import Form from "./Form"

export default async function ProfilePage() {
    const profile = await getProfile()
    return (
        <div>
            <Form />
        </div>
    )
}