"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"
import { Input } from "./ui/input"

export function DatePicker(props: React.ComponentProps<typeof Input>) {
    const { defaultValue, value, name, ...rest } = props
    const parseDate = (v: any) => {
        if (!v) return undefined
        const d = new Date(v)
        return isNaN(d.getTime()) ? undefined : d
    }
    const [date, setDate] = React.useState<Date | undefined>(() => parseDate(value || defaultValue))

    React.useEffect(() => {
        const v = value !== undefined ? value : defaultValue
        if (v !== undefined) setDate(parseDate(v))
    }, [value, defaultValue])

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative cursor-pointer">
                    <Input
                        {...rest}
                        value={date && !isNaN(date.getTime()) ? format(date, "PPP") : ""}
                        placeholder="Pick a date"
                        readOnly
                    />
                    <input type="hidden" name={name} value={date && !isNaN(date.getTime()) ? date.toISOString() : ""} />
                    <ChevronDownIcon
                        data-icon="inline-end"
                        className="absolute w-4 h-4 right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    defaultMonth={date}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
