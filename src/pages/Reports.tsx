import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart as BarChartIcon, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFinance } from "@/contexts/FinanceContext";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "hsl(262, 83%, 58%)",
  "hsl(280, 70%, 55%)",
  "hsl(240, 60%, 55%)",
  "hsl(320, 70%, 55%)",
  "hsl(200, 70%, 50%)",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
];

export default function Reports() {
  const { transactions, getTotalExpenses, getTotalIncome, getExpensesByCategory, getMonthlyExpenses } = useFinance();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const totalExpensesThisMonth = getTotalExpenses(currentMonth, currentYear);
  const totalExpensesLastMonth = getTotalExpenses(lastMonth, lastMonthYear);
  const totalIncomeThisMonth = getTotalIncome(currentMonth, currentYear);

  const expenseChange = totalExpensesLastMonth > 0
    ? ((totalExpensesThisMonth - totalExpensesLastMonth) / totalExpensesLastMonth) * 100
    : 0;

  const balance = totalIncomeThisMonth - totalExpensesThisMonth;
  const expensesByCategory = getExpensesByCategory();
  const monthlyExpenses = getMonthlyExpenses();

  const pieData = expensesByCategory.map((cat, index) => ({
    name: cat.category,
    value: cat.total,
    color: COLORS[index % COLORS.length],
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const getInsights = () => {
    const insights = [];
    
    if (expenseChange > 10) {
      insights.push({
        type: "warning",
        message: `Seus gastos aumentaram ${expenseChange.toFixed(0)}% em relação ao mês passado. Revise suas despesas!`,
      });
    } else if (expenseChange < -10) {
      insights.push({
        type: "success",
        message: `Parabéns! Você reduziu ${Math.abs(expenseChange).toFixed(0)}% dos gastos em relação ao mês passado.`,
      });
    }

    if (expensesByCategory.length > 0) {
      const topCategory = expensesByCategory[0];
      const percentage = (topCategory.total / totalExpensesThisMonth) * 100;
      if (percentage > 40) {
        insights.push({
          type: "info",
          message: `${topCategory.category} representa ${percentage.toFixed(0)}% dos seus gastos. Considere reduzir nessa categoria.`,
        });
      }
    }

    if (balance < 0) {
      insights.push({
        type: "danger",
        message: "Atenção! Seus gastos estão maiores que sua receita este mês.",
      });
    } else if (balance > totalIncomeThisMonth * 0.2) {
      insights.push({
        type: "success",
        message: `Excelente! Você está economizando ${((balance / totalIncomeThisMonth) * 100).toFixed(0)}% da sua renda.`,
      });
    }

    return insights;
  };

  const insights = getInsights();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">Visualize seus gastos e insights financeiros</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpensesThisMonth)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {expenseChange !== 0 && (
                <>
                  {expenseChange > 0 ? (
                    <TrendingUp className="h-3 w-3 text-destructive" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-success" />
                  )}
                  <span className={expenseChange > 0 ? "text-destructive" : "text-success"}>
                    {Math.abs(expenseChange).toFixed(1)}%
                  </span>
                  <span>vs mês anterior</span>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalIncomeThisMonth)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total recebido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-success" : "text-destructive"}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {balance >= 0 ? "Economia" : "Déficit"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart - Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Gastos por Categoria
            </CardTitle>
            <CardDescription>Distribuição dos seus gastos</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum gasto registrado ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Monthly Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="h-5 w-5" />
              Evolução Mensal
            </CardTitle>
            <CardDescription>Gastos dos últimos meses</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="total" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Insights do Agente Financeiro
          </CardTitle>
          <CardDescription>Análises e recomendações baseadas nos seus dados</CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    insight.type === "success"
                      ? "bg-success/10 border-success/20"
                      : insight.type === "warning"
                      ? "bg-warning/10 border-warning/20"
                      : insight.type === "danger"
                      ? "bg-destructive/10 border-destructive/20"
                      : "bg-accent border-accent"
                  }`}
                >
                  <p className="text-sm">{insight.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Continue registrando suas transações para receber insights personalizados.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Categoria</CardTitle>
          <CardDescription>Todos os seus gastos organizados</CardDescription>
        </CardHeader>
        <CardContent>
          {expensesByCategory.length > 0 ? (
            <div className="space-y-3">
              {expensesByCategory.map((cat, index) => {
                const percentage = (cat.total / totalExpensesThisMonth) * 100;
                return (
                  <div key={cat.category} className="flex items-center gap-4">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{cat.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(cat.total)} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">
              Nenhuma categoria de gasto registrada ainda
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
