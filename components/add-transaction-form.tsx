"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function AddTransactionForm() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date>()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>Enter the details of your transaction</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <RadioGroup defaultValue="expense" className="flex">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <FormLabel htmlFor="expense">Expense</FormLabel>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <RadioGroupItem value="income" id="income" />
                <FormLabel htmlFor="income">Income</FormLabel>
              </div>
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <FormLabel htmlFor="description">Description</FormLabel>
            <Input id="description" placeholder="Enter description" />
          </div>
          <div className="grid gap-2">
            <FormLabel htmlFor="amount">Amount</FormLabel>
            <Input id="amount" placeholder="0.00" type="number" step="0.01" />
          </div>
          <div className="grid gap-2">
            <FormLabel htmlFor="category">Category</FormLabel>
            <Select>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="housing">Housing</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <FormLabel>Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <FormLabel htmlFor="notes">Notes</FormLabel>
            <Textarea id="notes" placeholder="Add any additional notes" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save Transaction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
