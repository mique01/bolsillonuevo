"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, TooltipProps } from "recharts"
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import { Card, CardContent } from "@/components/ui/card"
import { useTransactions } from "@/contexts/transaction-context"
import { formatCurrency } from "@/lib/formatting"
import { useTranslation } from "@/components/language-provider"

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  const { t } = useTranslation();

  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-background/95 backdrop-blur-md p-4 shadow-lg border border-border/40">
        <div className="grid gap-3">
          <div className="text-sm font-medium">{label}</div>
          <div className="space-y-2.5">
            {payload.map((entry) => (
              <div key={`item-${entry.name}`} className="flex items-center justify-between gap-10">
                <div className="flex items-center gap-2">
                  <span 
                    className="h-3 w-8 rounded-sm"
                    style={{ backgroundColor: entry.color }} 
                  />
                  <span className="text-xs font-medium capitalize text-muted-foreground">
                    {t(entry.name?.toString() || 'value')}
                  </span>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  ${formatCurrency(entry.value as number)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Legend Component
const CustomLegend = ({ payload }: any) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex justify-center items-center gap-6 pt-2">
      {payload && payload.map((entry: any, index: number) => (
        <div 
          key={`legend-${index}`} 
          className="flex items-center gap-2"
        >
          <span 
            className="block h-2.5 w-6 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-medium text-muted-foreground">
            {t(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function ExpenseVsBudget() {
  const { t } = useTranslation();
  const { expenseVsBudget: chartData } = useTransactions();

  return (
    <Card className="col-span-4 overflow-visible">
      <CardContent className="p-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, bottom: 24, left: 10 }}
              barGap={10}
            >
              <defs>
                <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                </linearGradient>
                <linearGradient id="expenseBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="hsl(var(--muted-foreground)/15)" 
                strokeWidth={1}
              />
              <XAxis 
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fill: 'hsl(var(--muted-foreground))', 
                  fontSize: 11,
                  fontWeight: 500,
                }}
                dy={10}
                tickMargin={8}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={false}
                width={0}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{
                  fill: 'hsl(var(--muted)/15)',
                  stroke: 'hsl(var(--muted)/30)',
                  strokeWidth: 1,
                  radius: 4
                }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Legend 
                content={<CustomLegend />}
                verticalAlign="bottom"
                height={24}
              />
              <Bar 
                dataKey="budget"
                name="budget"
                fill="url(#budgetGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
                isAnimationActive={true}
                animationDuration={800}
              />
              <Bar 
                dataKey="expense"
                name="expenses"
                fill="url(#expenseBarGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
                isAnimationActive={true}
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
