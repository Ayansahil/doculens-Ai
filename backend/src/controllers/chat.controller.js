import { supabase } from '../config/db.js';

export const sendChatMessage = async (req, res) => {
  try {
    const { message, documentId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const userMessage = {
      document_id: documentId || null,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    const { data: savedUserMessage, error: userError } = await supabase
      .from('chat_history')
      .insert([userMessage])
      .select()
      .single();

    if (userError) throw userError;

    const botResponse = generateMockResponse(message);

    const botMessage = {
      document_id: documentId || null,
      role: 'bot',
      content: botResponse.content,
      metadata: botResponse.metadata ? JSON.stringify(botResponse.metadata) : null,
      timestamp: new Date().toISOString()
    };

    const { data: savedBotMessage, error: botError } = await supabase
      .from('chat_history')
      .insert([botMessage])
      .select()
      .single();

    if (botError) throw botError;

    res.json({
      userMessage: savedUserMessage,
      botMessage: savedBotMessage,
      response: botResponse
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Failed to process chat message', error: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { documentId } = req.query;

    let query = supabase
      .from('chat_history')
      .select('*')
      .order('timestamp', { ascending: true });

    if (documentId) {
      query = query.eq('document_id', documentId);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      history: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      message: 'Failed to fetch chat history',
      error: error.message,
      history: [],
      count: 0
    });
  }
};

function generateMockResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('risk') || lowerMessage.includes('main risk')) {
    return {
      content: 'Based on the document analysis, the main risks identified are: **12% net profit variance**, 3 inconsistencies flagged, and revenue recognition concerns. See pages 3 and 5 for details.',
      metadata: {
        documentRef: { pages: [3, 5] },
        suggestions: ['Show detailed breakdown', 'Compare with previous quarter']
      }
    };
  }

  if (lowerMessage.includes('summarize') || lowerMessage.includes('summary')) {
    return {
      content: "Here's a summary of the key findings:\n\n• **Revenue Growth**: 8.5% year-over-year\n• **Net Profit Variance**: 12% below projections\n• **Risk Assessment**: Medium-high (7.2/10)\n• **Action Items**: 3 critical issues identified\n\nThe document indicates strong revenue performance but profit margins are concerning.",
      metadata: {
        suggestions: ['Get detailed breakdown', 'View recommendations']
      }
    };
  }

  if (lowerMessage.includes('translate') || lowerMessage.includes('spanish')) {
    return {
      content: '**Resumen del Documento:**\n\nInforme Financiero Q4 2024\n• Crecimiento de ingresos: 8.5%\n• Varianza de beneficio neto: 12%\n• Evaluación de riesgo: Media-alta\n\n¿Te gustaría que traduzca alguna sección específica?',
      metadata: {
        suggestions: ['Traducir sección completa', 'Ver métricas clave']
      }
    };
  }

  if (lowerMessage.includes('extract') || lowerMessage.includes('data')) {
    return {
      content: 'I can help extract structured data from your document. Here are the key data points I found:\n\n• Financial metrics\n• Important dates\n• Key parties involved\n• Contract terms\n• Risk factors\n\nWhat specific data would you like me to extract?',
      metadata: {
        suggestions: ['Extract all financial data', 'Extract dates and deadlines', 'Extract party information']
      }
    };
  }

  return {
    content: `I understand you're asking about: "${message}"\n\nBased on the document analysis, I can help you with:\n• Content extraction and analysis\n• Risk assessment\n• Data validation\n• Summarization\n• Translation services\n\nCould you be more specific about what you'd like to know?`,
    metadata: {
      suggestions: ['Ask about specific sections', 'Request data extraction', 'Get recommendations']
    }
  };
}
