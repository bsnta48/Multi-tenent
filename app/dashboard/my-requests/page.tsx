"use client"

import { useDashboardContext } from "@/app/dashboard/layout"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Search, FileText, CheckCircle2, XCircle, Clock, Trash2, Eye, User, Calendar, Tag, MessageSquare } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api-fetch"
import { RequestType } from "@/lib/types"
import { FieldError } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

interface FormError {
    success: boolean;
    message: string;
    error: any
}

export default function RequestsPage() {
    const { requests, getRequests } = useDashboardContext()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const { me } = useDashboardContext()

    // Form state
    const [type, setType] = useState<string>("")
    const [event, setEvent] = useState("")
    const [description, setDescription] = useState("")
    const [error, setError] = useState<FormError | null>(null)

    // Details modal state
    const [selectedRequest, setSelectedRequest] = useState<any>(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

    const handleViewDetails = async (req: any) => {
        setSelectedRequest(req)
        setIsDetailsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setIsLoading(true)
        try {
            const res = await apiFetch("/api/users/me/requests", {
                method: "POST",
                body: JSON.stringify({ type, event, description })
            })

            if (res.ok) {
                toast.success("Request created successfully")
                setIsModalOpen(false)
                setType("")
                setEvent("")
                setDescription("")
                getRequests()
            } else {
                const error = await res.json()
                setError(error)
                toast.error(error.message || "Failed to create request")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const filteredRequests = (status: string) => {
        return (requests || []).filter((req: any) =>
            req.status === status &&
            (req.event?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.type?.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending": return <Clock className="w-4 h-4 text-amber-500" />
            case "completed": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            case "rejected": return <XCircle className="w-4 h-4 text-rose-500" />
            case "canceled": return <Trash2 className="w-4 h-4 text-slate-500" />
            default: return null
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending": return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">{getStatusIcon(status)} Pending</Badge>
            case "completed": return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">{getStatusIcon(status)} Completed</Badge>
            case "rejected": return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 gap-1">{getStatusIcon(status)} Rejected</Badge>
            case "canceled": return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 gap-1">{getStatusIcon(status)} Canceled</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this request?")) return

        try {
            const res = await apiFetch(`/api/requests/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status: "canceled", updatedBy: `${me.userProfile.firstName || me.username}, ${me.email}` })
            })

            if (res.ok) {
                toast.success("Request canceled successfully")
                getRequests()
            } else {
                const error = await res.json()
                toast.error(error.message || "Failed to cancel request")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    const RequestTable = ({ items }: { items: any[] }) => (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead>Event/Subject</TableHead>
                        <TableHead className="max-w-[300px]">Description</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <FileText className="w-8 h-8 opacity-20" />
                                    <p>No requests found in this category</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((req) => (
                            <TableRow key={req.id} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="font-medium capitalize">{req.type}</TableCell>
                                <TableCell>{req.event}</TableCell>
                                <TableCell className="max-w-[300px] truncate" title={req.description}>
                                    {req.description}
                                </TableCell>
                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                    {new Date(req.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(req.status)}
                                </TableCell>
                                <TableCell className="text-right flex items-center justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewDetails(req)}
                                        className="h-8 px-2 hover:bg-muted"
                                    >
                                        <Eye className="w-4 h-4 mr-1 text-muted-foreground" />
                                        View
                                    </Button>
                                    {req.status === "pending" && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCancel(req.id)}
                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Cancel
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )

    console.log(selectedRequest?.updatedAt)

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Requests</h1>
                    <p className="text-muted-foreground">Manage and track your service requests</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search requests..."
                            className="pl-9 bg-background shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="shadow-lg hover:shadow-xl transition-all gap-2 gradient-primary">
                                <PlusCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Add Request</span>
                                <span className="sm:hidden">Add</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">Create New Request</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details below to submit a new service request.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="type" className="font-semibold">Request Type</Label>
                                        <Select value={type} onValueChange={setType} aria-invalid={!!error?.error?.type.errors[0]}>
                                            <SelectTrigger id="type" className="h-11">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {RequestType.map((t) => (
                                                    <SelectItem key={t} value={t} className="capitalize">
                                                        {t}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {error?.error?.type.errors[0] && <FieldError>{error?.error?.type.errors[0]}</FieldError>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="event" className="font-semibold">Event/Subject</Label>
                                        <Input
                                            id="event"
                                            placeholder="e.g. Annual Leave, Medical Expense"
                                            className="h-11"
                                            value={event}
                                            onChange={(e) => setEvent(e.target.value)}
                                            aria-invalid={!!error?.error?.event.errors[0]}
                                        />
                                        {error?.error?.event.errors[0] && <FieldError>{error?.error?.event.errors[0]}</FieldError>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description" className="font-semibold">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Provide more details about your request..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            aria-invalid={!!error?.error?.description.errors[0]}
                                        />
                                        {error?.error?.description.errors[0] && <FieldError>{error?.error?.description.errors[0]}</FieldError>}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsModalOpen(false)}
                                        className="h-11 px-6"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="h-11 px-8 gradient-primary"
                                    >
                                        {isLoading ? "Submitting..." : "Submit Request"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="w-full justify-start h-auto p-1 bg-muted/30 border">
                    <TabsTrigger value="pending" className="flex-1 sm:flex-none px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        Pending
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="flex-1 sm:flex-none px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        Completed
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="flex-1 sm:flex-none px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        Rejected
                    </TabsTrigger>
                    <TabsTrigger value="canceled" className="flex-1 sm:flex-none px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        Canceled
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="pending" className="m-0">
                        <RequestTable items={filteredRequests("pending")} />
                    </TabsContent>
                    <TabsContent value="completed" className="m-0">
                        <RequestTable items={filteredRequests("completed")} />
                    </TabsContent>
                    <TabsContent value="rejected" className="m-0">
                        <RequestTable items={filteredRequests("rejected")} />
                    </TabsContent>
                    <TabsContent value="canceled" className="m-0">
                        <RequestTable items={filteredRequests("canceled")} />
                    </TabsContent>
                </div>
            </Tabs>

            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-linear-to-br from-neutral-900 to-neutral-800 p-6 text-white">
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <Badge className="mb-2 bg-white/20 text-white border-white/10 backdrop-blur-md uppercase tracking-wider px-3 py-1">
                                    {selectedRequest?.type}
                                </Badge>
                                {getStatusBadge(selectedRequest?.status)}
                            </div>
                            <DialogTitle className="text-3xl font-bold mt-2">
                                {selectedRequest?.event}
                            </DialogTitle>
                            <DialogDescription className="text-neutral-300 mt-1 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Requested on {selectedRequest && new Date(selectedRequest.createdAt).toLocaleDateString(undefined, {
                                    dateStyle: 'long'
                                })}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 space-y-8 bg-background">
                        <section className="space-y-3">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Description
                            </h4>
                            <div className="bg-muted/30 p-4 rounded-xl border italic text-foreground/80 leading-relaxed shadow-inner">
                                "{selectedRequest?.description}"
                            </div>
                        </section>

                        {(selectedRequest?.status !== 'pending') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
                                <section className="space-y-4">
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Processed By
                                        </h4>
                                        <p className="font-semibold text-base flex items-center gap-3">
                                            <span className="bg-neutral-100 p-2 rounded-full border shrink-0">
                                                <User className="w-4 h-4 text-neutral-600" />
                                            </span>
                                            {selectedRequest?.updatedBy}
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Processed Date
                                        </h4>
                                        <p className="font-semibold text-base flex items-center gap-3">
                                            <span className="bg-neutral-100 p-2 rounded-full border shrink-0">
                                                <Clock className="w-4 h-4 text-neutral-600" />
                                            </span>
                                            {selectedRequest && new Date(selectedRequest.updatedAt).toLocaleDateString(undefined, {
                                                dateStyle: 'medium',
                                                // timeStyle: 'short'
                                            })}
                                        </p>
                                    </div>
                                </section>

                                <section className="space-y-3">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Admin Response
                                    </h4>
                                    <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 text-neutral-900 font-medium shadow-sm min-h-[100px] flex items-start">
                                        {selectedRequest?.replyText ? (
                                            <p className="leading-relaxed whitespace-pre-wrap">{selectedRequest.replyText}</p>
                                        ) : (
                                            <p className="text-muted-foreground italic">No response provided.</p>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}

                        {selectedRequest?.status === 'pending' && (
                            <div className="pt-4 border-t">
                                <p className="text-muted-foreground flex items-center gap-2 text-sm italic">
                                    <Clock className="w-4 h-4" />
                                    This request is currently awaiting review by an administrator.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-6 bg-muted/20 border-t">
                        <Button
                            onClick={() => setIsDetailsModalOpen(false)}
                            className="w-full sm:w-auto px-8 gradient-primary"
                        >
                            Close Details
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}