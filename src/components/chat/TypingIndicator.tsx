import { Bot } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      <div className="rounded-2xl rounded-bl-md bg-card border border-border px-5 py-4 shadow-sm">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary/40 animate-pulse" />
          <span className="h-2 w-2 rounded-full bg-primary/40 animate-pulse [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-primary/40 animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
