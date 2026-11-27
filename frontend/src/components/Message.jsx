
import { Check, CheckCheck } from "lucide-react";

function Message({ message, currentUserId }) {
  const senderId =
    typeof message.sender === "object"
      ? message.sender?._id
      : message.sender;

  const isMine = senderId?.toString() === currentUserId?.toString();

  const messageTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
          isMine
            ? "rounded-br-sm bg-[#006A4E] text-white"
            : "rounded-bl-sm border border-gray-100 bg-white text-gray-800"
        }`}
      >
        <p className="break-words whitespace-pre-wrap text-sm">
          {message.text}
        </p>

        <div
          className={`mt-2 flex items-center justify-end gap-1 text-[10px] ${
            isMine ? "text-green-100" : "text-gray-400"
          }`}
        >
          <span>{messageTime}</span>

          {isMine && (
            message.isRead ? (
              <CheckCheck size={14} className="text-blue-200" />
            ) : (
              <Check size={14} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;
