import api from "./axios";

// CREATE OR GET CONVERSATION
export const createConversation = async (data) => {
  const response = await api.post("/conversations", data);
  return response.data;
};

// GET ALL CONVERSATIONS
export const getConversations = async () => {
  const response = await api.get("/conversations");
  return response.data;
};

// GET CONVERSATION MESSAGES
export const getConversationMessages = async (conversationId) => {
  const response = await api.get(
    `/conversations/${conversationId}/messages`
  );

  return response.data;
};