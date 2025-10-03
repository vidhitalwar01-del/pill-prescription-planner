import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MedicationChatbotProps {
  medications: any[];
}

const MedicationChatbot = ({ medications }: MedicationChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your medication assistant. Ask me anything about your medications, schedules, or stock calculations!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("medication-chatbot", {
        body: {
          messages: [...messages, userMessage],
          medications: medications.map((med) => ({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            time_slots: med.time_slots,
          })),
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chatbot error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-glow hover:shadow-glow hover:scale-110 transition-all z-50"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-strong animate-scale-in z-50">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <CardTitle className="text-lg">Med Assistant</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-[calc(500px-73px)]">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-muted text-foreground rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask me anything..."
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationChatbot;
