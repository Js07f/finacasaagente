import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUICK_ACTIONS = [
  { label: "💸 Registrar gasto", message: "Gastei R$50 no almoço" },
  { label: "📊 Meus gastos", message: "Quanto gastei este mês?" },
  { label: "💡 Dicas", message: "Me dê dicas para economizar" },
  { label: "🎯 Nova meta", message: "Adicionar meta de economia" },
];

interface QuickActionsProps {
  onAction: (message: string) => void;
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
      <Sparkles className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      {QUICK_ACTIONS.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          onClick={() => onAction(action.message)}
          className="text-xs whitespace-nowrap rounded-full border-border/60 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
