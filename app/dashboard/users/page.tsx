"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api-fetch"
import Link from "next/link"
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
import { Plus, MoreHorizontal, Trash2, Edit } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDashboardContext } from "../context"

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
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  })
  const { me } = useDashboardContext()

  const openDeleteConfirm = (userId: string) => {
    setDeleteConfirm({ open: true, userId })
  }

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ open: false, userId: null })
  }

  const handleConfirmDelete = async () => {
    const userId = deleteConfirm.userId
    if (!userId) return

    setDeleting(userId)
    closeDeleteConfirm()
    try {
      const res = await apiFetch(`/api/users/${userId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setUsers(users.filter(u => u.id !== userId))
          toast.success("User deleted successfully")
        } else {
          toast.error(data.message || "Failed to delete user")
        }
      } else {
        toast.error("Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("An error occurred while deleting user")
    } finally {
      setDeleting(null)
    }
  }

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
              <TableHead className="w-12">Actions</TableHead>
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/users/${user.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {user.id !== me?.id && <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteConfirm(user.id)}
                            disabled={deleting === user.id}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deleting === user.id ? "Deleting..." : "Delete"}
                          </DropdownMenuItem>
                        </>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteConfirm.open} onOpenChange={(open: boolean) => {
        if (!open) closeDeleteConfirm()
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel onClick={closeDeleteConfirm}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}