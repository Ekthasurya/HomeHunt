import api from "./axios";

// SEND MESSAGE
export const sendMessage = async (conversationId, text) => {
  const response = await api.post(
    `/conversations/${conversationId}/messages`,
    { text }
  );

  return response.data;
};

// MARK MESSAGES AS READ
export const markMessagesAsRead = async (conversationId) => {
  const response = await api.patch(
    `/conversations/${conversationId}/read`
  );

  return response.data;
};