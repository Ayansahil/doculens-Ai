import fetch from "node-fetch";
import { supabase } from "../config/db.js";

const HF_API_URL = "https://router.huggingface.co/hf-inference/v1/chat/completions";

export const sendChatMessage = async (req, res) => {
  try {
    console.log("📩 Request:", req.body);

    const { message, documentId } = req.body;

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

    // 2️⃣ Call Hugging Face (CORRECT WAY)
    const hfResponse = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.HF_MODEL, // 👈 MODEL ID HERE
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    const raw = await hfResponse.text();
    console.log("📡 HF RAW:", raw.substring(0, 200));

    if (!hfResponse.ok) {
      throw new Error("Hugging Face API failed");
    }

    const hfData = JSON.parse(raw);

    const botText =
      hfData?.choices?.[0]?.message?.content ||
      "I couldn't generate a response.";

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
