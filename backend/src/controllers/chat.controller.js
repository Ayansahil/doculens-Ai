import fetch from "node-fetch";
import { supabase } from "../config/db.js";
import * as ragService from "../services/rag.service.js";

const HF_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// ✅ NOTE: OpenRouter URL is ALWAYS 'const' because it's a fixed endpoint.
// Using 'let' doesn't help with 429 errors.

export const sendChatMessage = async (req, res) => {
  try {
    console.log("📩 Request Body:", req.body);

    // Accept multiple variations of documentId (frontend sends 'documentId', DB needs 'document_id')
    const message = req.body.message;
    const documentId = req.body.documentId || req.body.document_id || req.body.documentID;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // 1️⃣ Save USER message
    const { data: userMsg, error: userError } = await supabase
      .from("chat_history")
      .insert({
        document_id: documentId || null,
        role: "user",
        content: message,
      })
      .select()
      .single();

    if (userError) throw userError;
    console.log("✅ User message saved");

    // 1.5 Retrieve Context (RAG)
    let context = "";
    if (documentId) {
      console.log(`🔍 RAG: Fetching context for doc ${documentId}`);
      const relevantChunks = await ragService.getRelevantChunks(documentId, message);
      context = relevantChunks.map(c => c.content).join("\n\n");
      console.log(`📄 RAG: Found ${relevantChunks.length} chunks`);
    }

    // 2️⃣ Call OpenRouter (with RAG context)
    const hfResponse = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Doculens AI",
      },
      body: JSON.stringify({
        model: process.env.HF_MODEL,
        messages: [
          {
            role: "system",
            content: "You MUST answer only from provided context. If no context is provided, answer generally but mention that no document was selected. If context is provided but doesn't contain the answer, say 'Not found in document'. Be concise.",
          },
          {
            role: "user",
            content: context
              ? `Context:\n${context}\n\nQuestion:\n${message}`
              : message,
          },
        ],
        temperature: 0.1,
        max_tokens: 1000, // Increased for longer answers
      }),
    });

    const raw = await hfResponse.text();
    console.log("📡 OpenRouter RAW:", raw.substring(0, 500));

    if (!hfResponse.ok) {
      let errorMessage = `OpenRouter API failed (${hfResponse.status})`;
      try {
        const errorData = JSON.parse(raw);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // Keep initial error message if JSON parse fails
      }
      throw new Error(errorMessage);
    }

    const hfData = JSON.parse(raw);

    let botText = "I couldn't generate a response.";

    if (hfData?.choices?.[0]?.message?.content) {
      botText = hfData.choices[0].message.content;
    } else if (hfData?.choices?.[0]?.finish_reason === "length") {
      botText = "The response was too long to be generated. Please try a more specific question.";
    } else if (hfData?.error) {
      botText = `❌ Error: ${hfData.error.message}`;
    }

    console.log("💬 Bot reply:", botText.substring(0, 100));

    // 3️⃣ Save BOT message
    const { data: botMsg, error: botError } = await supabase
      .from("chat_history")
      .insert({
        document_id: documentId || null,
        role: "bot",
        content: botText,
      })
      .select()
      .single();

    if (botError) throw botError;
    console.log("✅ Bot message saved");

    // 4️⃣ Send response
    res.json({
      success: true,
      userMessage: userMsg,
      botMessage: botMsg,
    });

  } catch (error) {
    console.error("💥 Chat Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to process message",
      error: error.message,
    });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { documentId } = req.query;

    let query = supabase
      .from("chat_history")
      .select("*")
      .order("timestamp", { ascending: true });

    if (documentId) {
      query = query.eq("document_id", documentId);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      history: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch history",
      history: [],
      count: 0,
    });
  }
};
