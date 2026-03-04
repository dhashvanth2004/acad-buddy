import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, BookOpen, Sparkles, Key, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logger, getErrorMessage } from "@/lib/error-logger";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Google Gemini REST API setup
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=";

const suggestedQuestions = [
  "How do I solve quadratic equations?",
  "Explain photosynthesis in simple terms",
  "What are the key concepts in calculus?",
  "Help me understand supply and demand",
];

const StudyAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Load API key from local storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem("GEMINI_API_KEY");
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowApiKeyDialog(true);
    }
  }, []);

  const saveApiKey = (key: string) => {
    if (!key.trim()) return;
    localStorage.setItem("GEMINI_API_KEY", key.trim());
    setApiKey(key.trim());
    setShowApiKeyDialog(false);
    toast({
      title: "API Key Saved",
      description: "Your key has been saved securely to your browser.",
    });
  };

  // Fix auto-scroll on Radix's viewport element
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  // Lightweight custom markdown parser to avoid heavy dependencies
  const renderMessageContent = (content: string) => {
    if (!content) return null;

    // Split by code blocks first
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeText = part.slice(3, -3).replace(/^[a-z]*\n/, ''); // Remove language tag
        return (
          <pre key={i} className="bg-background/80 p-3 rounded-lg my-2 overflow-x-auto border border-border/50 text-xs font-mono">
            <code>{codeText}</code>
          </pre>
        );
      }

      // Handle inline bold and italics
      return (
        <span
          key={i}
          dangerouslySetInnerHTML={{
            __html: part
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/`([^`]+)`/g, '<code class="bg-background/60 px-1 py-0.5 rounded text-xs">$1</code>')
          }}
        />
      );
    });
  };

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the Study Assistant.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [user, authLoading, navigate, toast]);

  const streamChat = async (userMessages: Message[]) => {
    if (!apiKey) {
      setShowApiKeyDialog(true);
      throw new Error("Gemini API Key is required");
    }

    const systemPrompt = `You are AcadBuddy's AI Study Assistant - a highly knowledgeable tutor. Your goal is to explain complex concepts simply, provide homework help, and offer study strategies. Format your responses using markdown. Keep explanations concise but thorough.`;

    // Convert messages to Gemini's format
    const geminiMessages = userMessages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`${GEMINI_API_URL}${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: geminiMessages,
      }),
    });

    if (!response.ok) {
      if (response.status === 400 || response.status === 403) {
        localStorage.removeItem("GEMINI_API_KEY");
        setApiKey("");
        setShowApiKeyDialog(true);
        throw new Error("Invalid API Key. Please provide a valid Gemini API Key.");
      }
      throw new Error(`Failed to communicate with AI (Status ${response.status})`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });
      const lines = textBuffer.split("\n");

      // Keep the last partial line in the buffer
      textBuffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const contentStr = line.replace("data: ", "").trim();
          if (!contentStr) continue;

          try {
            const data = JSON.parse(contentStr);
            const textChunk = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (textChunk) {
              assistantContent += textChunk;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch (e) {
            // Ignore parse errors on partial chunks
            console.error("Parse error on chunk:", contentStr);
          }
        }
      }
    }
  };

  const handleSend = async (messageText?: string) => {
    if (!apiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat(updatedMessages);
    } catch (error) {
      logger.error("Chat error", error, {
        component: "StudyAssistant",
      });
      toast({
        title: "Error",
        description: getErrorMessage(error) || "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 pt-24 pb-12 max-w-5xl">
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-full mb-4 shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">AI-Powered Study Help</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Meet Your Study Assistant</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Get instant, AI-driven help with your academic material. Ask any question, from simple definitions to complex theories!
          </p>
        </div>

        <Card className="flex flex-col h-[calc(100vh-14rem)] md:h-[calc(100vh-16rem)] border-border bg-card shadow-sm overflow-hidden animate-fade-in relative z-10 w-full relative">

          {/* API Key Modal Overlay */}
          {showApiKeyDialog && (
            <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
              <Card className="w-full max-w-md shadow-lg border-border">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4 text-primary">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Key className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">API Setup Required</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    To use the Study Assistant, you need a free Google Gemini API Key. Your key is securely stored in your browser's local storage and is never sent to our servers.
                  </p>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    saveApiKey(fd.get("apiKey") as string);
                  }} className="space-y-4">
                    <Input
                      name="apiKey"
                      placeholder="AIzaSy..."
                      className="bg-background/50 border-primary/20 focus-visible:border-primary"
                      autoFocus
                    />
                    <div className="flex flex-col gap-2">
                      <Button type="submit" className="w-full">
                        Save Key & Start Learning
                      </Button>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-center text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 mt-2"
                      >
                        <AlertCircle className="w-3 h-3" /> Get a free Gemini API Key here
                      </a>
                    </div>
                  </form>
                </div>
              </Card>
            </div>
          )}

          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm flex items-center justify-center mb-6">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">How can I help you today?</h3>
                <p className="text-muted-foreground mb-8 max-w-md text-sm leading-relaxed">
                  I'm your personal AI tutor. Ask me to explain a concept, solve a step-by-step problem, or quiz you on a specific topic.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left h-auto py-4 px-5 justify-start border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all w-full text-foreground shadow-sm"
                      onClick={() => handleSend(question)}
                    >
                      <BookOpen className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
                      <span className="text-sm font-medium">{question}</span>
                    </Button>
                  ))}
                </div>

                <div className="mt-8 text-sm text-foreground">
                  <span className="text-muted-foreground">Need personalized human guidance?</span>{" "}
                  <Link to="/mentors" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                    Find a Mentor <Sparkles className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 text-sm md:text-base ${message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-sm mt-1">
                        <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm border ${message.role === "user"
                        ? "bg-primary text-primary-foreground border-primary rounded-tr-sm"
                        : "bg-muted/50 text-foreground border-border/50 rounded-tl-sm"
                        }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {renderMessageContent(message.content)}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 border border-accent/20 shadow-sm mt-1">
                        <User className="h-4 w-4 md:h-5 md:w-5 text-accent-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3 justify-start animate-fade-in">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-sm mt-1">
                      <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div className="max-w-[85%] md:max-w-[75%] bg-muted/50 rounded-2xl rounded-tl-sm px-5 py-4 border border-border/50 shadow-sm flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 bg-card border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <div className="flex gap-3 items-end max-w-5xl mx-auto">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your studies..."
                disabled={isLoading}
                className="flex-1 bg-background/50 focus-visible:bg-background border-border/60 min-h-[3rem] py-3 text-base shadow-sm"
              />
              <Button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm"
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5 ml-1" />
                )}
              </Button>
            </div>
            {messages.length > 0 && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                AI can make mistakes. Consider verifying important academic information.
              </p>
            )}
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default StudyAssistant;
