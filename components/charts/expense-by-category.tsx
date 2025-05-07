"use client"

import * as React from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend, TooltipProps } from "recharts"
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
// Removed shadcn chart specific imports
import { useTransactions } from "@/contexts/transaction-context"
import { formatCurrency } from "@/lib/formatting"
import { useTranslation } from "@/components/language-provider"
import { useTheme } from "next-themes";
import { EmptyState } from "@/components/empty-state"

// Predefined color palette for categories
const COLORS = [
  "hsl(var(--chart-1))", 
  "hsl(var(--chart-2))", 
  "hsl(var(--chart-3))", 
  "hsl(var(--chart-4))", 
  "hsl(var(--chart-5))",
  "hsl(190, 75%, 50%)", // Example fallback colors if more than 5
  "hsl(210, 75%, 50%)",
  "hsl(230, 75%, 50%)",
  "hsl(250, 75%, 50%)",
  "hsl(270, 75%, 50%)",
];

// Custom Tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  const { t } = useTranslation();

  if (active && payload && payload.length) {
    const data = payload[0].payload; // Access the data point for the hovered slice
    const name = payload[0].name;
    const value = payload[0].value;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
        <div className="font-medium mb-1">{name}</div>
        <div>
          <span className="text-muted-foreground">{t("amount")}: </span>
          <span className="font-medium">${formatCurrency(value as number)}</span>
        </div>
        {data.percent !== undefined && ( // Optionally show percentage if available
          <div>
             <span className="text-muted-foreground">{t("percentage") || "Percentage"}: </span>
             <span className="font-medium">{data.percent.toFixed(1)}%</span>
          </div>
        )}
      </div>
    );
  }

  return null;
};


export function ExpenseByCategory() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const { expensesByCategory } = useTransactions();

  const chartData = React.useMemo(() => {
    const total = expensesByCategory.reduce((sum, item) => sum + item.value, 0);
    return expensesByCategory
      .filter(item => item.value > 0) // Exclude categories with 0 expense
      .map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length], // Assign color cyclically
        percent: total > 0 ? (item.value / total) * 100 : 0,
      }));
  }, [expensesByCategory]);

  const totalExpenses = React.useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  if (chartData.length === 0) {
     return (
      <div className="h-full flex items-center justify-center p-4">
        <EmptyState 
          title={t("no.expense.data") || "No Expense Data"}
          description={t("add.expenses.to.see.chart") || "Add expenses to view this chart."}
          icon="pieChart" 
        />
      </div>
    )
  }


  return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-full">
        {/* Donut Chart Area */}
        <div className="md:col-span-3 flex items-center justify-center h-[250px] md:h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart >
              <Tooltip content={<CustomPieTooltip />} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60} // Makes it a donut chart
                outerRadius={90} // Adjust outer radius as needed
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                labelLine={false}
                // label // Disable default labels, legend is used
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill} 
                    stroke={resolvedTheme === 'dark' ? "hsl(var(--background))" : "hsl(var(--card))"}
                    strokeWidth={1}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend/Breakdown Area */}
        <div className="md:col-span-2 flex flex-col justify-center space-y-3">
          <div className="text-center mb-3">
            <p className="text-sm font-medium text-muted-foreground">{t("total.expenses") || "Total Expenses"}</p>
            <p className="text-2xl font-bold">${formatCurrency(totalExpenses)}</p>
          </div>
          <div className="space-y-1.5 overflow-y-auto max-h-[180px] md:max-h-full pr-2">
            {chartData
              .sort((a, b) => b.value - a.value) // Sort legend by value descending
              .map((category) => (
              <div key={category.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <div
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                    style={{ backgroundColor: category.fill }}
                  />
                  <span className="font-medium truncate" title={category.name}>{category.name}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <span>
                    ${formatCurrency(category.value)}
                  </span>
                   <span className="w-10 text-right text-muted-foreground">
                     ({category.percent.toFixed(1)}%)
                  </span>
                  {/* Omitted PercentageChange component */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  )
}
