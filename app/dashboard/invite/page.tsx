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
import { Plus, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDashboardContext } from "../context"
import { FieldError } from "@/components/ui/field"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Invite {
  id: number
  email: string
  role: string
  token: string
  expireAt: string
  used: boolean
  createdAt: string
  updatedAt: string
}

export default function InvitePage() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [error, setError] = useState<any>(null)
  const [isInviting, setIsInviting] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; inviteId: number | null }>({
    open: false,
    inviteId: null,
  })

  const openDeleteConfirm = (inviteId: number) => {
    setDeleteConfirm({ open: true, inviteId })
  }

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ open: false, inviteId: null })
  }

  const handleConfirmDelete = async () => {
    const inviteId = deleteConfirm.inviteId
    if (!inviteId) return

    setDeleting(inviteId)
    closeDeleteConfirm()
    try {
      const res = await apiFetch(`/api/invites/${inviteId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setInvites(invites.filter(i => i.id !== inviteId))
          toast.success("Invite deleted successfully")
        } else {
          toast.error(data.message || "Failed to delete invite")
        }
      } else {
        toast.error("Failed to delete invite")
      }
    } catch (error) {
      console.error("Error deleting invite:", error)
      toast.error("An error occurred while deleting invite")
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const res = await apiFetch("/api/invites")
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setInvites(data.data)
          }
        }
      } catch (error) {
        toast.error("Failed to fetch invites")
        console.error("Failed to fetch invites:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvites()
  }, [])

  const handleInvite = async () => {
    setIsInviting(true)
    try {
      const res = await apiFetch("/api/invites/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role: 'member' }),
      })
      const result = await res.json()
      if (!result.success) {
        setError(result)
        toast.error(typeof result.error === "string" ? result.error : result.message || "Failed to send invite")
        return;
      }
      setInvites(prev => [...prev, result.data])
      setIsMenuOpen(false)
      setEmail("")
      setError(null)
      toast.success("Invite sent successfully")
    } catch (error) {
      console.error("Failed to invite:", error)
      toast.error("Failed to send invite")
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invites</h1>
          <p className="text-muted-foreground">
            Manage and view your sent invitations.
          </p>
        </div>
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Invite
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Invite New User</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={error?.error?.email?.errors[0] ? true : false}
                />
                {error?.error?.email?.errors[0] && <FieldError>{error.error.email.errors[0]}</FieldError>}
              </div>
              <Button
                onClick={handleInvite}
                disabled={isInviting}
              >
                {isInviting ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Created At</TableHead>
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
            ) : invites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No invites found.
                </TableCell>
              </TableRow>
            ) : (
              invites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell className="font-medium">{invite.email}</TableCell>
                  <TableCell className="capitalize">{invite.role}</TableCell>
                  <TableCell>
                    {invite.used ? (
                      <Badge variant="secondary">Used</Badge>
                    ) : new Date(invite.expireAt) < new Date() ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-600">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(invite.expireAt), "PPp")}</TableCell>
                  <TableCell>{format(new Date(invite.createdAt), "PPp")}</TableCell>
                  <TableCell>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openDeleteConfirm(invite.id)}
                      disabled={deleting === invite.id}
                      className="h-8 w-8 p-0 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
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
            <AlertDialogTitle>Delete Invite</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invite? This action cannot be undone.
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