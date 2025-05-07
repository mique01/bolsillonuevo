"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import { useTranslation } from "@/components/language-provider"
import { useTheme } from "next-themes"
import { useTransactions } from "@/contexts/transaction-context"
import { EmptyState } from "@/components/empty-state"

export function MonthlyBudgetChart() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const { monthlyExpenseData } = useTransactions()

  const axisColor = isDark ? "#888" : "#666"
  const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"

  if (monthlyExpenseData.every((item) => item.expenses === 0 && item.budget === 0)) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState title={t("no.budget.data")} description={t("add.budgets.and.expenses.to.see.chart")} icon="chart" />
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={monthlyExpenseData}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="month" stroke={axisColor} />
        <YAxis stroke={axisColor} />
        <Tooltip
          formatter={(value) => `$${value}`}
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#fff",
            borderColor: isDark ? "#374151" : "#e5e7eb",
            color: isDark ? "#f9fafb" : "#111827",
          }}
        />
        <Legend />
        <Bar
          dataKey="expenses"
          name={t("monthly.expenses")}
          fill={isDark ? "#f87171" : "#ef4444"}
          radius={[4, 4, 0, 0]}
        />
        <Bar dataKey="budget" name={t("monthly.budget")} fill={isDark ? "#60a5fa" : "#3b82f6"} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
