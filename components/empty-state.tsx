"use client"

import { type LucideIcon, Receipt, CreditCard, PieChart, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/components/language-provider"

interface EmptyStateProps {
  title: string
  description: string
  icon?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, icon = "alert", action }: EmptyStateProps) {
  const { t } = useTranslation()

  const getIcon = (): LucideIcon => {
    switch (icon) {
      case "receipt":
        return Receipt
      case "card":
        return CreditCard
      case "chart":
        return PieChart
      default:
        return AlertCircle
    }
  }

  const Icon = getIcon()

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action && (
        <Button variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
