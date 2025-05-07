"use client"

import Link from "next/link"
import { ArrowDownIcon, ArrowUpIcon, CalendarRange, Plus, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useTranslation } from "@/components/language-provider"
import { TransactionForm } from "@/components/transaction-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState } from "react"
import { EmptyState } from "@/components/empty-state"
import { useTransactions } from "@/contexts/transaction-context"
import { format } from "date-fns"
import { TransactionEdit } from "@/components/transaction-edit"
import { formatCurrency } from "@/lib/formatting"

export default function TransactionsPage() {
  const { t } = useTranslation()
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { filteredTransactions, totalIncome, totalExpenses, totalBalance } = useTransactions()

  // Filter transactions based on search term
  const searchFilteredTransactions = filteredTransactions.filter(
    (transaction) =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.notes && transaction.notes.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Separate income and expense transactions
  const incomeTransactions = searchFilteredTransactions.filter((t) => t.type === "income")
  const expenseTransactions = searchFilteredTransactions.filter((t) => t.type === "expense")

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
            <Link href="/transactions" className="text-sm font-medium transition-colors hover:text-primary">
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
            <h2 className="text-3xl font-bold tracking-tight">{t("transactions")}</h2>
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
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("transactions")}</CardTitle>
                <CalendarRange className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredTransactions.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("income")}</CardTitle>
                <ArrowUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{incomeTransactions.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("expenses")}</CardTitle>
                <ArrowDownIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{expenseTransactions.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("balance")}</CardTitle>
                <CalendarRange className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">${formatCurrency(totalBalance)}</div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder={t("description.placeholder")}
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                {t("clear")}
              </Button>
            </div>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">{t("overview")}</TabsTrigger>
                <TabsTrigger value="income">{t("income")}</TabsTrigger>
                <TabsTrigger value="expenses">{t("expenses")}</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("transactions")}</CardTitle>
                    <CardDescription>{t("recent.transactions.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {searchFilteredTransactions.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("date")}</TableHead>
                            <TableHead>{t("description")}</TableHead>
                            <TableHead>{t("category")}</TableHead>
                            <TableHead>{t("transaction.type")}</TableHead>
                            <TableHead className="text-right">{t("amount")}</TableHead>
                            <TableHead className="text-right">{t("actions")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {searchFilteredTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>{format(new Date(transaction.date), "MMM d, yyyy")}</TableCell>
                              <TableCell>{transaction.description}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{transaction.categoryName}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={transaction.type === "expense" ? "destructive" : "default"}
                                  className={
                                    transaction.type === "income"
                                      ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                                      : ""
                                  }
                                >
                                  {transaction.type === "expense" ? t("expense") : t("income")}
                                </Badge>
                              </TableCell>
                              <TableCell
                                className={`text-right font-medium ${
                                  transaction.type === "expense"
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-green-600 dark:text-green-400"
                                }`}
                              >
                                {transaction.type === "expense" ? "-" : "+"}
                                ${formatCurrency(transaction.amount)}
                              </TableCell>
                              <TableCell className="text-right">
                                <TransactionEdit transaction={transaction} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <EmptyState
                        title={t("no.transactions")}
                        description={t("no.transactions.description")}
                        icon="receipt"
                        action={{
                          label: t("add.transaction"),
                          onClick: () => setShowTransactionDialog(true),
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="income" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("income")}</CardTitle>
                    <CardDescription>{t("recent.transactions.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {incomeTransactions.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("date")}</TableHead>
                            <TableHead>{t("description")}</TableHead>
                            <TableHead>{t("category")}</TableHead>
                            <TableHead className="text-right">{t("amount")}</TableHead>
                            <TableHead className="text-right">{t("actions")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {incomeTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>{format(new Date(transaction.date), "MMM d, yyyy")}</TableCell>
                              <TableCell>{transaction.description}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{transaction.categoryName}</Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                                +${formatCurrency(transaction.amount)}
                              </TableCell>
                              <TableCell className="text-right">
                                <TransactionEdit transaction={transaction} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <EmptyState
                        title={t("no.income.transactions")}
                        description={t("no.income.transactions.description")}
                        icon="receipt"
                        action={{
                          label: t("add.income"),
                          onClick: () => setShowTransactionDialog(true),
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="expenses" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("expenses")}</CardTitle>
                    <CardDescription>{t("recent.transactions.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {expenseTransactions.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("date")}</TableHead>
                            <TableHead>{t("description")}</TableHead>
                            <TableHead>{t("category")}</TableHead>
                            <TableHead className="text-right">{t("amount")}</TableHead>
                            <TableHead className="text-right">{t("actions")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {expenseTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>{format(new Date(transaction.date), "MMM d, yyyy")}</TableCell>
                              <TableCell>{transaction.description}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{transaction.categoryName}</Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                                -${formatCurrency(transaction.amount)}
                              </TableCell>
                              <TableCell className="text-right">
                                <TransactionEdit transaction={transaction} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <EmptyState
                        title={t("no.expense.transactions")}
                        description={t("no.expense.transactions.description")}
                        icon="receipt"
                        action={{
                          label: t("add.expense"),
                          onClick: () => setShowTransactionDialog(true),
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
