"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api-fetch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { useDashboardContext } from "@/app/dashboard/context"

interface UserProfile {
  firstName: string | null
  lastName: string | null
  phone: string | null
  dob: string | null
  address: string | null
  branch: string | null
  department: string | null
  jobTitle: string | null
  avatar: string | null
}

interface User {
  id: string
  username: string
  email: string
  role: string
  userProfile: UserProfile | null
}

export default function UserPage() {
  const { me } = useDashboardContext()
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // State for form
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [department, setDepartment] = useState("")
  const [address, setAddress] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")

  const [error, setError] = useState<{ message?: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiFetch(`/api/users/${userId}`)
        if (res.ok) {
          const result = await res.json()
          if (result.success) {
            const data = result.data
            setUser(data)
            setUsername(data.username || "")
            setEmail(data.email || "")
            setRole(data.role || "")
            setFirstName(data.userProfile?.firstName || "")
            setLastName(data.userProfile?.lastName || "")
            setPhone(data.userProfile?.phone || "")
            setJobTitle(data.userProfile?.jobTitle || "")
            setDepartment(data.userProfile?.department || "")
            setAddress(data.userProfile?.address || "")
          }
        } else {
          setError({ message: "Failed to fetch user" })
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
        setError({ message: "An error occurred while fetching user" })
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [userId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await apiFetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          role,
          userProfile: {
            firstName,
            lastName,
            phone,
            jobTitle,
            department,
            address
          }
        })
      })
      const result = await res.json()
      if (result.success) {
        toast.success("User updated successfully.")
        setUser(result.data)
      } else {
        setError(result)
        toast.error(result.message || "Failed to update user")
      }
    } catch (error) {
      console.error("Error saving user:", error)
      setError({ message: "An error occurred while saving" })
      toast.error("An error occurred while saving")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading user details...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">User not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Edit user information and profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Information</h3>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    placeholder="Enter email"
                    required
                    disabled={true}
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="role">Role</FieldLabel>
                  <Select onValueChange={(value) => setRole(value)} defaultValue={role} disabled={me?.id === user?.id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                    />
                  </Field>
                </FieldGroup>
              </div>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="address">Address</FieldLabel>
                  <Input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address"
                  />
                </Field>
              </FieldGroup>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Professional Information</h3>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="jobTitle">Job Title</FieldLabel>
                  <Input
                    id="jobTitle"
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Job title"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="department">Department</FieldLabel>
                  <Input
                    id="department"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Department"
                  />
                </Field>
              </FieldGroup>
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                {error.message || "An error occurred"}
              </div>
            )}

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}