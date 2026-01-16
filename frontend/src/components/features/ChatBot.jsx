import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Sparkles, MessageSquare } from 'lucide-react';
import Card from '../ui/Card';
import PropTypes from 'prop-types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { useApp } from '../../context/AppContext';

const ChatBot = ({ documentId = null, className = '' }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chatbot');
  const [structuredData, setStructuredData] = useState(null);
  const messagesEndRef = useRef();
  const { addNotification } = useApp();

  const suggestedPrompts = [
    'Summarize key points',
    'Translate to Spanish?',
    'What are the main risks?',
    'Extract key data',
    'Find inconsistencies',
    'Generate report'
  ];

  const mockStructuredData = {
    documentType: 'Financial Report',
    keyMetrics: {
      'Net Profit Variance': '12%',
      'Revenue Growth': '8.5%',
      'Total Assets': '$2.4M',
      'Risk Score': '7.2/10'
    },
    flaggedItems: [
      {
        type: 'Inconsistency',
        location: 'Page 3, Section 2.1',
        description: 'Revenue figures don\'t match summary',
        severity: 'High'
      },
      {
        type: 'Missing Data',
        location: 'Page 5, Table 1',
        description: 'Q3 data incomplete',
        severity: 'Medium'
      }
    ],
    recommendations: [
      'Review revenue calculation methodology',
      'Verify Q3 data completeness',
      'Update financial controls'
    ]
  };

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: documentId 
            ? 'I\'m ready to help you analyze this document. What would you like to know?' 
            : 'Hello! Upload a document and I\'ll help you analyze it. You can ask me questions about content, extract key information, or generate summaries.',
          timestamp: new Date().toISOString(),
          documentRef: documentId
        }
      ]);

      // Set mock structured data if document is loaded
      if (documentId) {
        setStructuredData(mockStructuredData);
      }
    }
  }, [documentId, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Simulate AI response
      const response = await simulateAIResponse(userMessage.content);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.content,
        timestamp: new Date().toISOString(),
        documentRef: response.documentRef,
        suggestions: response.suggestions
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);

    } catch (error) {
      console.error('Chat error:', error);
      addNotification({
        type: 'error',
        message: 'Failed to get AI response'
      });
      setIsTyping(false);
    }
  };

  const simulateAIResponse = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('main risk')) {
      return {
        content: 'Based on \'Q4 we run\'t\' and the main risks are **12% net profit variance** 3 inconsidencies flagged, default rate "recognition. See page 3 and 5 |',
        documentRef: { pages: [3, 5] },
        suggestions: ['Show detailed breakdown', 'Compare with previous quarter']
      };
    }
    
    if (lowerMessage.includes('summarize') || lowerMessage.includes('summary')) {
      return {
        content: 'Here\'s a summary of the key findings:\n\n• **Revenue Growth**: 8.5% year-over-year\n• **Net Profit Variance**: 12% below projections\n• **Risk Assessment**: Medium-high (7.2/10)\n• **Action Items**: 3 critical issues identified\n\nThe document indicates strong revenue performance but profit margins are concerning.',
        suggestions: ['Get detailed breakdown', 'View recommendations']
      };
    }

    if (lowerMessage.includes('translate') || lowerMessage.includes('spanish')) {
      return {
        content: '**Resumen del Documento:**\n\nInforme Financiero Q4 2024\n• Crecimiento de ingresos: 8.5%\n• Varianza de beneficio neto: 12%\n• Evaluación de riesgo: Media-alta\n\n¿Te gustaría que traduzca alguna sección específica?',
        suggestions: ['Traducir sección completa', 'Ver métricas clave']
      };
    }

    // Default response
    return {
      content: `I understand you're asking about: "${message}"\n\nBased on the document analysis, I can help you with:\n• Content extraction and analysis\n• Risk assessment\n• Data validation\n• Summarization\n• Translation services\n\nCould you be more specific about what you'd like to know?`,
      suggestions: ['Ask about specific sections', 'Request data extraction', 'Get recommendations']
    };
  };

  const handleSuggestedPrompt = (prompt) => {
    setInputMessage(prompt);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('structured')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'structured'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={16} />
            Structured Data Output
          </div>
        </button>
        <button
          onClick={() => setActiveTab('chatbot')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'chatbot'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageSquare size={16} />
            Chatbot
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'structured' ? (
          <div className="p-4 h-full overflow-y-auto">
            {structuredData ? (
              <div className="space-y-6">
                {/* Document Type */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Document Type</h3>
                  <Badge variant="primary">{structuredData.documentType}</Badge>
                </div>

                {/* Key Metrics */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Key Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(structuredData.keyMetrics).map(([key, value]) => (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{key}</p>
                        <p className="text-lg font-semibold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flagged Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Flagged Items</h3>
                  <div className="space-y-3">
                    {structuredData.flaggedItems.map((item, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{item.type}</h4>
                          <Badge variant={item.severity.toLowerCase() === 'high' ? 'error' : 'warning'}>
                            {item.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                        <p className="text-xs text-gray-500">{item.location}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {structuredData.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No structured data available</p>
                  <p className="text-sm mt-1">Upload and analyze a document to see structured output</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  
                  <div className={`flex-1 max-w-[80%] ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    <div className={`inline-block p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.documentRef && (
                        <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                          <span className="inline-flex items-center gap-1 text-primary-600">
                            <FileText size={12} />
                            Link: page {message.documentRef.pages?.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestedPrompt(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bot size={16} className="text-gray-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length <= 1 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Prompts</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="text-xs"
                    >
                      <Sparkles size={12} className="mr-1" />
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question about this document..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-3"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChatBot;

ChatBot.propTypes = {
  documentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};