import fetch from "node-fetch";
import { supabase } from "../config/db.js";

const EMBEDDINGS_URL = "https://openrouter.ai/api/v1/embeddings";

/**
 * Generate embeddings for a given text using OpenRouter
 */
export const generateEmbedding = async (text) => {
  try {
    const response = await fetch(EMBEDDINGS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.EMBEDDING_MODEL || "arcee-ai/trinity-mini:free",
        input: text.replace(/\n+/g, " "),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Embedding API failed: ${errorText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
};

/**
 * Split text into chunks of 500-1000 characters
 */
export const chunkText = (text, minSize = 500, maxSize = 1000) => {
  const chunks = [];
  let currentPos = 0;

  while (currentPos < text.length) {
    let endPos = currentPos + maxSize;
    
    // If not at the end, try to find a sentence break or space
    if (endPos < text.length) {
      // Look for last period, exclamation, or question mark within the range
      const searchRange = text.substring(currentPos + minSize, endPos);
      const lastSentenceBreak = Math.max(
        searchRange.lastIndexOf(". "),
        searchRange.lastIndexOf("! "),
        searchRange.lastIndexOf("? ")
      );

      if (lastSentenceBreak !== -1) {
        endPos = currentPos + minSize + lastSentenceBreak + 1;
      } else {
        // Fallback to last space
        const lastSpace = searchRange.lastIndexOf(" ");
        if (lastSpace !== -1) {
          endPos = currentPos + minSize + lastSpace;
        }
      }
    }

    chunks.push(text.substring(currentPos, endPos).trim());
    currentPos = endPos;
  }

  return chunks.filter(c => c.length > 0);
};

/**
 * Chunk text, generate embeddings, and store in database
 */
export const chunkAndStore = async (documentId, text) => {
  try {
    console.log(`📦 Chunking and storing document: ${documentId}`);
    const chunks = chunkText(text);
    console.log(`📄 Created ${chunks.length} chunks`);

    for (const content of chunks) {
      const embedding = await generateEmbedding(content);
      
      const { error } = await supabase
        .from("document_chunks")
        .insert({
          document_id: documentId,
          content,
          embedding
        });

      if (error) {
        console.error("Error storing chunk:", error);
        throw error;
      }
    }
    
    console.log("✅ All chunks and embeddings stored successfully");
  } catch (error) {
    console.error("Fatal error in chunkAndStore:", error);
    throw error;
  }
};

/**
 * Retrieve relevant chunks using semantic search
 */
export const getRelevantChunks = async (documentId, query, topK = 3) => {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc("match_document_chunks", {
      query_embedding: queryEmbedding,
      match_threshold: 0.1, // Adjust as needed
      match_count: topK,
      filter_document_id: documentId,
    });

    if (error) {
      console.error("Error in vector search:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error retrieving relevant chunks:", error);
    return [];
  }
};
