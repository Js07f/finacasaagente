import { useState, useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import ChatBubble from "@/components/chat/ChatBubble";
import TypingIndicator from "@/components/chat/TypingIndicator";
import QuickActions from "@/components/chat/QuickActions";
import ChatInput from "@/components/chat/ChatInput";

export default function Chat() {
  const { messages, addMessage, addTransaction, getTotalExpenses, getExpensesByCategory } = useFinance();
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

    await new Promise((resolve) => setTimeout(resolve, 1000));

    let response = "";
    const lowerMessage = userMessage.toLowerCase();

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

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Agente Financeiro</h2>
            <p className="text-xs text-muted-foreground">Online • Pronto para ajudar</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-muted/20">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom */}
      <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm space-y-3">
        <QuickActions onAction={processMessage} />
        <ChatInput onSend={processMessage} disabled={isTyping} />
      </div>
    </div>
  );
}
