"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/components/language-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useTransactions, Budget } from "@/contexts/transaction-context"

export function BudgetForm({
  onSuccess,
  editBudget = null,
}: {
  onSuccess?: () => void
  editBudget?: Partial<Budget> & { id: string } | null
}) {
  const { t } = useTranslation()
  const { addBudget, updateBudget, budgets, expenseCategories } = useTransactions()

  const [selectedCategory, setSelectedCategory] = React.useState(editBudget?.category || "")
  const [amount, setAmount] = React.useState(editBudget?.amount?.toString() || "")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const availableCategories = React.useMemo(() => {
    return expenseCategories.filter(
      (category) =>
        !budgets.some((budget) => budget.category === category.id) || (editBudget && editBudget.category === category.id),
    )
  }, [expenseCategories, budgets, editBudget])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!amount || !selectedCategory) {
      toast({
        title: t("error"),
        description: t("form.validation.error"),
        variant: "destructive",
      })
      return
    }

    const budgetData = {
      category: selectedCategory,
      amount: Number.parseFloat(amount),
    }

    try {
      if (editBudget) {
        const foundName = expenseCategories.find(c => c.id === selectedCategory)?.name;
        let finalCategoryName: string | undefined = foundName ?? editBudget.categoryName;

        const categoryNameForUpdate: string = finalCategoryName ?? selectedCategory;
        
        updateBudget(editBudget.id, { ...budgetData, categoryName: categoryNameForUpdate })
        toast({
          title: t("success"),
          description: t("budget.updated"),
        })
      } else {
        const foundName = expenseCategories.find(c => c.id === selectedCategory)?.name;
        const categoryName = foundName ?? selectedCategory;
        addBudget({ ...budgetData, categoryName })
        toast({
          title: t("success"),
          description: t("budget.added"),
        })
      }

      setAmount("")
      setSelectedCategory("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error saving budget:", error)
      toast({
        title: t("error"),
        description: (error as Error).message || t("budget.save.error") || "Failed to save budget",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">{t("category")}</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory} required disabled={!!editBudget}>
          <SelectTrigger>
            <SelectValue placeholder={t("select.category")} />
          </SelectTrigger>
          <SelectContent>
            {editBudget && (
              <SelectItem key={editBudget.category} value={editBudget.category}>
                {expenseCategories.find(c => c.id === editBudget.category)?.name ?? editBudget.categoryName ?? editBudget.category}
              </SelectItem>
            )}
            {!editBudget && availableCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
            {!editBudget && availableCategories.length === 0 && expenseCategories.length > 0 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                {t("budget.no.available.categories") || "All categories have budgets."}
              </div>
            )}
            {!editBudget && expenseCategories.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                {t("budget.no.categories.yet") || "Add expense categories first."}
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">{t("budget.amount")}</Label>
        <Input
          id="amount"
          type="number"
          placeholder="0.00"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" type="button" onClick={onSuccess}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("saving") : editBudget ? t("update") : t("save")}
        </Button>
      </div>
    </form>
  )
}
