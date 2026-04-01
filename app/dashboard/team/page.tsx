"use server"

import { verifyUser } from "@/lib/auth";
import { getUsers } from "@/lib/modules/user/user.service";
import Team from "./components/Team";

export default async function TeamPage() {
    const user = await verifyUser()
    if (!user) {
        return null
    }
    const users = await getUsers(user.tenentId)
    return (<Team users={users} />)
}