"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { apiFetch } from "@/lib/api-fetch"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useDashboardContext } from "../context"

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

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { me } = useDashboardContext()

  // State for form
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [department, setDepartment] = useState("")
  const [address, setAddress] = useState("")

  const [error, setError] = useState<any>(null)

  useEffect(() => {
    setUser(me)
    setUsername(me?.username || "")
    setFirstName(me?.userProfile?.firstName || "")
    setLastName(me?.userProfile?.lastName || "")
    setPhone(me?.userProfile?.phone || "")
    setJobTitle(me?.userProfile?.jobTitle || "")
    setDepartment(me?.userProfile?.department || "")
    setAddress(me?.userProfile?.address || "")
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await apiFetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
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
        toast.success("Profile updated successfully.")
        setUser(result.data)
      } else {
        setError(result)
        toast.error(result.message || "Failed to update profile.")
      }
    } catch (error) {
      toast.error("An error occurred while saving.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account details and view your profile information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Your profile picture used across the application.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={me?.userProfile?.avatar || ""} alt={me?.username} />
              <AvatarFallback className="text-2xl">{me?.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-sm font-medium">{firstName && lastName ? `${firstName} ${lastName}` : username}</p>
              <p className="text-xs text-muted-foreground">{me?.email}</p>
              <p className="text-xs text-muted-foreground mt-1 capitalize border rounded-full px-2 py-0.5 inline-block">{me?.role}</p>
            </div>
            {/* Future image upload can go here */}
            <Button variant="outline" size="sm" className="mt-2" disabled>Upload Image</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="flex flex-col gap-4">

              <FieldSet>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <Field>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. John" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Doe" />
                  </Field>
                </div>
              </FieldSet>

              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required aria-invalid={!!error?.error?.username?.errors[0]} />
                    {error?.error?.username?.errors[0] && <FieldError>{error.error.username.errors[0]}</FieldError>}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email Address</FieldLabel>
                    <Input id="email" value={me?.email} disabled className="bg-muted text-muted-foreground" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +1 234 567 890" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="address">Address</FieldLabel>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your physical address" />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <div className="my-2 border-t"></div>

              <h3 className="text-lg font-medium tracking-tight mt-2">Work Information</h3>
              <FieldSet>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <Field>
                    <FieldLabel htmlFor="jobTitle">Job Title</FieldLabel>
                    <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="department">Department</FieldLabel>
                    <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Engineering" />
                  </Field>
                </div>
              </FieldSet>

            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-6">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
