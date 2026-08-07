import { useState } from "react";
import { Bot, Send, Sparkles, MessageSquare, ShieldCheck, ArrowRight, Table } from "lucide-react";

export default function AiOfficerAssistant() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Greetings Officer. I am your Municipal AI Assistant. Ask me natural questions about ticket backlogs, high-priority issues, SLA breaches, or ward statistics.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.result.answer,
            table: data.result.table,
            stats: data.result.stats,
            action: data.result.action,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: "ai", text: "Unable to process query currently." }]);
    } finally {
      setLoading(false);
    }
  };

  const presetQueries = [
    "Show all high priority complaints",
    "Which department has highest backlog?",
    "List complaints near SLA breach",
    "How many complaints resolved this month?",
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 flex flex-col h-[480px]">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">AI Municipal Officer Assistant</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Natural Language Intelligence</span>
          </div>
        </div>
        <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full">
          AI Online
        </span>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`p-3 rounded-2xl max-w-[85%] font-medium leading-relaxed shadow-2xs ${
                m.sender === "user"
                  ? "bg-blue-900 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
              }`}
            >
              {m.text}

              {/* Table Data if returned */}
              {m.table && (
                <div className="mt-2 overflow-x-auto border-t border-slate-200 pt-2">
                  <table className="w-full text-[10px] text-left">
                    <thead>
                      <tr className="border-b border-slate-300 text-slate-600 font-bold">
                        <th className="py-1 px-1">Ref</th>
                        <th className="py-1 px-1">Category</th>
                        <th className="py-1 px-1">Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.table.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-slate-200">
                          <td className="py-1 px-1 font-bold">{row.Ref}</td>
                          <td className="py-1 px-1">{row.Category}</td>
                          <td className="py-1 px-1">{row.Dept}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-[11px] text-slate-400 font-bold italic animate-pulse">
            Analyzing municipal database query...
          </div>
        )}
      </div>

      {/* Preset Suggestion Chips */}
      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
        {presetQueries.map((pq) => (
          <button
            key={pq}
            onClick={() => handleSend(pq)}
            className="text-[10px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg transition"
          >
            💡 {pq}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask AI Assistant about complaints, SLA, backlog..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading}
          className="p-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold transition shrink-0"
        >
          <Send className="w-4 h-4 text-amber-300" />
        </button>
      </div>
    </div>
  );
}
