"use client"

import { signOut } from "@/app/actions/auth";
import { useDashboardContext } from "@/app/dashboard/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";

export default function DashboardHeader() {

    const { setTheme } = useTheme();
    const { user } = useDashboardContext();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
            <div className="flex items-center gap-2 font-semibold md:text-lg">
                <span className="text-xl font-bold tracking-tight">Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
                {/* Theme Mode Toggle */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-full">
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Notification Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-full">
                            <Bell className="h-5 w-5" />
                            <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 p-0 text-xs text-white">
                                3
                            </Badge>
                            <span className="sr-only">Toggle notifications</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3">
                            <span className="font-semibold text-sm">New user signed up</span>
                            <span className="text-xs text-muted-foreground">2 minutes ago</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3">
                            <span className="font-semibold text-sm">Sale completed</span>
                            <span className="text-xs text-muted-foreground">1 hour ago</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1 p-3">
                            <span className="font-semibold text-sm">Server restarted</span>
                            <span className="text-xs text-muted-foreground">3 hours ago</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer w-full text-center text-sm font-medium">
                            View all notifications
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.userProfile?.firstName && user?.userProfile?.lastName
                                    ? `${user?.userProfile.firstName} ${user?.userProfile.lastName}`
                                    : user?.username}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => signOut()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}