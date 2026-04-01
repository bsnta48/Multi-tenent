"use client"

import { useDashboardContext } from "@/app/dashboard/context"
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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, CheckCircle2, XCircle, Clock, Trash2, Eye, User, Calendar, MessageSquare, Check, X } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api-fetch"
import { Textarea } from "@/components/ui/textarea"

export default function AllRequestsPage() {
    const { me } = useDashboardContext()
    const [allRequests, setAllRequests] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Status update modal state
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false)
    const [selectedRequestForAction, setSelectedRequestForAction] = useState<any>(null)
    const [targetStatus, setTargetStatus] = useState<"completed" | "rejected">("completed")
    const [replyText, setReplyText] = useState("")
    const [isSubmittingAction, setIsSubmittingAction] = useState(false)

    // Details modal state
    const [selectedRequest, setSelectedRequest] = useState<any>(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

    const fetchAllRequests = async () => {
        setIsLoading(true)
        try {
            const res = await apiFetch("/api/requests")
            if (res.ok) {
                const result = await res.json()
                setAllRequests(result.data || [])
            } else {
                toast.error("Failed to fetch all requests")
            }
        } catch (error) {
            toast.error("An error occurred while fetching requests")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (me?.role === "admin") {
            fetchAllRequests()
        }
    }, [me])

    const handleViewDetails = (req: any) => {
        setSelectedRequest(req)
        setIsDetailsModalOpen(true)
    }

    const openActionModal = (req: any, status: "completed" | "rejected") => {
        setSelectedRequestForAction(req)
        setTargetStatus(status)
        setReplyText("")
        setIsResponseModalOpen(true)
    }

    const handleActionSubmit = async () => {
        if (!selectedRequestForAction) return
        
        setIsSubmittingAction(true)
        try {
            const res = await apiFetch(`/api/requests/${selectedRequestForAction.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    status: targetStatus,
                    replyText,
                    updatedBy: me ? `${me.userProfile?.firstName || me.username}, ${me.email}` : "System"
                })
            })

            if (res.ok) {
                toast.success(`Request ${targetStatus === "completed" ? "approved" : "rejected"} successfully`)
                setIsResponseModalOpen(false)
                fetchAllRequests()
            } else {
                const error = await res.json()
                toast.error(error.message || "Failed to update request")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsSubmittingAction(false)
        }
    }

    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this request?")) return

        try {
            const res = await apiFetch(`/api/requests/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status: "canceled", updatedBy: me?.id })
            })

            if (res.ok) {
                toast.success("Request canceled successfully")
                fetchAllRequests()
            } else {
                const error = await res.json()
                toast.error(error.message || "Failed to cancel request")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    const filteredRequests = (status: string) => {
        return allRequests.filter((req: any) =>
            req.status === status &&
            (req.event?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
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

    const RequestTable = ({ items }: { items: any[] }) => (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead>Event/Subject</TableHead>
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
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{req.user?.userProfile?.firstName ? req.user?.userProfile?.firstName + " " + req.user?.userProfile?.lastName : req.user?.username}</span>
                                        <span className="text-xs text-muted-foreground">{req.user?.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium capitalize">{req.type}</TableCell>
                                <TableCell>{req.event}</TableCell>
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
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openActionModal(req, "completed")}
                                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Approve
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openActionModal(req, "rejected")}
                                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Reject
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCancel(req.id)}
                                                className="text-slate-600 hover:text-slate-700 hover:bg-slate-50 h-8 px-2"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )

    if (me?.role !== "admin") {
        return (
            <div className="p-12 text-center">
                <h1 className="text-2xl font-bold text-rose-600">Unauthorized</h1>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Requests</h1>
                    <p className="text-muted-foreground">Overview of all system service requests</p>
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

            {/* Response Modal (Approve/Reject) */}
            <Dialog open={isResponseModalOpen} onOpenChange={setIsResponseModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            {targetStatus === "completed" ? (
                                <><CheckCircle2 className="text-emerald-500" /> Approve Request</>
                            ) : (
                                <><XCircle className="text-rose-500" /> Reject Request</>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {targetStatus === "completed" 
                                ? "Give a final response to complete this request." 
                                : "Provide a reason for rejecting this request."}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-4">
                        <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
                            <p className="text-sm font-medium">Request by: <span className="text-foreground">{selectedRequestForAction?.user?.username}</span></p>
                            <p className="text-sm font-medium">Event: <span className="text-foreground">{selectedRequestForAction?.event}</span></p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="replyText" className="font-semibold text-sm flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                {targetStatus === "completed" ? "Approval Message (Optional)" : "Rejection Reason"}
                            </Label>
                            <Textarea
                                id="replyText"
                                placeholder={targetStatus === "completed" ? "Well done, hope this helps..." : "Sorry, this request cannot be processed because..."}
                                className="min-h-[120px] resize-none"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsResponseModalOpen(false)}>Cancel</Button>
                        <Button 
                            className={targetStatus === "completed" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}
                            onClick={handleActionSubmit}
                            disabled={isSubmittingAction || (targetStatus === "rejected" && !replyText.trim())}
                        >
                            {isSubmittingAction ? "Processing..." : (targetStatus === "completed" ? "Approve & Complete" : "Reject Request")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Modal */}
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
                            <DialogDescription className="text-neutral-300 mt-1 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Requested on {selectedRequest && new Date(selectedRequest.createdAt).toLocaleDateString(undefined, {
                                        dateStyle: 'long'
                                    })}
                                </span>
                                <span className="flex items-center gap-2 text-white font-medium">
                                    <User className="w-4 h-4" />
                                    By {selectedRequest?.user?.username}
                                </span>
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
                                            {selectedRequest?.updatedBy || 'System/Admin'}
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
                                                dateStyle: 'medium'
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
                                    This request is currently awaiting your review.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-6 bg-muted/20 border-t items-center sm:justify-between flex-row">
                        {selectedRequest?.status === "pending" ? (
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button 
                                    onClick={() => { setIsDetailsModalOpen(false); openActionModal(selectedRequest, "completed"); }}
                                    className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    Approve
                                </Button>
                                <Button 
                                    onClick={() => { setIsDetailsModalOpen(false); openActionModal(selectedRequest, "rejected"); }}
                                    className="px-6 bg-rose-600 hover:bg-rose-700 text-white"
                                >
                                    Reject
                                </Button>
                                <Button 
                                    onClick={() => { setIsDetailsModalOpen(false); handleCancel(selectedRequest.id); }}
                                    variant="ghost"
                                    className="px-6 text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : <div></div>}
                        <Button 
                            onClick={() => setIsDetailsModalOpen(false)}
                            variant="outline"
                            className="px-8"
                        >
                            Close Details
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
