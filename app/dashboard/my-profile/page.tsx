import { getUser } from "@/app/actions/dashboard"
import Form from "./Form"

export default async function ProfilePage() {
    const user = await getUser()
    return (
        <div>
            <Form user={user} />
        </div>
    )
}