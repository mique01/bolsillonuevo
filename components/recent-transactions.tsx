import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/components/language-provider"
import { EmptyState } from "@/components/empty-state"
import { useTransactions } from "@/contexts/transaction-context"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/formatting"
import Link from "next/link"

export function RecentTransactions() {
  const { t } = useTranslation()
  const { filteredTransactions } = useTransactions()

  // Get the 5 most recent transactions
  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-4">
      {recentTransactions.length > 0 ? (
        <div className="space-y-2">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between space-x-4 rounded-md border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    transaction.type === "expense" ? "bg-red-100 dark:bg-red-900" : "bg-green-100 dark:bg-green-900",
                  )}
                >
                  {transaction.type === "expense" ? (
                    <ArrowDownIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                  ) : (
                    <ArrowUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(transaction.date), "MMM d, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{transaction.categoryName}</Badge>
                <p
                  className={cn(
                    "text-sm font-medium",
                    transaction.type === "expense"
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400",
                  )}
                >
                  {transaction.type === "expense" ? "-" : "+"}
                  ${formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={t("no.recent.transactions")}
          description={t("no.recent.transactions.description")}
          icon="receipt"
        />
      )}
      <Button variant="outline" className="w-full" asChild>
        <Link href="/transactions">{t("view.all.transactions")}</Link>
      </Button>
    </div>
  )
}
