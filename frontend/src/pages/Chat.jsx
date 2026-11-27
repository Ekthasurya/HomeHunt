
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Search,
  Send,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

import socket from "../services/socket";

import {
  getConversations,
  getConversationMessages,
} from "../services/api/conversationApi";

import {
  sendMessage as sendMessageApi,
  markMessagesAsRead,
} from "../services/api/messageApi";

import Message from "../components/Message";

function Chat() {
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id;

  const [searchParams] = useSearchParams();
  const requestedConversationId = searchParams.get("conversationId");

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  // ACTIVE CONVERSATION
  const activeConversation = conversations.find(
    (conversation) =>
      conversation._id?.toString() === activeConversationId?.toString()
  );

  // GET OTHER PARTICIPANT
  const getOtherParticipant = (conversation) => {
    return conversation?.participants?.find(
      (participant) =>
        participant._id?.toString() !== currentUserId?.toString()
    );
  };

  // FETCH CONVERSATIONS
  useEffect(() => {
    let isMounted = true;

    const fetchConversations = async () => {
      try {
        setLoadingConversations(true);
        setError("");

        const response = await getConversations();

        if (!isMounted) return;

        const data = response.conversations || [];

        setConversations(data);

        if (data.length > 0) {
          const requestedConversation = data.find(
            (conversation) =>
              conversation._id?.toString() ===
              requestedConversationId
          );

          const selectedConversation =
            requestedConversation || data[0];

          setActiveConversationId(selectedConversation._id);
          setShowMobileChat(Boolean(requestedConversationId));
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      } catch (err) {
        if (!isMounted) return;

        console.error("Fetch Conversations Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load conversations."
        );
      } finally {
        if (isMounted) {
          setLoadingConversations(false);
        }
      }
    };

    fetchConversations();

    return () => {
      isMounted = false;
    };
  }, [requestedConversationId]);

  // FILTER CONVERSATIONS
  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const participant = getOtherParticipant(conversation);

      const name = participant?.name || "";
      const propertyName = conversation.property?.title || "";

      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        propertyName.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [conversations, search, currentUserId]);

  // FETCH MESSAGES AND JOIN SOCKET ROOM
  useEffect(() => {
    if (!activeConversationId || !currentUserId) return;

    let isMounted = true;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        setError("");
        setMessages([]);

        socket.emit("join_conversation", activeConversationId);

        const response = await getConversationMessages(
          activeConversationId
        );

        if (!isMounted) return;

        setMessages(response.messages || []);

        // MARK RECEIVED MESSAGES AS READ
        await markMessagesAsRead(activeConversationId);
      } catch (err) {
        if (!isMounted) return;

        console.error("Load Messages Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load messages."
        );
      } finally {
        if (isMounted) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    // REAL-TIME MESSAGE LISTENER
    const handleNewMessage = (newMessage) => {
      const conversationId =
        typeof newMessage.conversation === "object"
          ? newMessage.conversation?._id
          : newMessage.conversation;

      if (
        conversationId?.toString() !==
        activeConversationId?.toString()
      ) {
        return;
      }

      setMessages((previous) => {
        const alreadyExists = previous.some(
          (item) => item._id === newMessage._id
        );

        if (alreadyExists) return previous;

        return [...previous, newMessage];
      });

      const senderId =
        typeof newMessage.sender === "object"
          ? newMessage.sender?._id
          : newMessage.sender;

      if (senderId?.toString() !== currentUserId?.toString()) {
        markMessagesAsRead(activeConversationId).catch(() => {});
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      isMounted = false;

      socket.off("new_message", handleNewMessage);
      socket.emit("leave_conversation", activeConversationId);
    };
  }, [activeConversationId, currentUserId]);

  // UPDATE CONVERSATION LIST WHEN A MESSAGE ARRIVES
  useEffect(() => {
    const handleConversationMessage = (newMessage) => {
      const conversationId =
        typeof newMessage.conversation === "object"
          ? newMessage.conversation?._id
          : newMessage.conversation;

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation._id?.toString() === conversationId?.toString()
            ? {
                ...conversation,
                lastMessage: newMessage,
                lastMessageAt: newMessage.createdAt,
              }
            : conversation
        )
      );
    };

    socket.on("new_message", handleConversationMessage);

    return () => {
      socket.off("new_message", handleConversationMessage);
    };
  }, []);

  // SEND MESSAGE
  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (
      !trimmedMessage ||
      !activeConversationId ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await sendMessageApi(
        activeConversationId,
        trimmedMessage
      );

      const newMessage = response.data;

      setMessages((previous) => {
        const alreadyExists = previous.some(
          (item) => item._id === newMessage._id
        );

        if (alreadyExists) return previous;

        return [...previous, newMessage];
      });

      setMessage("");

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation._id?.toString() ===
          activeConversationId?.toString()
            ? {
                ...conversation,
                lastMessage: newMessage,
                lastMessageAt: newMessage.createdAt,
              }
            : conversation
        )
      );
    } catch (err) {
      console.error("Send Message Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  // OPEN CONVERSATION
  const openConversation = (conversationId) => {
    setActiveConversationId(conversationId);
    setShowMobileChat(true);
    setError("");
  };

  // LAST MESSAGE PREVIEW
  const getLastMessageText = (conversation) => {
    const lastMessage = conversation.lastMessage;

    if (!lastMessage) return "Start a conversation";

    if (typeof lastMessage === "string") {
      return "Message";
    }

    return lastMessage.text || "Message";
  };

  // LAST MESSAGE TIME
  const getConversationTime = (conversation) => {
    const date = conversation.lastMessageAt;

    if (!date) return "";

    return new Date(date).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-[#006A4E]"
          >
            Home / Chat
          </Link>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Messages
          </h1>

          <p className="mt-1 text-gray-500">
            Communicate with property buyers and agents.
          </p>
        </div>

        {/* CHAT LAYOUT */}
        <div className="grid h-[700px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:grid-cols-[320px_1fr]">

          {/* CONVERSATION LIST */}
          <aside
            className={`${
              showMobileChat ? "hidden md:flex" : "flex"
            } flex-col border-r border-gray-100`}
          >
            <div className="border-b border-gray-100 p-4">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Conversations
              </h2>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#006A4E]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="flex justify-center p-8">
                  <Loader2
                    size={24}
                    className="animate-spin text-[#006A4E]"
                  />
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const participant = getOtherParticipant(conversation);

                  const isActive =
                    activeConversationId?.toString() ===
                    conversation._id?.toString();

                  return (
                    <button
                      key={conversation._id}
                      onClick={() =>
                        openConversation(conversation._id)
                      }
                      className={`flex w-full items-center gap-3 border-b border-gray-50 p-4 text-left transition hover:bg-gray-50 ${
                        isActive ? "bg-green-50" : ""
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={
                            participant?.avatar ||
                            "https://i.pravatar.cc/100?img=12"
                          }
                          alt={participant?.name || "User"}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2">
                          <p className="truncate font-semibold text-gray-900">
                            {participant?.name || "User"}
                          </p>

                          <span className="shrink-0 text-xs text-gray-400">
                            {getConversationTime(conversation)}
                          </span>
                        </div>

                        <p className="truncate text-xs text-[#006A4E]">
                          {conversation.property?.title ||
                            "Property conversation"}
                        </p>

                        <p className="mt-1 truncate text-sm text-gray-500">
                          {getLastMessageText(conversation)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}

              {!loadingConversations &&
                filteredConversations.length === 0 && (
                  <p className="p-6 text-center text-sm text-gray-500">
                    No conversations found.
                  </p>
                )}
            </div>
          </aside>

          {/* CHAT WINDOW */}
          <section
            className={`${
              showMobileChat ? "flex" : "hidden md:flex"
            } min-w-0 flex-col`}
          >
            {activeConversation ? (
              <>
                {/* CHAT HEADER */}
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="text-gray-500 md:hidden"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft size={21} />
                    </button>

                    <img
                      src={
                        getOtherParticipant(activeConversation)?.avatar ||
                        "https://i.pravatar.cc/100?img=12"
                      }
                      alt={
                        getOtherParticipant(activeConversation)?.name ||
                        "User"
                      }
                      className="h-11 w-11 rounded-full object-cover"
                    />

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-gray-900">
                        {getOtherParticipant(activeConversation)?.name ||
                          "User"}
                      </h3>

                      <p className="text-xs text-gray-500">
                        {getOtherParticipant(activeConversation)?.role ||
                          "Participant"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-400">
                    <button
                      type="button"
                      aria-label="Call"
                      className="cursor-not-allowed"
                      title="Calling is not available"
                    >
                      <Phone size={19} />
                    </button>

                    <button
                      type="button"
                      aria-label="Video call"
                      className="cursor-not-allowed"
                      title="Video calling is not available"
                    >
                      <Video size={20} />
                    </button>

                    <button
                      type="button"
                      aria-label="More options"
                    >
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>

                {/* PROPERTY REFERENCE */}
                {activeConversation.property && (
                  <div className="border-b border-gray-100 bg-green-50 px-4 py-3">
                    <p className="text-xs text-gray-500">
                      Regarding property
                    </p>

                    <p className="text-sm font-semibold text-[#006A4E]">
                      {activeConversation.property.title}
                    </p>
                  </div>
                )}

                {/* ERROR */}
                {error && (
                  <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle size={17} />
                    {error}
                  </div>
                )}

                {/* MESSAGES */}
                <div className="flex-1 space-y-5 overflow-y-auto bg-gray-50/70 p-4 sm:p-6">
                  {loadingMessages ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2
                        size={28}
                        className="animate-spin text-[#006A4E]"
                      />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <MessageCircle
                        size={42}
                        className="mb-3 text-gray-300"
                      />

                      <p className="font-medium text-gray-700">
                        No messages yet
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Start the conversation.
                      </p>
                    </div>
                  ) : (
                    messages.map((item) => (
                      <Message
                        key={item._id}
                        message={item}
                        currentUserId={currentUserId}
                      />
                    ))
                  )}
                </div>

                {/* MESSAGE INPUT */}
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2 border-t border-gray-100 bg-white p-3 sm:p-4"
                >
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    maxLength={2000}
                    disabled={loadingMessages || sending}
                    className="min-w-0 flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-100"
                  />

                  <button
                    type="submit"
                    disabled={
                      !message.trim() ||
                      sending ||
                      loadingMessages
                    }
                    className="rounded-xl bg-[#006A4E] p-3 text-white transition hover:bg-[#00563f] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send message"
                  >
                    {sending ? (
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />
                    ) : (
                      <Send size={19} />
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <MessageCircle
                  size={48}
                  className="mb-4 text-gray-300"
                />

                <h3 className="font-semibold text-gray-800">
                  Select a conversation
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Choose a conversation to start chatting.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Chat;
