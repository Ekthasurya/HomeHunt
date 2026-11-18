
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  MessageCircle,
  CheckCheck,
} from "lucide-react";

const initialChats = [
  {
    id: 1,
    name: "Rahul Sharma",
    role: "Property Agent",
    property: "Luxury Modern Apartment",
    avatar: "https://i.pravatar.cc/100?img=12",
    online: true,
    messages: [
      {
        id: 1,
        text: "Hello! Are you interested in the apartment?",
        sender: "other",
        time: "10:30 AM",
      },
      {
        id: 2,
        text: "Yes, I would like to know more about it.",
        sender: "me",
        time: "10:32 AM",
      },
      {
        id: 3,
        text: "Sure! It has 3 bedrooms and 2 bathrooms.",
        sender: "other",
        time: "10:35 AM",
      },
    ],
  },
  {
    id: 2,
    name: "Priya Das",
    role: "Property Agent",
    property: "Beautiful Family Villa",
    avatar: "https://i.pravatar.cc/100?img=47",
    online: false,
    messages: [
      {
        id: 1,
        text: "The villa is available for a visit this weekend.",
        sender: "other",
        time: "Yesterday",
      },
    ],
  },
  {
    id: 3,
    name: "Amit Roy",
    role: "Property Agent",
    property: "Premium City Apartment",
    avatar: "https://i.pravatar.cc/100?img=14",
    online: true,
    messages: [
      {
        id: 1,
        text: "Thank you for contacting me.",
        sender: "other",
        time: "Yesterday",
      },
    ],
  },
];

export default function Chat() {
  const [chats, setChats] = useState(initialChats);
  const [activeChatId, setActiveChatId] = useState(1);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const filteredChats = useMemo(
    () =>
      chats.filter((chat) =>
        chat.name.toLowerCase().includes(search.toLowerCase())
      ),
    [chats, search]
  );

  const sendMessage = (e) => {
    e.preventDefault();

    if (!message.trim() || !activeChat) return;

    const newMessage = {
      id: Date.now(),
      text: message.trim(),
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChats((previous) =>
      previous.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    );

    setMessage("");
  };

  const openChat = (id) => {
    setActiveChatId(id);
    setShowMobileChat(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link to="/" className="text-sm text-gray-500 hover:text-blue-600">
            Home / Chat
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-1 text-gray-500">
            Communicate with property agents.
          </p>
        </div>

        <div className="grid h-[700px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:grid-cols-[320px_1fr]">
          {/* Conversation List */}
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
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredChats.map((chat) => {
                const lastMessage = chat.messages[chat.messages.length - 1];

                return (
                  <button
                    key={chat.id}
                    onClick={() => openChat(chat.id)}
                    className={`flex w-full items-center gap-3 border-b border-gray-50 p-4 text-left transition hover:bg-gray-50 ${
                      activeChatId === chat.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      {chat.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <p className="truncate font-semibold text-gray-900">
                          {chat.name}
                        </p>
                        <span className="shrink-0 text-xs text-gray-400">
                          {lastMessage?.time}
                        </span>
                      </div>
                      <p className="truncate text-xs text-blue-600">
                        {chat.property}
                      </p>
                      <p className="mt-1 truncate text-sm text-gray-500">
                        {lastMessage?.text}
                      </p>
                    </div>
                  </button>
                );
              })}

              {filteredChats.length === 0 && (
                <p className="p-6 text-center text-sm text-gray-500">
                  No conversations found.
                </p>
              )}
            </div>
          </aside>

          {/* Chat Window */}
          <section
            className={`${
              showMobileChat ? "flex" : "hidden md:flex"
            } min-w-0 flex-col`}
          >
            {activeChat ? (
              <>
                {/* Chat Header */}
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
                      src={activeChat.avatar}
                      alt={activeChat.name}
                      className="h-11 w-11 rounded-full object-cover"
                    />

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-gray-900">
                        {activeChat.name}
                      </h3>
                      <p className="text-xs text-green-600">
                        {activeChat.online ? "Online" : "Offline"} ·{" "}
                        {activeChat.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-500">
                    <button aria-label="Call agent">
                      <Phone size={19} />
                    </button>
                    <button aria-label="Video call">
                      <Video size={20} />
                    </button>
                    <button aria-label="More options">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>

                {/* Property Reference */}
                <div className="border-b border-gray-100 bg-blue-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Regarding property</p>
                  <p className="text-sm font-semibold text-blue-700">
                    {activeChat.property}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-5 overflow-y-auto bg-gray-50/70 p-4 sm:p-6">
                  <div className="text-center">
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-gray-400 shadow-sm">
                      Today
                    </span>
                  </div>

                  {activeChat.messages.map((item) => (
                    <div
                      key={item.id}
                      className={`flex ${
                        item.sender === "me"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
                          item.sender === "me"
                            ? "rounded-br-sm bg-blue-600 text-white"
                            : "rounded-bl-sm border border-gray-100 bg-white text-gray-800"
                        }`}
                      >
                        <p className="break-words text-sm">{item.text}</p>
                        <div
                          className={`mt-2 flex items-center justify-end gap-1 text-[10px] ${
                            item.sender === "me"
                              ? "text-blue-100"
                              : "text-gray-400"
                          }`}
                        >
                          {item.time}
                          {item.sender === "me" && (
                            <CheckCheck size={13} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form
                  onSubmit={sendMessage}
                  className="flex items-center gap-2 border-t border-gray-100 bg-white p-3 sm:p-4"
                >
                  <button
                    type="button"
                    aria-label="Attach file"
                    className="hidden text-gray-400 hover:text-blue-600 sm:block"
                  >
                    <Paperclip size={21} />
                  </button>

                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="min-w-0 flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="rounded-xl bg-blue-600 p-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send size={19} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <MessageCircle size={48} className="mb-4 text-gray-300" />
                <h3 className="font-semibold text-gray-800">
                  Select a conversation
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose an agent to start chatting.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
