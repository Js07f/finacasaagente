import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/contexts/FinanceContext";

interface ChatBubbleProps {
  message: ChatMessage;
}

function formatContent(content: string) {
  return content.split("**").map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border rounded-bl-md"
        )}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {formatContent(message.content)}
        </div>
        <p className={cn(
          "text-[10px] mt-1.5 opacity-60",
          isUser ? "text-primary-foreground text-right" : "text-muted-foreground"
        )}>
          {new Date(message.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      {isUser && (
        <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-secondary border border-border flex items-center justify-center">
          <User className="h-4 w-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
}
