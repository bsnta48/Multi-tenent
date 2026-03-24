"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api-fetch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

interface UserProfile {
  firstName: string | null
  lastName: string | null
  avatar: string | null
  phone: string | null
}

interface User {
  id: string
  username: string
  email: string
  verified: boolean
  role: string
  createdAt: string
  updatedAt: string
  userProfile: UserProfile | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiFetch("/api/users")
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setUsers(data.data)
          }
        }
      } catch (error) {
        toast.error("Failed to fetch users")
        console.error("Failed to fetch users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage your users and their roles.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.userProfile?.avatar || ""} alt={user.username} />
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span>
                          {user.userProfile?.firstName && user.userProfile?.lastName
                            ? `${user.userProfile.firstName} ${user.userProfile.lastName}`
                            : user.username}
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:inline-block">
                          @{user.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>
                    {user.verified ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(user.createdAt), "PP")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}