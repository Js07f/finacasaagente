import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Diga algo como 'Gastei R$30 no mercado'..."
        className="flex-1 rounded-full bg-muted/50 border-border/60 focus-visible:ring-primary/30"
        aria-label="Campo de mensagem"
        disabled={disabled}
      />
      <Button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        size="icon"
        className="rounded-full h-10 w-10 shadow-sm"
        aria-label="Enviar mensagem"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
