import { useState } from "react";
import { Plus, Target, Trash2, Edit2, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useFinance } from "@/contexts/FinanceContext";
import { cn } from "@/lib/utils";

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    category: "",
  });

  const resetForm = () => {
    setFormData({ title: "", targetAmount: "", currentAmount: "", deadline: "", category: "" });
    setEditingGoal(null);
  };

  const handleOpenDialog = (goalId?: string) => {
    if (goalId) {
      const goal = goals.find((g) => g.id === goalId);
      if (goal) {
        setEditingGoal(goalId);
        setFormData({
          title: goal.title,
          targetAmount: goal.targetAmount.toString(),
          currentAmount: goal.currentAmount.toString(),
          deadline: goal.deadline,
          category: goal.category,
        });
      }
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const goalData = {
      title: formData.title,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      deadline: formData.deadline,
      category: formData.category || "Geral",
    };

    if (editingGoal) {
      updateGoal(editingGoal, goalData);
    } else {
      addGoal(goalData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleAddProgress = (goalId: string, amount: number) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      updateGoal(goalId, { currentAmount: goal.currentAmount + amount });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Metas Financeiras</h1>
          <p className="text-muted-foreground">Defina e acompanhe seus objetivos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGoal ? "Editar Meta" : "Nova Meta"}</DialogTitle>
              <DialogDescription>
                {editingGoal ? "Atualize os detalhes da sua meta" : "Defina uma nova meta financeira"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da meta</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Fundo de emergência"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Valor objetivo (R$)</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentAmount">Valor atual (R$)</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Reserva, Viagem"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!formData.title || !formData.targetAmount}>
                {editingGoal ? "Salvar" : "Criar Meta"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma meta definida</h3>
          <p className="text-muted-foreground mb-4">
            Comece definindo sua primeira meta financeira
          </p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Criar primeira meta
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isCompleted = progress >= 100;

            return (
              <Card key={goal.id} className="relative overflow-hidden">
                {isCompleted && (
                  <div className="absolute top-0 right-0 bg-success text-success-foreground text-xs px-2 py-1 rounded-bl-lg font-medium">
                    Concluída! 🎉
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription>{goal.category}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(goal.id)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(goal.currentAmount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        de {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {daysRemaining > 0
                            ? `${daysRemaining} dias restantes`
                            : daysRemaining === 0
                            ? "Vence hoje"
                            : "Vencida"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isCompleted && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAddProgress(goal.id, 100)}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +R$100
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAddProgress(goal.id, 500)}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +R$500
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tips Card */}
      <Card className="bg-accent/30 border-accent">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Dica do Agente Financeiro</h4>
              <p className="text-sm text-muted-foreground">
                Para alcançar suas metas mais rápido, tente automatizar suas economias. Configure uma transferência automática para sua conta de investimentos logo após receber o salário.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
