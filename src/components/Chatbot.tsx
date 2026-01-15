"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/data/categories";
import {
  MessageCircle,
  X,
  Send,
  Phone,
  Mail,
  Package,
  ChevronRight,
  Bot,
  User,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
  actions?: { label: string; action: string }[];
}

// Quick action buttons
const quickActions = [
  { label: "Προϊόντα", action: "products", icon: <Package className="w-3 h-3" /> },
  { label: "Τιμή", action: "quote", icon: <Send className="w-3 h-3" /> },
  { label: "Κλήση", action: "call", icon: <Phone className="w-3 h-3" /> },
  { label: "Email", action: "email", icon: <Mail className="w-3 h-3" /> },
];

// Category keywords for product matching
const categoryKeywords: Record<string, string[]> = {
  "push-in-fittings": ["ρακόρ", "ρακορ", "fitting", "σύνδεσμος", "συνδεσμος", "quick", "ταχυσύνδεση"],
  "thread-fittings": ["σπείρωμα", "σπειρωμα", "thread", "προσαρμογέας", "προσαρμογεας"],
  "couplings": ["ταχυσύνδεσμος", "ταχυσυνδεσμος", "ζεύκτης", "ζευκτης", "coupling"],
  "hoses-pipes": ["σωλήνας", "σωληνας", "σπιράλ", "σπιραλ", "hose", "pipe", "σωλήνες"],
  "ball-valves": ["βαλβίδα", "βαλβιδα", "valve", "σφαιρική", "σφαιρικη", "αντεπίστροφη"],
  "pressure-regulators": ["μανόμετρο", "μανομετρο", "πίεση", "πιεση", "ρυθμιστής", "ρυθμιστης", "pressure"],
  "pneumatic-valves": ["πνευματική", "πνευματικη", "ηλεκτροβαλβίδα", "ηλεκτροβαλβιδα", "solenoid"],
  "cylinders-sensors": ["κύλινδρος", "κυλινδρος", "αισθητήρας", "αισθητηρας", "cylinder", "sensor"],
  "air-tools": ["αεροεργαλείο", "αεροεργαλειο", "φύσημα", "φυσημα", "blow gun", "air tool"],
  "water-filtration": ["φίλτρο", "φιλτρο", "νερό", "νερο", "water", "RO", "αντίστροφη"],
};

// Response templates
const responses: Record<string, string> = {
  greeting: "Γεια σας! Είμαι ο βοηθός της AEROFREN. Πώς μπορώ να σας βοηθήσω;",
  products: "Διαθέτουμε μεγάλη ποικιλία εξαρτημάτων για συστήματα νερού και αέρα. Τι ψάχνετε;",
  prices: "Για τιμές επικοινωνήστε στο 210 3461645 ή info@aerofren.gr. Είμαστε B2B με ειδικές τιμές για επαγγελματίες.",
  order: "Δεν διαθέτουμε e-shop. Για παραγγελίες επικοινωνήστε μαζί μας τηλεφωνικά ή μέσω φόρμας.",
  address: "📍 Χρυσοστόμου Σμύρνης 26, Μοσχάτο 18344, Αθήνα",
  hours: "⏰ Δευτέρα-Παρασκευή: 08:00-16:00\n🔴 Σάββατο-Κυριακή: Κλειστά",
  contact: "📞 210 3461645\n📧 info@aerofren.gr\n📍 Μοσχάτο, Αθήνα",
  shipping: "Αποστολές σε όλη την Ελλάδα! Παραγγελίες έως 14:00 αποστέλλονται την ίδια μέρα.",
  unknown: "Δεν κατάλαβα. Ρωτήστε για προϊόντα, τιμές, ωράριο ή καλέστε 210 3461645!",
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: responses.greeting,
      sender: "bot",
      timestamp: new Date(),
      actions: [
        { label: "Προϊόντα", action: "products" },
        { label: "Επικοινωνία", action: "contact" },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findMatchingCategory = (text: string): string | null => {
    const lowerText = text.toLowerCase();
    for (const [categorySlug, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        return categorySlug;
      }
    }
    return null;
  };

  const generateResponse = (userMessage: string): { text: string; actions?: { label: string; action: string }[] } => {
    const lowerMessage = userMessage.toLowerCase();

    // Greetings
    if (lowerMessage.includes("γεια") || lowerMessage.includes("καλημέρα") || lowerMessage.includes("hello")) {
      return { text: responses.greeting };
    }

    // Products
    if (lowerMessage.includes("προϊόν") || lowerMessage.includes("προιον") || lowerMessage.includes("κατάλογος")) {
      const matchedCategory = findMatchingCategory(lowerMessage);
      if (matchedCategory) {
        const category = categories.find((c) => c.slug === matchedCategory);
        if (category) {
          return {
            text: `"${category.nameEl}" - ${category.productCount.toLocaleString("el-GR")} προϊόντα`,
            actions: [{ label: `Δες`, action: `category:${category.slug}` }],
          };
        }
      }
      return { text: responses.products, actions: [{ label: "Κατάλογος", action: "products" }] };
    }

    // Category match
    const matchedCategory = findMatchingCategory(lowerMessage);
    if (matchedCategory) {
      const category = categories.find((c) => c.slug === matchedCategory);
      if (category) {
        return {
          text: `"${category.nameEl}" - ${category.productCount.toLocaleString("el-GR")} προϊόντα`,
          actions: [{ label: `Δες`, action: `category:${category.slug}` }],
        };
      }
    }

    // Prices
    if (lowerMessage.includes("τιμ") || lowerMessage.includes("πόσο") || lowerMessage.includes("προσφορά")) {
      return { text: responses.prices, actions: [{ label: "Προσφορά", action: "quote" }] };
    }

    // Order
    if (lowerMessage.includes("παραγγελ") || lowerMessage.includes("αγορ")) {
      return { text: responses.order, actions: [{ label: "Επικοινωνία", action: "contact" }] };
    }

    // Address
    if (lowerMessage.includes("διεύθυνση") || lowerMessage.includes("πού είστε")) {
      return { text: responses.address };
    }

    // Hours
    if (lowerMessage.includes("ωράριο") || lowerMessage.includes("ώρες")) {
      return { text: responses.hours };
    }

    // Contact
    if (lowerMessage.includes("επικοινωνία") || lowerMessage.includes("τηλέφωνο")) {
      return { text: responses.contact, actions: [{ label: "Κλήση", action: "call" }] };
    }

    // Shipping
    if (lowerMessage.includes("αποστολ") || lowerMessage.includes("μεταφορ")) {
      return { text: responses.shipping };
    }

    return { text: responses.unknown, actions: [{ label: "Κλήση", action: "call" }] };
  };

  const handleAction = (action: string) => {
    if (action === "products") window.location.href = "/products";
    else if (action === "quote" || action === "contact") window.location.href = "/contact";
    else if (action === "call") window.location.href = "tel:2103461645";
    else if (action === "email") window.location.href = "mailto:info@aerofren.gr";
    else if (action.startsWith("category:")) {
      window.location.href = `/products/${action.replace("category:", "")}`;
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: "bot",
        timestamp: new Date(),
        actions: response.actions,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-slate-800" : "bg-[#0066cc] hover:scale-110"
          }`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0066cc] to-blue-600 p-3 text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Βοηθός AEROFREN</h3>
              <p className="text-[10px] text-white/80">Online</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-2 bg-slate-50 border-b flex gap-1 overflow-x-auto">
            {quickActions.map((action) => (
              <button
                key={action.action}
                onClick={() => handleAction(action.action)}
                className="flex items-center gap-1 px-2 py-1 bg-white rounded-full border text-[10px] font-medium text-slate-700 hover:border-[#0066cc] whitespace-nowrap"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[250px] bg-slate-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 text-xs ${message.sender === "user"
                      ? "bg-[#0066cc] text-white rounded-2xl rounded-br-sm"
                      : "bg-white border rounded-2xl rounded-bl-sm"
                    }`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  {message.actions && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleAction(action.action)}
                          className="flex items-center gap-0.5 px-2 py-1 bg-[#0066cc]/10 text-[#0066cc] rounded-full text-[10px] font-semibold"
                        >
                          {action.label}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-2xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Μήνυμα..."
                className="flex-1 h-9 text-sm"
              />
              <Button type="submit" size="icon" className="h-9 w-9" disabled={!inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
