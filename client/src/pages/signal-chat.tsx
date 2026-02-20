import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, Hash, Users, ChevronLeft, LogIn, UserPlus,
  Eye, EyeOff, Shield, ArrowLeft, Radio, Circle, Reply, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface ChatUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarColor: string;
  role: string;
  trustLayerId: string;
}

interface ChatChannel {
  id: string;
  name: string;
  description: string;
  category: string;
  isDefault: boolean;
}

interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  avatarColor: string;
  role: string;
  content: string;
  replyToId: string | null;
  createdAt: string;
}

interface Presence {
  onlineCount: number;
  channelUsers: Record<string, string[]>;
}

const TOKEN_KEY = "tl-sso-token";
const USER_KEY = "tl-sso-user";

function getStoredAuth(): { token: string; user: ChatUser } | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    if (token && userJson) return { token, user: JSON.parse(userJson) };
  } catch {}
  return null;
}

function storeAuth(token: string, user: ChatUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function UserAvatar({ username, color, size = "sm" }: { username: string; color: string; size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={cn("rounded-full flex items-center justify-center font-bold text-white shrink-0", s)} style={{ backgroundColor: color }} data-testid={`avatar-${username}`}>
      {username.slice(0, 2).toUpperCase()}
    </div>
  );
}

function AuthScreen({ onAuth }: { onAuth: (token: string, user: ChatUser) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/chat/auth/login" : "/api/chat/auth/register";
      const body = mode === "login"
        ? { username, password }
        : { username, email, password, displayName };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Authentication failed");
        return;
      }

      storeAuth(data.token, data.user);
      onAuth(data.token, data.user);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex items-center gap-2">
          <Link href="/explore">
            <Button variant="ghost" size="icon" className="text-white/60" data-testid="button-back-explore">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <Radio className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Signal Chat</h1>
          <p className="text-white/50 text-sm mt-1">DarkWave Trust Layer Ecosystem</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex gap-2 mb-6">
            <Button
              variant="ghost"
              className={cn("flex-1", mode === "login" ? "bg-emerald-500/20 text-emerald-400" : "text-white/50")}
              onClick={() => { setMode("login"); setError(""); }}
              data-testid="button-login-tab"
            >
              <LogIn className="w-4 h-4 mr-2" /> Sign In
            </Button>
            <Button
              variant="ghost"
              className={cn("flex-1", mode === "register" ? "bg-emerald-500/20 text-emerald-400" : "text-white/50")}
              onClick={() => { setMode("register"); setError(""); }}
              data-testid="button-register-tab"
            >
              <UserPlus className="w-4 h-4 mr-2" /> Register
            </Button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-400 text-sm" data-testid="text-auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                data-testid="input-chat-username"
              />
            </div>

            {mode === "register" && (
              <>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    data-testid="input-chat-email"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Display Name</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    data-testid="input-chat-display-name"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs text-white/40 mb-1 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "Min 8 chars, 1 capital, 1 special" : "Enter password"}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pr-10"
                  data-testid="input-chat-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-500 text-white"
              disabled={loading}
              data-testid="button-auth-submit"
            >
              {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-2 text-xs text-white/30 justify-center">
            <Shield className="w-3.5 h-3.5" />
            <span>Cross-app SSO powered by Trust Layer</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MessageBubble({ msg, currentUserId, onReply }: { msg: ChatMessage; currentUserId: string; onReply: (msg: ChatMessage) => void }) {
  const isOwn = msg.userId === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("group flex gap-2.5 px-4 py-1 hover:bg-white/[0.02]", isOwn && "flex-row-reverse")}
      data-testid={`message-${msg.id}`}
    >
      <UserAvatar username={msg.username} color={msg.avatarColor} />
      <div className={cn("max-w-[70%]", isOwn && "text-right")}>
        <div className={cn("flex items-center gap-2 mb-0.5", isOwn && "flex-row-reverse")}>
          <span className="text-xs font-semibold text-white/80">{msg.username}</span>
          {msg.role === "bot" && <Badge variant="outline" className="text-[10px] py-0 px-1 border-emerald-500/30 text-emerald-400">BOT</Badge>}
          <span className="text-[10px] text-white/30">{formatTime(msg.createdAt)}</span>
          <button onClick={() => onReply(msg)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/60 transition-opacity" data-testid={`button-reply-${msg.id}`}>
            <Reply className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className={cn(
          "inline-block rounded-xl px-3 py-2 text-sm",
          isOwn
            ? "bg-emerald-500/20 text-emerald-100 rounded-tr-sm"
            : "bg-white/5 text-white/80 rounded-tl-sm"
        )}>
          {msg.content}
        </div>
      </div>
    </motion.div>
  );
}

export default function SignalChatPage() {
  const [user, setUser] = useState<ChatUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [presence, setPresence] = useState<Presence>({ onlineCount: 0, channelUsers: {} });
  const [showSidebar, setShowSidebar] = useState(true);
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef<number>(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
      fetch("/api/chat/auth/me", {
        headers: { Authorization: `Bearer ${stored.token}` },
      }).then(res => {
        if (res.ok) {
          setUser(stored.user);
          setToken(stored.token);
        } else {
          clearAuth();
        }
      }).catch(() => clearAuth());
    }
  }, []);

  useEffect(() => {
    fetch("/api/chat/channels")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.channels) {
          setChannels(data.channels);
          const defaultChannel = data.channels.find((c: ChatChannel) => c.isDefault) || data.channels[0];
          if (defaultChannel && !activeChannel) setActiveChannel(defaultChannel);
        }
      }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!token || !activeChannel) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/chat`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "join", token, channelId: activeChannel.id }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "history":
          setMessages(data.messages);
          break;
        case "message":
          setMessages(prev => [...prev, data]);
          break;
        case "typing":
          if (data.userId !== user?.id) {
            setTypingUsers(prev => {
              if (prev.includes(data.username)) return prev;
              return [...prev, data.username];
            });
            setTimeout(() => {
              setTypingUsers(prev => prev.filter(u => u !== data.username));
            }, 3000);
          }
          break;
        case "presence":
          setPresence(data);
          break;
        case "user_joined":
        case "user_left":
          break;
        case "error":
          console.error("Chat error:", data.message);
          break;
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [token, activeChannel?.id]);

  function switchChannel(channel: ChatChannel) {
    if (channel.id === activeChannel?.id) return;
    setActiveChannel(channel);
    setMessages([]);
    setReplyTo(null);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "switch_channel", channelId: channel.id }));
    }
    if (window.innerWidth < 768) setShowSidebar(false);
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const content = inputValue.trim();
    if (!content || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({
      type: "message",
      content,
      replyToId: replyTo?.id || undefined,
    }));
    setInputValue("");
    setReplyTo(null);
  }

  function handleTyping() {
    const now = Date.now();
    if (now - lastTypingSentRef.current > 2000 && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "typing" }));
      lastTypingSentRef.current = now;
    }
  }

  function handleAuth(t: string, u: ChatUser) {
    setToken(t);
    setUser(u);
  }

  function handleLogout() {
    clearAuth();
    setUser(null);
    setToken(null);
    wsRef.current?.close();
  }

  if (!user || !token) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  const groupedChannels = channels.reduce<Record<string, ChatChannel[]>>((acc, ch) => {
    const cat = ch.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ch);
    return acc;
  }, {});

  let lastDate = "";

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex" data-testid="signal-chat-container">
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-64 md:w-72 bg-black/30 backdrop-blur-xl border-r border-white/5 flex flex-col h-full absolute md:relative z-20"
          >
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Link href="/explore">
                  <Button variant="ghost" size="icon" className="text-white/40" data-testid="button-back">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-white text-sm">Signal Chat</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" />
                <span>{presence.onlineCount} online</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {Object.entries(groupedChannels).map(([category, chs]) => (
                <div key={category}>
                  <div className="text-[10px] uppercase tracking-wider text-white/30 font-semibold px-2 mb-1">
                    {category.replace("-", " ")}
                  </div>
                  {chs.map(ch => (
                    <button
                      key={ch.id}
                      onClick={() => switchChannel(ch)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors text-left",
                        activeChannel?.id === ch.id
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "text-white/50 hover:bg-white/5 hover:text-white/70"
                      )}
                      data-testid={`channel-${ch.name}`}
                    >
                      <Hash className="w-4 h-4 shrink-0 opacity-50" />
                      <span className="truncate">{ch.name}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <UserAvatar username={user.username} color={user.avatarColor} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{user.displayName}</div>
                  <div className="text-[10px] text-white/30 truncate">{user.trustLayerId}</div>
                </div>
                <button onClick={handleLogout} className="text-white/30 hover:text-red-400 text-xs" data-testid="button-logout">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col h-full min-w-0">
        <header className="h-14 border-b border-white/5 bg-black/20 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden text-white/50 hover:text-white"
            data-testid="button-toggle-sidebar"
          >
            {showSidebar ? <ChevronLeft className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          </button>

          {activeChannel && (
            <>
              <Hash className="w-5 h-5 text-emerald-400" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">{activeChannel.name}</div>
                <div className="text-[10px] text-white/30 truncate">{activeChannel.description}</div>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Users className="w-4 h-4" />
                <span>{(presence.channelUsers[activeChannel.id] || []).length}</span>
              </div>
              <div className={cn("w-2 h-2 rounded-full", connected ? "bg-emerald-400" : "bg-red-400")} />
            </>
          )}
        </header>

        <div className="flex-1 overflow-y-auto py-4 space-y-1" data-testid="messages-container">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-white/20">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs">Be the first to say something!</p>
            </div>
          )}

          {messages.map((msg) => {
            const msgDate = formatDate(msg.createdAt);
            let showDate = false;
            if (msgDate !== lastDate) {
              showDate = true;
              lastDate = msgDate;
            }
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[10px] text-white/30 font-medium">{msgDate}</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                )}
                <MessageBubble msg={msg} currentUserId={user.id} onReply={setReplyTo} />
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {typingUsers.length > 0 && (
          <div className="px-4 py-1 text-xs text-white/30">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        )}

        {replyTo && (
          <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex items-center gap-2">
            <Reply className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-emerald-400 font-semibold">{replyTo.username}</span>
              <p className="text-xs text-white/40 truncate">{replyTo.content}</p>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-white/30 hover:text-white" data-testid="button-cancel-reply">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={sendMessage} className="p-3 border-t border-white/5 bg-black/20 backdrop-blur-sm" data-testid="message-form">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); handleTyping(); }}
              placeholder={activeChannel ? `Message #${activeChannel.name}` : "Select a channel..."}
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30"
              maxLength={2000}
              disabled={!connected}
              data-testid="input-chat-message"
            />
            <Button
              type="submit"
              size="icon"
              className="bg-emerald-500 text-white shrink-0"
              disabled={!inputValue.trim() || !connected}
              data-testid="button-send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
