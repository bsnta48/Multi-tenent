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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDashboardContext } from "../layout"
import { FieldError } from "@/components/ui/field"
import { toast } from "sonner"

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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}