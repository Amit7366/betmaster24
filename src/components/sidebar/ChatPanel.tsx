import { useState } from "react";
import { Send } from "lucide-react";

const messages = [
  {
    id: 1,
    username: "@abirdesigns",
    role: null,
    time: "18 sec",
    message: "Hey everyone.. Casino offers hot today. Don’t miss it guys 🔥",
  },
  {
    id: 2,
    username: "@abirdesigns",
    role: "MODER",
    time: "18 sec",
    message: "Just hit a 600x on Sweet Bonanza… This game is crazy!",
  },
  {
    id: 3,
    username: "@abirdesigns",
    role: null,
    time: "18 sec",
    message:
      "Hi, Player! The minimum deposit for the bonus is $20. Let me know if you need help claiming it! 💸🤑",
  },
  {
    id: 4,
    username: "@abirdesigns",
    role: null,
    time: "18 sec",
    message: "Best of luck everyone…✨🙏",
  },
  {
    id: 5,
    username: "@abirdesigns",
    role: "ADMIN",
    time: "18 sec",
    message: "@Jhon Are you here brother?",
  },
];

export default function ChatPanel() {
  const [chat, setChat] = useState("");

  return (
    <div className="w-full bg-[#1E1E1E] text-white p-4 rounded-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
        <div className="flex items-center gap-2">
          <div className="bg-[#2F2F2F] px-2 py-1 rounded-full text-xs">Chat</div>
          <div className="bg-green-600 text-black text-xs px-2 py-1 rounded-full">210</div>
        </div>
        <div className="text-xs text-gray-400">EN/🌍</div>
      </div>

      <div className="h-[77vh] overflow-y-auto pr-2 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm bg-[#2F2F2F] p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-blue-400 font-semibold">{msg.username}</span>
              {msg.role && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    msg.role === "MODER"
                      ? "bg-blue-500 text-white"
                      : "bg-green-500 text-black"
                  }`}
                >
                  {msg.role}
                </span>
              )}
              <span className="text-gray-400 text-xs ml-auto">{msg.time}</span>
            </div>
            <p>{msg.message}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          className="flex-1 bg-[#2F2F2F] border-none text-white text-sm placeholder:text-gray-500 px-3 py-2 rounded-lg focus:outline-none"
          placeholder="Write your message…"
          value={chat}
          onChange={(e) => setChat(e.target.value)}
        />
        <button className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-lg">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
