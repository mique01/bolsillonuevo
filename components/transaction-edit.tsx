"use client"

import * as React from "react"
import { Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { TransactionForm } from "@/components/transaction-form"
import { useTranslation } from "@/components/language-provider"
import { useTransactions, type Transaction } from "@/contexts/transaction-context"
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

interface TransactionEditProps {
  transaction: Transaction
}

export function TransactionEdit({ transaction }: TransactionEditProps) {
  const { t } = useTranslation()
  const { deleteTransaction } = useTransactions()
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  const handleDelete = () => {
    deleteTransaction(transaction.id)
    setShowDeleteDialog(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={() => setShowEditDialog(true)}>
        <Edit className="h-4 w-4" />
        <span className="sr-only">{t("edit")}</span>
      </Button>
      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
        <Trash className="h-4 w-4" />
        <span className="sr-only">{t("delete")}</span>
      </Button>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("edit.transaction")}</DialogTitle>
            <DialogDescription>{t("edit.transaction.description")}</DialogDescription>
          </DialogHeader>
          <TransactionForm onSuccess={() => setShowEditDialog(false)} editTransaction={transaction} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete.transaction")}</AlertDialogTitle>
            <AlertDialogDescription>{t("delete.transaction.confirmation")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
