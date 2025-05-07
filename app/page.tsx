"use client"

import Link from "next/link"
import { CalendarRange, CreditCard, DollarSign, PieChart, Plus, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { ExpenseVsIncome } from "@/components/charts/expense-vs-income"
import { ExpenseByCategory } from "@/components/charts/expense-by-category"
import { ExpenseVsBudget } from "@/components/charts/expense-vs-budget"
import { Progress } from "@/components/ui/progress"
import { RecentTransactions } from "@/components/recent-transactions"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useTranslation } from "@/components/language-provider"
import { TransactionForm } from "@/components/transaction-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState } from "react"
import { useTransactions } from "@/contexts/transaction-context"
import { formatCurrency } from "@/lib/formatting"

export default function DashboardPage() {
  const { t } = useTranslation()
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const { totalIncome, totalExpenses, totalBalance, budgetUsagePercentage, totalBudget } = useTransactions()

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
            <Wallet className="h-6 w-6" />
            <span>Bolsillo App</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              {t("dashboard")}
            </Link>
            <Link
              href="/transactions"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {t("transactions")}
            </Link>
            <Link
              href="/budgets"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {t("budgets")}
            </Link>
            <LanguageToggle />
            <ModeToggle />
          </nav>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h2>
            <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangePicker />
            <Button onClick={() => setShowTransactionDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("add.transaction")}
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("balance")}</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">${formatCurrency(totalBalance)}</div>
              <p className="text-xs text-green-600/80 dark:text-green-400/80">
                {totalBalance > 0 ? "+" : ""}
                {Math.round((totalBalance / (totalIncome || 1)) * 100)}% {t("from.last.month")}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("income")}</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">${formatCurrency(totalIncome)}</div>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                {totalIncome > 0 ? "+" : ""}0% {t("from.last.month")}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("expenses")}</CardTitle>
              <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">${formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-red-600/80 dark:text-red-400/80">
                {totalExpenses > 0 ? "+" : ""}0% {t("from.last.month")}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>{t("expenses.vs.income")}</CardTitle>
                <CardDescription>{t("expenses.vs.income.description")}</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ExpenseVsIncome />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("expenses.by.category")}</CardTitle>
                <CardDescription>{t("expenses.by.category.description")}</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ExpenseByCategory />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>{t("expenses.vs.budget")}</CardTitle>
                <CardDescription>{t("expenses.vs.budget.description")}</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ExpenseVsBudget />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>{t("recent.transactions")}</CardTitle>
                <CardDescription>{t("recent.transactions.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>{t("budget.usage")}</CardTitle>
                <CardDescription>{t("budget.usage.description") || t("expenses.vs.budget.description")}</CardDescription>
              </CardHeader>
              <CardContent className="py-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xl font-bold">
                    {budgetUsagePercentage ? budgetUsagePercentage.toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${formatCurrency(totalExpenses)} / ${formatCurrency(totalBudget)}
                  </div>
                </div>
                <Progress value={budgetUsagePercentage || 0} className="h-4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("add.transaction")}</DialogTitle>
            <DialogDescription>{t("add.transaction.description")}</DialogDescription>
          </DialogHeader>
          <TransactionForm onSuccess={() => setShowTransactionDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
