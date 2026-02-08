import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  FileText,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import Card from "../ui/Card";
import PropTypes from "prop-types";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Badge from "../ui/Badge";
import { useApp } from "../../context/AppContext";

const ChatBot = ({
  documentId = null,
  summary = null,
  summaryLoading = false,
  className = "",
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("chatbot");

  // 🔹 STRUCTURED DATA STATE
  const [structuredData, setStructuredData] = useState(null);

  const messagesEndRef = useRef();
  const { addNotification } = useApp();

  const suggestedPrompts = [
    "Summarize key points",
    "What is this document about?",
    "Translate to Spanish?",
    "What are the main risks?",
    "Extract key data",
    "Find inconsistencies",
    "Generate report",
  ];

  /* ===============================
     INIT MESSAGE
  ================================ */
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: "bot",
          content: documentId
            ? "I'm ready to help you analyze this document. What would you like to know?"
            : "Hello! Upload a document and I'll help you analyze it.",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [documentId, messages.length]);

  /* ===============================
     SCROLL CHAT
  ================================ */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===============================
     BUILD STRUCTURED DATA FROM SUMMARY
  ================================ */
  useEffect(() => {
    if (!documentId) return;

    if (summary && !summaryLoading) {
      setStructuredData({
        documentType: "Uploaded Document",

        keyMetrics: {
          "Summary Length": `${summary.length} characters`,
          Status: "Generated",
        },

        flaggedItems: [],

        recommendations: [
          "Review extracted summary",
          "Ask questions in chatbot",
          "Verify important clauses",
        ],

        summaryText: summary, // 👈 MAIN THING
      });
    }
  }, [summary, summaryLoading, documentId]);

  /* ===============================
     SEND CHAT MESSAGE
  ================================ */
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          documentId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: data.botMessage.id,
          type: "bot",
          content: data.botMessage.content,
          timestamp: data.botMessage.timestamp,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          content: `❌ ${error.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);

      addNotification({ type: "error", message: error.message });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    setInputMessage(prompt);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /* ===============================
     UI
  ================================ */
  return (
    <Card className={`h-full flex flex-col ${className}`}>
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("structured")}
          className={`px-4 py-3 text-sm font-medium border-b-2 ${
            activeTab === "structured"
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-gray-500"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={16} />
            Structured Data Output
          </div>
        </button>

        <button
          onClick={() => setActiveTab("chatbot")}
          className={`px-4 py-3 text-sm font-medium border-b-2 ${
            activeTab === "chatbot"
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-gray-500"
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageSquare size={16} />
            Chatbot
          </div>
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "structured" ? (
          <div className="p-4 h-full overflow-y-auto space-y-6">
            {structuredData ? (
              <>
                {/* SUMMARY */}
                <div>
                  <h3 className="font-semibold mb-2">Document Summary</h3>
                  {summaryLoading ? (
                    <p className="text-gray-500">Generating summary...</p>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {structuredData.summaryText}
                    </p>
                  )}
                </div>

                {/* METRICS */}
                <div>
                  <h3 className="font-semibold mb-2">Key Metrics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(structuredData.keyMetrics).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <p className="text-xs text-gray-500">{key}</p>
                          <p className="font-semibold">{value}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* RECOMMENDATIONS */}
                <div>
                  <h3 className="font-semibold mb-2">Recommendations</h3>
                  <ul className="space-y-1">
                    {structuredData.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-gray-700">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center">
                No structured data available
              </p>
            )}
          </div>
        ) : (
          <>
            {/* CHAT */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg ${
                      m.type === "user"
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="text-sm text-gray-500">Typing...</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* SUGGESTIONS */}
            {messages.length <= 1 && (
              <div className="p-3 border-t bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((p, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant="outline"
                      onClick={() => handleSuggestedPrompt(p)}
                    >
                      <Sparkles size={12} className="mr-1" />
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* INPUT */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about this document..."
                />
                <Button onClick={handleSendMessage}>
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default ChatBot;

ChatBot.propTypes = {
  documentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  summary: PropTypes.string,
  summaryLoading: PropTypes.bool,
  className: PropTypes.string,
};
