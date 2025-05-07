"use client"

import type * as React from "react"
import { format, subDays, startOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTranslation } from "@/components/language-provider"
import { useTransactions } from "@/contexts/transaction-context"

export function DateRangePicker({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { language } = useTranslation()
  const locale = language === "es" ? es : undefined
  const { t } = useTranslation()

  const { dateRange, setDateRange } = useTransactions()

  const handleLast7Days = () => {
    const today = new Date()
    const sevenDaysAgo = subDays(today, 7)
    setDateRange({
      from: sevenDaysAgo,
      to: today,
    })
  }

  const handleThisMonth = () => {
    const today = new Date()
    const firstDayOfMonth = startOfMonth(today)
    setDateRange({
      from: firstDayOfMonth,
      to: today,
    })
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button variant="outline" size="sm" onClick={handleLast7Days} className="hidden sm:flex">
        {t("last.7.days")}
      </Button>
      <Button variant="outline" size="sm" onClick={handleThisMonth} className="hidden sm:flex">
        {t("this.month")}
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[240px] sm:w-[300px] justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y", { locale })} - {format(dateRange.to, "LLL dd, y", { locale })}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y", { locale })
              )
            ) : (
              <span>{t("pick.date")}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-2 flex gap-2 border-b">
            <Button variant="outline" size="sm" onClick={handleLast7Days} className="flex sm:hidden">
              {t("last.7.days")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleThisMonth} className="flex sm:hidden">
              {t("this.month")}
            </Button>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            locale={locale}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
