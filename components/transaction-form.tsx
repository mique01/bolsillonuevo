"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2, Edit2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTranslation } from "@/components/language-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useTransactions, type TransactionType, type Transaction, Category, PaymentMethod } from "@/contexts/transaction-context"

export function TransactionForm({
  onSuccess,
  editTransaction = null,
}: {
  onSuccess?: () => void
  editTransaction?: Transaction | null
}) {
  const { t } = useTranslation()
  const {
    addTransaction,
    updateTransaction,
    expenseCategories,
    addExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
    incomeCategories,
    addIncomeCategory,
    updateIncomeCategory,
    deleteIncomeCategory,
    paymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  } = useTransactions()

  const [transactionType, setTransactionType] = React.useState<TransactionType>(editTransaction?.type || "expense")
  const [date, setDate] = React.useState<Date | undefined>(
    editTransaction?.date ? new Date(editTransaction.date) : new Date(),
  )
  const [selectedCategory, setSelectedCategory] = React.useState(editTransaction?.category || "")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState(editTransaction?.paymentMethod || "")
  const [newCategoryName, setNewCategoryName] = React.useState("")
  const [newPaymentMethodName, setNewPaymentMethodName] = React.useState("")
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null)
  const [editingPaymentMethod, setEditingPaymentMethod] = React.useState<PaymentMethod | null>(null)
  const [showCategoryDialog, setShowCategoryDialog] = React.useState(false)
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = React.useState(false)
  const [amount, setAmount] = React.useState(editTransaction?.amount.toString() || "")
  const [description, setDescription] = React.useState(editTransaction?.description || "")
  const [notes, setNotes] = React.useState(editTransaction?.notes || "")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Handle category dialog submission (Add or Edit)
  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) return

    try {
      if (editingCategory) {
        // Update existing category using context function
        if (transactionType === "expense") {
          updateExpenseCategory(editingCategory.id, { name: newCategoryName })
        } else {
          updateIncomeCategory(editingCategory.id, { name: newCategoryName })
        }
        toast({ title: t("success"), description: t("category.updated") || "Category updated" })
      } else {
        // Add new category using context function
        const categoryData = { name: newCategoryName };
        let newCategory;
        if (transactionType === "expense") {
          newCategory = addExpenseCategory(categoryData);
        } else {
          newCategory = addIncomeCategory(categoryData);
        }
        // Optionally select the newly added category
        if(newCategory) setSelectedCategory(newCategory.id);
        toast({ title: t("success"), description: t("category.added") || "Category added" })
      }
      // Reset state and close dialog
      setNewCategoryName("")
      setEditingCategory(null)
      setShowCategoryDialog(false)
    } catch (error) {
        console.error("Error saving category:", error);
        toast({
            title: t("error"),
            description: (error as Error).message || t("category.save.error") || "Failed to save category",
            variant: "destructive",
        });
    }
  }

  // Handle category keydown event for Enter key
  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSaveCategory()
    }
  }

  // Handle category deletion
  const handleDeleteCategory = (id: string) => {
    try {
      if (transactionType === "expense") {
        deleteExpenseCategory(id)
        // If the deleted category was selected, clear selection
        if (selectedCategory === id) setSelectedCategory("")
      } else {
        deleteIncomeCategory(id)
        // If the deleted category was selected, clear selection
        if (selectedCategory === id) setSelectedCategory("")
      }
      toast({ title: t("success"), description: t("category.deleted") || "Category deleted" })
    } catch (error) {
       console.error("Error deleting category:", error);
        toast({
            title: t("error"),
            description: (error as Error).message || t("category.delete.error") || "Failed to delete category",
            variant: "destructive",
        });
    }
  }

  // Handle payment method dialog submission (Add or Edit)
  const handleSavePaymentMethod = () => {
    if (!newPaymentMethodName.trim()) return

    try {
      if (editingPaymentMethod) {
        // Update existing payment method using context function
        updatePaymentMethod(editingPaymentMethod.id, { name: newPaymentMethodName })
        toast({ title: t("success"), description: t("payment.method.updated") || "Payment method updated" })
      } else {
        // Add new payment method using context function
        const newMethod = addPaymentMethod({ name: newPaymentMethodName })
        // Optionally select the newly added method
        if(newMethod) setSelectedPaymentMethod(newMethod.id);
        toast({ title: t("success"), description: t("payment.method.added") || "Payment method added" })
      }
      // Reset state and close dialog
      setNewPaymentMethodName("")
      setEditingPaymentMethod(null)
      setShowPaymentMethodDialog(false)
    } catch (error) {
       console.error("Error saving payment method:", error);
        toast({
            title: t("error"),
            description: (error as Error).message || t("payment.method.save.error") || "Failed to save payment method",
            variant: "destructive",
        });
    }
  }

  // Handle payment method keydown event for Enter key
  const handlePaymentMethodKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSavePaymentMethod()
    }
  }

  // Handle payment method deletion
  const handleDeletePaymentMethod = (id: string) => {
    try {
      deletePaymentMethod(id)
      // If the deleted method was selected, clear selection
      if (selectedPaymentMethod === id) setSelectedPaymentMethod("")
       toast({ title: t("success"), description: t("payment.method.deleted") || "Payment method deleted" })
    } catch (error) {
         console.error("Error deleting payment method:", error);
        toast({
            title: t("error"),
            description: (error as Error).message || t("payment.method.delete.error") || "Failed to delete payment method",
            variant: "destructive",
        });
    }

  }

  // Reset category selection when transaction type changes
  React.useEffect(() => {
    setSelectedCategory("")
  }, [transactionType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Basic validation
    if (!amount || !description || !selectedCategory || !date || (transactionType === 'expense' && !selectedPaymentMethod)) {
      toast({
        title: t("error"),
        description: t("form.validation.error"),
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Create transaction object - categoryName and paymentMethodName will be handled by context functions
    const transactionData: Omit<Transaction, "id"> = {
      type: transactionType,
      amount: Number.parseFloat(amount),
      description,
      category: selectedCategory,
      categoryName: selectedCategory, // Provide the ID, context will resolve the name
      date: date || new Date(), // Ensure date is provided
      paymentMethod: transactionType === "expense" ? selectedPaymentMethod : undefined,
      paymentMethodName: transactionType === "expense" ? selectedPaymentMethod : undefined, // Provide the ID, context will resolve the name
      notes: notes || undefined,
    }

    try {
      // Add or update transaction using context functions
      if (editTransaction) {
        updateTransaction(editTransaction.id, transactionData)
        toast({
          title: t("success"),
          description: t("transaction.updated"),
        })
      } else {
        addTransaction(transactionData)
        toast({
          title: t("success"),
          description: t("transaction.added"),
        })
      }

      // Reset form only if adding a new transaction
      if (!editTransaction) {
        setAmount("")
        setDescription("")
        setSelectedCategory("")
        setSelectedPaymentMethod("")
        setNotes("")
        setDate(new Date())
        // Keep transactionType as is, maybe user wants to add another of the same type
      }

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
        console.error("Error submitting transaction:", error);
         toast({
            title: t("error"),
            description: (error as Error).message || t("transaction.submit.error") || "Failed to submit transaction",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false)
    }
  }

  // Determine which categories to display based on transaction type
  const currentCategories = transactionType === "expense" ? expenseCategories : incomeCategories

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>{t("transaction.type")}</Label>
        <RadioGroup
          defaultValue={transactionType}
          value={transactionType}
          onValueChange={(value) => {
              const newType = value as TransactionType;
              setTransactionType(newType);
              // Reset selections when type changes
              setSelectedCategory("");
              if (newType === 'income') {
                  setSelectedPaymentMethod(""); // Clear payment method for income
              }
           }}
          className="flex space-x-4"
          disabled={!!editTransaction}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="expense" id="expense" />
            <Label htmlFor="expense">{t("expense")}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="income" id="income" />
            <Label htmlFor="income">{t("income")}</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">{t("amount")}</Label>
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

        <div className="space-y-2">
          <Label htmlFor="date">{t("date")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>{t("pick.date")}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("description")}</Label>
        <Input
          id="description"
          placeholder={t("description.placeholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">{t("category")}</Label>
        <div className="flex items-center space-x-2">
           <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
            <SelectTrigger>
              <SelectValue placeholder={t("select.category")} />
            </SelectTrigger>
            <SelectContent>
              {currentCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between pr-2 relative group">
                  <SelectItem value={category.id} className="flex-grow">
                      {category.name}
                  </SelectItem>
                   <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex items-center space-x-1 bg-background p-1 rounded">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation() // Prevent select from closing
                        setEditingCategory(category)
                        setNewCategoryName(category.name)
                        setShowCategoryDialog(true)
                      }}
                      type="button" // Important: prevent form submission
                      aria-label={t("edit.category")}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation() // Prevent select from closing
                        // Optional: Add confirmation dialog before deleting
                        handleDeleteCategory(category.id)
                      }}
                      type="button" // Important: prevent form submission
                      aria-label={t("delete.category") || "Delete Category"}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </SelectContent>
          </Select>
           <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                 onClick={() => {
                    setEditingCategory(null); // Ensure we are adding, not editing
                    setNewCategoryName("");
                    // No need to manually set showCategoryDialog = true due to DialogTrigger
                 }}
                 type="button"
                 aria-label={t("add.category")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                 <DialogTitle>{editingCategory ? t("edit.category") : t("add.category")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 py-4">
                <Label htmlFor="new-category-name">{t("category.name")}</Label>
                <Input
                  id="new-category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={t("category.name.placeholder")}
                  onKeyDown={handleCategoryKeyDown}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCategoryDialog(false)} type="button">
                  {t("cancel")}
                </Button>
                <Button onClick={handleSaveCategory} type="button">
                  {editingCategory ? t("save.changes") : t("add")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {transactionType === "expense" && (
        <div className="space-y-2">
          <Label htmlFor="payment-method">{t("payment.method")}</Label>
          <div className="flex items-center space-x-2">
             <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} required>
              <SelectTrigger>
                <SelectValue placeholder={t("select.payment.method")} />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                   <div key={method.id} className="flex items-center justify-between pr-2 relative group">
                    <SelectItem value={method.id} className="flex-grow">
                        {method.name}
                    </SelectItem>
                     <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex items-center space-x-1 bg-background p-1 rounded">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingPaymentMethod(method);
                                setNewPaymentMethodName(method.name);
                                setShowPaymentMethodDialog(true);
                            }}
                            type="button"
                            aria-label={t("edit.payment.method")}
                        >
                            <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePaymentMethod(method.id);
                            }}
                            type="button"
                            aria-label={t("delete.payment.method") || "Delete Payment Method"}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                   </div>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={showPaymentMethodDialog} onOpenChange={setShowPaymentMethodDialog}>
              <DialogTrigger asChild>
                 <Button
                  variant="outline"
                  size="icon"
                   onClick={() => {
                      setEditingPaymentMethod(null);
                      setNewPaymentMethodName("");
                   }}
                   type="button"
                   aria-label={t("add.payment.method")}
                 >
                  <Plus className="h-4 w-4" />
                 </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                   <DialogTitle>{editingPaymentMethod ? t("edit.payment.method") : t("add.payment.method")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 py-4">
                  <Label htmlFor="new-payment-method-name">{t("payment.method.name")}</Label>
                  <Input
                    id="new-payment-method-name"
                    value={newPaymentMethodName}
                    onChange={(e) => setNewPaymentMethodName(e.target.value)}
                    placeholder={t("payment.method.name.placeholder")}
                    onKeyDown={handlePaymentMethodKeyDown}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPaymentMethodDialog(false)} type="button">
                    {t("cancel")}
                  </Button>
                  <Button onClick={handleSavePaymentMethod} type="button">
                     {editingPaymentMethod ? t("save.changes") : t("add")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">{t("notes")} <span className="text-muted-foreground">({t("optional") || "Optional"})</span></Label>
        <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("notes.placeholder")}
            className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            )}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("saving") : (editTransaction ? t("update") : t("save"))}
        </Button>
      </div>
    </form>
  )
}
