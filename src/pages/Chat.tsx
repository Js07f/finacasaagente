import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useFinance } from "@/contexts/FinanceContext";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  "Gastei R$50 no almoço",
  "Quanto gastei este mês?",
  "Me dê dicas para economizar",
  "Adicionar meta de economia",
];

export default function Chat() {
  const { messages, addMessage, addTransaction, getTotalExpenses, getExpensesByCategory } = useFinance();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processMessage = async (userMessage: string) => {
    addMessage({ role: "user", content: userMessage });
    setIsTyping(true);

    // Simulated AI processing - will be replaced with real AI later
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let response = "";
    const lowerMessage = userMessage.toLowerCase();

    // Simple pattern matching for demo - will be replaced with Lovable AI
    if (lowerMessage.includes("gastei") || lowerMessage.includes("paguei") || lowerMessage.includes("comprei")) {
      const amountMatch = userMessage.match(/r?\$?\s*(\d+(?:[.,]\d{2})?)/i);
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(",", "."));
        let category = "Outros";
        
        if (lowerMessage.includes("almoço") || lowerMessage.includes("jantar") || lowerMessage.includes("comida") || lowerMessage.includes("restaurante")) {
          category = "Alimentação";
        } else if (lowerMessage.includes("uber") || lowerMessage.includes("ônibus") || lowerMessage.includes("combustível") || lowerMessage.includes("gasolina")) {
          category = "Transporte";
        } else if (lowerMessage.includes("cinema") || lowerMessage.includes("show") || lowerMessage.includes("jogo")) {
          category = "Lazer";
        } else if (lowerMessage.includes("farmácia") || lowerMessage.includes("médico") || lowerMessage.includes("remédio")) {
          category = "Saúde";
        } else if (lowerMessage.includes("curso") || lowerMessage.includes("livro") || lowerMessage.includes("escola")) {
          category = "Educação";
        } else if (lowerMessage.includes("roupa") || lowerMessage.includes("shopping") || lowerMessage.includes("loja")) {
          category = "Compras";
        } else if (lowerMessage.includes("luz") || lowerMessage.includes("água") || lowerMessage.includes("internet") || lowerMessage.includes("conta")) {
          category = "Contas fixas";
        }

        addTransaction({
          amount,
          category,
          description: userMessage,
          date: new Date().toISOString().split("T")[0],
          type: "expense",
        });

        response = `✅ Registrado! Adicionei um gasto de **R$ ${amount.toFixed(2)}** na categoria **${category}**.\n\nSeu controle financeiro está em dia! Continue registrando seus gastos para ter uma visão completa das suas finanças.`;
      } else {
        response = "Não consegui identificar o valor. Pode me dizer novamente? Por exemplo: \"Gastei R$50 no almoço\"";
      }
    } else if (lowerMessage.includes("quanto gastei") || lowerMessage.includes("total de gastos") || lowerMessage.includes("meus gastos")) {
      const now = new Date();
      const totalMonth = getTotalExpenses(now.getMonth(), now.getFullYear());
      const categories = getExpensesByCategory();
      
      response = `📊 **Resumo dos seus gastos este mês:**\n\nTotal: **R$ ${totalMonth.toFixed(2)}**\n\n`;
      
      if (categories.length > 0) {
        response += "**Por categoria:**\n";
        categories.slice(0, 5).forEach((cat) => {
          response += `• ${cat.category}: R$ ${cat.total.toFixed(2)}\n`;
        });
      }
      
      response += "\nAcesse a aba **Relatórios** para ver gráficos detalhados! 📈";
    } else if (lowerMessage.includes("dica") || lowerMessage.includes("economizar") || lowerMessage.includes("ajuda")) {
      const tips = [
        "💡 **Regra 50-30-20**: Destine 50% da renda para necessidades, 30% para desejos e 20% para poupança.",
        "💡 **Revise assinaturas**: Cancele serviços que você não usa com frequência.",
        "💡 **Planeje as refeições**: Cozinhar em casa pode economizar até 40% em alimentação.",
        "💡 **Use transporte público**: Considere alternativas ao carro para trajetos rotineiros.",
        "💡 **Espere 24 horas**: Antes de compras não essenciais, espere um dia para avaliar se realmente precisa.",
      ];
      response = tips[Math.floor(Math.random() * tips.length)] + "\n\nQuer mais dicas personalizadas? É só perguntar!";
    } else if (lowerMessage.includes("meta") || lowerMessage.includes("objetivo") || lowerMessage.includes("poupar")) {
      response = "🎯 Ótimo que você quer definir metas! Para criar uma nova meta financeira, acesse a aba **Metas** no menu lateral.\n\nLá você pode:\n• Criar metas com valores e prazos\n• Acompanhar seu progresso\n• Receber dicas para alcançar seus objetivos mais rápido";
    } else {
      response = "Entendi! Posso ajudar você com:\n\n• **Registrar gastos**: \"Gastei R$30 no supermercado\"\n• **Ver resumos**: \"Quanto gastei este mês?\"\n• **Dicas**: \"Me dê dicas para economizar\"\n• **Metas**: \"Quero criar uma meta de economia\"\n\nComo posso ajudar?";
    }

    setIsTyping(false);
    addMessage({ role: "assistant", content: response });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    processMessage(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 animate-fade-in",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <Card
              className={cn(
                "max-w-[80%] md:max-w-[60%] p-4",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card"
              )}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content.split("**").map((part, i) => (
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                ))}
              </div>
            </Card>
            {message.role === "user" && (
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-4 w-4 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <Card className="p-4 bg-card">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:300ms]" />
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              onClick={() => processMessage(action)}
              className="text-xs"
            >
              {action}
            </Button>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem... Ex: 'Gastei R$30 no mercado'"
            className="flex-1"
            aria-label="Campo de mensagem"
          />
          <Button onClick={handleSend} disabled={!input.trim()} size="icon" aria-label="Enviar mensagem">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
