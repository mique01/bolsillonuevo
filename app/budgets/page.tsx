"use client"

import Link from "next/link"
import { CalendarRange, Plus, Wallet, Edit, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useTranslation } from "@/components/language-provider"
import { TransactionForm } from "@/components/transaction-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { EmptyState } from "@/components/empty-state"
import { useTransactions } from "@/contexts/transaction-context"
import { BudgetForm } from "@/components/budget-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MonthlyBudgetChart } from "@/components/monthly-budget-chart"
import { formatCurrency } from "@/lib/formatting"

export default function BudgetsPage() {
  const { t } = useTranslation()
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)
  const [editingBudget, setEditingBudget] = useState<{
    id: string
    category: string
    categoryName: string
    amount: number
  } | null>(null)
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null)

  const {
    expenseVsBudget,
    totalExpenses,
    totalBudget,
    budgetBalance,
    budgetUsagePercentage,
    budgets,
    deleteBudget,
    monthlyExpenseData,
  } = useTransactions()

  const handleEditBudget = (budget: typeof editingBudget) => {
    setEditingBudget(budget)
    setShowBudgetDialog(true)
  }

  const handleDeleteBudget = (id: string) => {
    setDeletingBudgetId(id)
  }

  const confirmDeleteBudget = () => {
    if (deletingBudgetId) {
      deleteBudget(deletingBudgetId)
      setDeletingBudgetId(null)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
            <Wallet className="h-6 w-6" />
            <span>Bolsillo App</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              {t("dashboard")}
            </Link>
            <Link
              href="/transactions"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {t("transactions")}
            </Link>
            <Link href="/budgets" className="text-sm font-medium transition-colors hover:text-primary">
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
            <h2 className="text-3xl font-bold tracking-tight">{t("budgets")}</h2>
            <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangePicker />
            <Dialog
              open={showBudgetDialog}
              onOpenChange={(open) => {
                setShowBudgetDialog(open)
                if (!open) setEditingBudget(null)
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("add.budget")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingBudget ? t("edit.budget") : t("add.budget")}</DialogTitle>
                  <DialogDescription>{t("budget.form.description")}</DialogDescription>
                </DialogHeader>
                <BudgetForm onSuccess={() => setShowBudgetDialog(false)} editBudget={editingBudget} />
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => setShowTransactionDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("add.transaction")}
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("budgets")}</CardTitle>
                <CalendarRange className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">${formatCurrency(totalBudget)}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("expenses")}</CardTitle>
                <CalendarRange className="h-4 w-4 text-red-600 dark:text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">${formatCurrency(totalExpenses)}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("balance")}</CardTitle>
                <CalendarRange className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">${formatCurrency(budgetBalance)}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("budget.usage")}</CardTitle>
                <CalendarRange className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {budgetUsagePercentage.toFixed(1)}%
                </div>
                <Progress value={budgetUsagePercentage} className="mt-2" />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{t("category.budgets")}</CardTitle>
              <CardDescription>{t("expenses.vs.budget.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {budgets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("category")}</TableHead>
                      <TableHead>{t("budget.limit")}</TableHead>
                      <TableHead>{t("expenses")}</TableHead>
                      <TableHead>{t("balance")}</TableHead>
                      <TableHead>{t("progress")}</TableHead>
                      <TableHead className="text-right">{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseVsBudget.map((budget, index) => {
                      const percentage = budget.budget > 0 ? (budget.expense / budget.budget) * 100 : 0
                      const isOverBudget = budget.expense > budget.budget
                      const budgetId = budgets.find((b) => b.categoryName === budget.name)?.id || ""
                      const balance = budget.budget - budget.expense

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{budget.name}</TableCell>
                          <TableCell>${formatCurrency(budget.budget)}</TableCell>
                          <TableCell>${formatCurrency(budget.expense)}</TableCell>
                          <TableCell className={isOverBudget ? "text-red-600 dark:text-red-400" : ""}>
                            ${formatCurrency(balance)}
                          </TableCell>
                          <TableCell className="w-[200px]">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={Math.min(percentage, 100)}
                                className={`h-2 ${isOverBudget ? "bg-red-200 dark:bg-red-800" : ""}`}
                              />
                              <span
                                className={`text-sm ${isOverBudget ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
                              >
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleEditBudget({
                                    id: budgetId,
                                    category: budgets.find((b) => b.id === budgetId)?.category || "",
                                    categoryName: budget.name,
                                    amount: budget.budget,
                                  })
                                }
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">{t("edit")}</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleDeleteBudget(budgetId)}
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">{t("delete")}</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  title={t("no.budgets")}
                  description={t("no.budgets.description")}
                  icon="chart"
                  action={{
                    label: t("add.budget"),
                    onClick: () => setShowBudgetDialog(true),
                  }}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("monthly.budget.analysis")}</CardTitle>
              <CardDescription>{t("monthly.budget.analysis.description")}</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <MonthlyBudgetChart />
            </CardContent>
          </Card>
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

      <AlertDialog open={!!deletingBudgetId} onOpenChange={(open) => !open && setDeletingBudgetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete.budget")}</AlertDialogTitle>
            <AlertDialogDescription>{t("delete.budget.confirmation")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBudget} className="bg-destructive text-destructive-foreground">
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
