"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { subMonths, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import { useTranslation } from "@/components/language-provider"

export type TransactionType = "expense" | "income"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  description: string
  category: string
  categoryName: string
  date: Date
  paymentMethod?: string
  paymentMethodName?: string
  notes?: string
}

export interface Budget {
  id: string
  category: string
  categoryName: string
  amount: number
}

export interface Category {
  id: string
  name: string
}

export interface PaymentMethod {
  id: string
  name: string
}

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface TransactionContextType {
  transactions: Transaction[]
  filteredTransactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, "id">) => void
  updateTransaction: (id: string, transaction: Omit<Transaction, "id">) => void
  deleteTransaction: (id: string) => void
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  expensesByCategory: { name: string; value: number }[]
  incomeByCategory: { name: string; value: number }[]
  expenseVsIncome: { name: string; expenses: number; income: number }[]
  expenseVsBudget: { name: string; expense: number; budget: number }[]
  totalExpenses: number
  totalIncome: number
  totalBalance: number
  budgets: Budget[]
  addBudget: (budget: Omit<Budget, "id">) => void
  updateBudget: (id: string, budget: Omit<Budget, "id">) => void
  deleteBudget: (id: string) => void
  getBudgetForCategory: (category: string) => Budget | undefined
  totalBudget: number
  budgetBalance: number
  budgetUsagePercentage: number
  monthlyExpenseData: { month: string; expenses: number; budget: number }[]
  expenseCategories: Category[]
  addExpenseCategory: (category: Omit<Category, "id">) => Category
  updateExpenseCategory: (id: string, categoryData: Partial<Omit<Category, "id">>) => void
  deleteExpenseCategory: (id: string) => void
  incomeCategories: Category[]
  addIncomeCategory: (category: Omit<Category, "id">) => Category
  updateIncomeCategory: (id: string, categoryData: Partial<Omit<Category, "id">>) => void
  deleteIncomeCategory: (id: string) => void
  paymentMethods: PaymentMethod[]
  addPaymentMethod: (method: Omit<PaymentMethod, "id">) => PaymentMethod
  updatePaymentMethod: (id: string, methodData: Partial<Omit<PaymentMethod, "id">>) => void
  deletePaymentMethod: (id: string) => void
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export const useTransactions = () => {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider")
  }
  return context
}

// Función de utilidad para recuperar datos del localStorage de manera segura
const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      console.log(`Cargado ${key} desde localStorage:`, parsed);
      return parsed;
    }
  } catch (error) {
    console.error(`Error al cargar ${key} desde localStorage:`, error);
  }
  
  return defaultValue;
};

// Función de utilidad para guardar datos en localStorage de manera segura
const setToLocalStorage = (key: string, value: any): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    console.log(`Guardado ${key} en localStorage:`, value);
  } catch (error) {
    console.error(`Error al guardar ${key} en localStorage:`, error);
  }
};

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation()
  const [initialized, setInitialized] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([])
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  })

  // Cargar datos al inicio
  useEffect(() => {
    const loadData = () => {
      // Cargar transacciones
      const savedTransactions = getFromLocalStorage<any[]>("transactions", [])
      if (savedTransactions.length > 0) {
        const parsedTransactions = savedTransactions.map((t) => ({
          ...t,
          date: new Date(t.date),
        }))
        setTransactions(parsedTransactions)
        console.log("Transacciones cargadas:", parsedTransactions.length)
      }

      // Cargar presupuestos
      const savedBudgets = getFromLocalStorage<Budget[]>("budgets", [])
      setBudgets(savedBudgets)
      
      // Cargar categorías de gastos
      const savedExpenseCategories = getFromLocalStorage<Category[]>("expenseCategories", [])
      setExpenseCategories(savedExpenseCategories)
      
      // Cargar categorías de ingresos
      const savedIncomeCategories = getFromLocalStorage<Category[]>("incomeCategories", [])
      setIncomeCategories(savedIncomeCategories)
      
      // Cargar métodos de pago
      const savedPaymentMethods = getFromLocalStorage<PaymentMethod[]>("paymentMethods", [])
      setPaymentMethods(savedPaymentMethods)
      
      setInitialized(true)
    }

    if (!initialized) {
      loadData()
    }
  }, [initialized])

  // Guardar transacciones cuando cambien
  useEffect(() => {
    if (initialized) {
      setToLocalStorage("transactions", transactions)
    }
  }, [transactions, initialized])

  // Guardar presupuestos cuando cambien
  useEffect(() => {
    if (initialized) {
      setToLocalStorage("budgets", budgets)
    }
  }, [budgets, initialized])

  // Guardar categorías de gastos cuando cambien
  useEffect(() => {
    if (initialized) {
      setToLocalStorage("expenseCategories", expenseCategories)
    }
  }, [expenseCategories, initialized])

  // Guardar categorías de ingresos cuando cambien
  useEffect(() => {
    if (initialized) {
      setToLocalStorage("incomeCategories", incomeCategories)
    }
  }, [incomeCategories, initialized])

  // Guardar métodos de pago cuando cambien
  useEffect(() => {
    if (initialized) {
      setToLocalStorage("paymentMethods", paymentMethods)
    }
  }, [paymentMethods, initialized])

  const filteredTransactions = React.useMemo(() => {
    if (!dateRange.from || !dateRange.to) return transactions

    const startDate = startOfDay(dateRange.from);
    const endDate = endOfDay(dateRange.to);

    return transactions.filter((transaction) => {
      if (!transaction.date) return false;
      const transactionDate = startOfDay(new Date(transaction.date))
      return isWithinInterval(transactionDate, {
        start: startDate,
        end: endDate,
      })
    })
  }, [transactions, dateRange])

  const expensesByCategory = React.useMemo(() => {
    const expenseTransactions = filteredTransactions.filter((t) => t.type === "expense")
    const categoriesMap: Record<string, { name: string; value: number }> = {}

    expenseCategories.forEach(cat => {
      categoriesMap[cat.id] = { name: cat.name, value: 0 }
    })

    expenseTransactions.forEach((transaction) => {
      const categoryId = transaction.category
      const categoryName = expenseCategories.find(c => c.id === categoryId)?.name || transaction.categoryName

      if (categoriesMap[categoryId]) {
        categoriesMap[categoryId].value += transaction.amount
        categoriesMap[categoryId].name = categoryName
      } else {
        categoriesMap[categoryId] = { name: categoryName, value: transaction.amount }
      }
    })

    return Object.values(categoriesMap)
  }, [filteredTransactions, expenseCategories])

  const incomeByCategory = React.useMemo(() => {
    const incomeTransactions = filteredTransactions.filter((t) => t.type === "income")
    const categoriesMap: Record<string, { name: string; value: number }> = {}

    incomeCategories.forEach(cat => {
      categoriesMap[cat.id] = { name: cat.name, value: 0 }
    })

    incomeTransactions.forEach((transaction) => {
      const categoryId = transaction.category
      const categoryName = incomeCategories.find(c => c.id === categoryId)?.name || transaction.categoryName

      if (categoriesMap[categoryId]) {
        categoriesMap[categoryId].value += transaction.amount
        categoriesMap[categoryId].name = categoryName
      } else {
        categoriesMap[categoryId] = { name: categoryName, value: transaction.amount }
      }
    })

    return Object.values(categoriesMap)
  }, [filteredTransactions, incomeCategories])

  const expenseVsIncome = React.useMemo(() => {
    // Verificar que las fechas existan
    if (!dateRange.from || !dateRange.to) {
      return [];
    }

    // Calcular la diferencia en días entre las fechas seleccionadas
    const startDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Objeto para almacenar los datos agregados
    const aggregatedData: Record<string, { expenses: number; income: number }> = {};

    // Función para formatear la fecha según el rango
    const getDateKey = (date: Date) => {
      if (diffDays <= 31) {
        // Para rangos de hasta 31 días, mostrar por día
        return date.toLocaleDateString('es-ES', { 
          day: '2-digit',
          month: 'short'
        });
      } else {
        // Para rangos mayores a 31 días, mostrar por mes
        return date.toLocaleDateString('es-ES', { 
          month: 'short',
          year: 'numeric'
        });
      }
    };

    // Inicializar las fechas en el rango
    if (diffDays <= 31) {
      // Para rangos cortos, inicializar todos los días
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateKey = getDateKey(currentDate);
        aggregatedData[dateKey] = { expenses: 0, income: 0 };
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      // Para rangos largos, inicializar todos los meses
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateKey = getDateKey(currentDate);
        aggregatedData[dateKey] = { expenses: 0, income: 0 };
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    // Agregar las transacciones al período correspondiente
    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const dateKey = getDateKey(date);

      if (!aggregatedData[dateKey]) {
        aggregatedData[dateKey] = { expenses: 0, income: 0 };
      }

      if (transaction.type === "expense") {
        aggregatedData[dateKey].expenses += transaction.amount;
      } else {
        aggregatedData[dateKey].income += transaction.amount;
      }
    });

    // Convertir a array y ordenar por fecha
    return Object.entries(aggregatedData)
      .map(([name, data]) => ({
        name,
        expenses: data.expenses,
        income: data.income,
      }))
      .sort((a, b) => {
        try {
          // Intentar convertir a fechas de manera más robusta
          let dateA, dateB;
          
          // Si es formato mes-año (para rangos largos)
          if (a.name.includes(" ") && b.name.includes(" ")) {
            dateA = new Date(a.name);
            dateB = new Date(b.name);
          } 
          // Si es formato día-mes (para rangos cortos)
          else {
            // Asumimos formato "DD MMM" y agregamos un año cualquiera para comparación
            dateA = new Date(`${a.name} 2023`);
            dateB = new Date(`${b.name} 2023`);
          }
          
          return dateA.getTime() - dateB.getTime();
        } catch (e) {
          console.warn("Error ordenando fechas:", e, a.name, b.name);
          return 0; // Mantener orden original si hay error
        }
      });
  }, [filteredTransactions, dateRange])

  const expenseVsBudget = React.useMemo(() => {
    const expensesByCategoryId: Record<string, number> = {}

    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        const categoryId = transaction.category
        if (expensesByCategoryId[categoryId]) {
          expensesByCategoryId[categoryId] += transaction.amount
        } else {
          expensesByCategoryId[categoryId] = transaction.amount
        }
      })

    return budgets.map((budget) => {
      const category = expenseCategories.find(c => c.id === budget.category)
      const categoryName = category ? category.name : budget.categoryName

      return {
        name: categoryName,
        expense: expensesByCategoryId[budget.category] || 0,
        budget: budget.amount,
      }
    })
  }, [filteredTransactions, budgets, expenseCategories])

  const monthlyExpenseData = React.useMemo(() => {
    const months: Record<string, { expenses: number; budget: number }> = {}
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    monthNames.forEach((month) => {
      months[month] = { expenses: 0, budget: 0 }
    })

    const totalMonthlyBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)

    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        const date = new Date(transaction.date)
        const monthKey = monthNames[date.getMonth()]
        months[monthKey].expenses += transaction.amount
        months[monthKey].budget = totalMonthlyBudget
      })

    return Object.entries(months)
      .map(([month, data]) => ({
        month,
        expenses: data.expenses,
        budget: data.budget,
      }))
      .sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month))
  }, [filteredTransactions, budgets])

  const totalExpenses = React.useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  }, [filteredTransactions])

  const totalIncome = React.useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  }, [filteredTransactions])

  const totalBalance = totalIncome - totalExpenses

  const totalBudget = React.useMemo(() => {
    return budgets.reduce((sum, budget) => sum + budget.amount, 0)
  }, [budgets])

  const budgetBalance = totalBudget - totalExpenses
  const budgetUsagePercentage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const categoryList = transaction.type === 'expense' ? expenseCategories : incomeCategories
    const category = categoryList.find(c => c.id === transaction.category)
    const paymentMethod = paymentMethods.find(p => p.id === transaction.paymentMethod)

    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      categoryName: category ? category.name : transaction.category,
      paymentMethodName: paymentMethod ? paymentMethod.name : transaction.paymentMethod,
    }
    setTransactions((prev) => [...prev, newTransaction])
  }

  const updateTransaction = (id: string, transaction: Omit<Transaction, "id">) => {
    const categoryList = transaction.type === 'expense' ? expenseCategories : incomeCategories
    const category = categoryList.find(c => c.id === transaction.category)
    const paymentMethod = paymentMethods.find(p => p.id === transaction.paymentMethod)

    const updatedTransaction = {
      ...transaction,
      id,
      categoryName: category ? category.name : transaction.category,
      paymentMethodName: paymentMethod ? paymentMethod.name : transaction.paymentMethod,
    }

    setTransactions((prev) => prev.map((t) => (t.id === id ? updatedTransaction : t)))
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const addBudget = (budget: Omit<Budget, "id">) => {
    const category = expenseCategories.find(c => c.id === budget.category)

    const newBudget = {
      ...budget,
      id: crypto.randomUUID(),
      categoryName: category ? category.name : budget.category,
    }
    setBudgets((prev) => [...prev, newBudget])
  }

  const updateBudget = (id: string, budget: Omit<Budget, "id">) => {
    const category = expenseCategories.find(c => c.id === budget.category)
    const updatedBudget = {
      ...budget,
      id,
      categoryName: category ? category.name : budget.category,
    }
    setBudgets((prev) => prev.map((b) => (b.id === id ? updatedBudget : b)))
  }

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }

  const getBudgetForCategory = (categoryId: string) => {
    return budgets.find((b) => b.category === categoryId)
  }

  const generateIdFromName = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, "-") + '-' + Date.now()
  }

  const addExpenseCategory = (category: Omit<Category, "id">): Category => {
    const newId = generateIdFromName(category.name)
    if (expenseCategories.some(c => c.id === newId || c.name.toLowerCase() === category.name.toLowerCase())) {
      console.warn(`Expense category with name '${category.name}' or generated id '${newId}' already exists.`)
      return expenseCategories.find(c => c.id === newId || c.name.toLowerCase() === category.name.toLowerCase())!
    }
    const newCategory = { ...category, id: newId }
    setExpenseCategories((prev) => [...prev, newCategory])
    return newCategory
  }

  const updateExpenseCategory = (id: string, categoryData: Partial<Omit<Category, "id">>) => {
    if (categoryData.name && expenseCategories.some(c => c.id !== id && c.name.toLowerCase() === categoryData.name!.toLowerCase())) {
      console.warn(`Another expense category with the name '${categoryData.name}' already exists.`)
      return
    }
    setExpenseCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...categoryData } : cat))
    )
    setBudgets(prevBudgets => prevBudgets.map(b => b.category === id ? { ...b, categoryName: categoryData.name || b.categoryName } : b))
  }

  const deleteExpenseCategory = (id: string) => {
    setExpenseCategories((prev) => prev.filter((cat) => cat.id !== id))
    setBudgets((prev) => prev.filter((budget) => budget.category !== id))
  }

  const addIncomeCategory = (category: Omit<Category, "id">): Category => {
    const newId = generateIdFromName(category.name)
    if (incomeCategories.some(c => c.id === newId || c.name.toLowerCase() === category.name.toLowerCase())) {
      console.warn(`Income category with name '${category.name}' or generated id '${newId}' already exists.`)
      return incomeCategories.find(c => c.id === newId || c.name.toLowerCase() === category.name.toLowerCase())!
    }
    const newCategory = { ...category, id: newId }
    setIncomeCategories((prev) => [...prev, newCategory])
    return newCategory
  }

  const updateIncomeCategory = (id: string, categoryData: Partial<Omit<Category, "id">>) => {
    if (categoryData.name && incomeCategories.some(c => c.id !== id && c.name.toLowerCase() === categoryData.name!.toLowerCase())) {
      console.warn(`Another income category with the name '${categoryData.name}' already exists.`)
      return
    }
    setIncomeCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...categoryData } : cat))
    )
  }

  const deleteIncomeCategory = (id: string) => {
    setIncomeCategories((prev) => prev.filter((cat) => cat.id !== id))
  }

  const addPaymentMethod = (method: Omit<PaymentMethod, "id">): PaymentMethod => {
    const newId = generateIdFromName(method.name)
    if (paymentMethods.some(m => m.id === newId || m.name.toLowerCase() === method.name.toLowerCase())) {
      console.warn(`Payment method with name '${method.name}' or generated id '${newId}' already exists.`)
      return paymentMethods.find(m => m.id === newId || m.name.toLowerCase() === method.name.toLowerCase())!
    }
    const newMethod = { ...method, id: newId }
    setPaymentMethods((prev) => [...prev, newMethod])
    return newMethod
  }

  const updatePaymentMethod = (id: string, methodData: Partial<Omit<PaymentMethod, "id">>) => {
    if (methodData.name && paymentMethods.some(m => m.id !== id && m.name.toLowerCase() === methodData.name!.toLowerCase())) {
      console.warn(`Another payment method with the name '${methodData.name}' already exists.`)
      return
    }
    setPaymentMethods((prev) =>
      prev.map((meth) => (meth.id === id ? { ...meth, ...methodData } : meth))
    )
  }

  const deletePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((meth) => meth.id !== id))
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        filteredTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        dateRange,
        setDateRange,
        expensesByCategory,
        incomeByCategory,
        expenseVsIncome,
        expenseVsBudget,
        totalExpenses,
        totalIncome,
        totalBalance,
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        getBudgetForCategory,
        totalBudget,
        budgetBalance,
        budgetUsagePercentage,
        monthlyExpenseData,
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
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export const useTransactionContext = () => useContext(TransactionContext)
