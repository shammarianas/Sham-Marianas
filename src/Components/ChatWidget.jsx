import React, { useState, useRef, useEffect } from "react";

// ⚠️ IMPORTANT: Apna production webhook URL yahan daalein.
const N8N_CHAT_WEBHOOK_URL = "https://n8n-z5va.srv1917294.hstgr.cloud/webhook/shammarianas-chatbot";

const SESSION_STORAGE_KEY = "sm_chat_session_id";
const INQUIRY_FORM_URL = "#INQUIRY_FORM";
const INQUIRY_MARKER = "[[SHOW_INQUIRY_FORM]]";
// Matches: [[LINK:Project Name::https://example.com/project]]
const LINK_MARKER_REGEX = /\[\[LINK:([^:\]]+?)::(https?:\/\/[^\]\s]+)\]\]/g;

function getOrCreateSessionId() {
  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId =
      "sess_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
}

const ChatIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="10" width="18" height="10" rx="2" />
    <circle cx="8.5" cy="15" r="1.5" fill="white" stroke="none" />
    <circle cx="15.5" cy="15" r="1.5" fill="white" stroke="none" />
    <path d="M12 10V6" />
    <circle cx="12" cy="4" r="1.5" fill="white" stroke="none" />
    <path d="M3 14H1" />
    <path d="M23 14h-2" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// AI ke jawab mein aksar simple markdown hota hai (**bold**, - list items).
function renderMessageHtml(rawText) {
  const escapeHtml = (str) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  let text = escapeHtml(rawText || "");
  text = text.replace(/\s+(?=\d+\.\s)/g, "\n");
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  const lines = text.split("\n");
  let html = "";
  let inList = false;

  for (const line of lines) {
    const listMatch = line.match(/^\s*[-•]\s+(.*)$/);
    if (listMatch) {
      if (!inList) {
        html += '<ul style="margin:4px 0 4px 18px;padding:0;">';
        inList = true;
      }
      html += `<li>${listMatch[1]}</li>`;
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += (html ? "<br/>" : "") + line;
    }
  }
  if (inList) html += "</ul>";

  return html;
}

// True only for the generic portfolio LISTING page itself (e.g. /portfolio or /portfolio/),
// not for specific project pages under it. Used to stop the safety net from turning
// a wrong "generic portfolio page" link into a button that looks like a real answer.
function isGenericPortfolioUrl(url) {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, "");
    return path === "/portfolio";
  } catch {
    return false;
  }
}

// Turns "some-project-slug" into "Some Project Slug" — used only as a
// last-resort label when we catch a raw URL with no name nearby.
function guessLabelFromUrl(url) {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, "");
    const lastSegment = path.split("/").filter(Boolean).pop();
    if (!lastSegment) return "View Project";
    return lastSegment
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "View Project";
  }
}

// Bot ke reply mein se markers dhoondta hai, unhe text se hata deta hai,
// aur batata hai ke is message ke neeche konse buttons dikhane hain:
// - inquiry form button (agar [[SHOW_INQUIRY_FORM]] mila)
// - project link buttons (agar [[LINK:Name::url]] mile, ek ya zyada)
//
// Safety net: agar AI marker ke bajaye khud markdown link ya bare URL
// bana de, usay bhi pakad kar button mein convert kar dete hain.
function extractMarkers(rawText) {
  let text = rawText;
  let showInquiryButton = false;
  const links = [];

  // 1) Explicit inquiry marker
  if (text.includes(INQUIRY_MARKER)) {
    showInquiryButton = true;
    text = text.split(INQUIRY_MARKER).join("");
  }

  // 2) Explicit project link markers — [[LINK:Name::url]], can be multiple
  text = text.replace(LINK_MARKER_REGEX, (match, label, url) => {
    if (isGenericPortfolioUrl(url)) return ""; // drop it silently — a generic /portfolio "project" link is always wrong
    links.push({ label: label.trim(), url: url.trim() });
    return "";
  });

  // 3) Safety net — markdown link straight to the bare inquiry-root domain
  const markdownRootLinkRegex = /\[([^\]]*)\]\(\s*https?:\/\/(www\.)?shammarianas\.com\/?\s*\)/gi;
  if (markdownRootLinkRegex.test(text)) {
    showInquiryButton = true;
    text = text.replace(markdownRootLinkRegex, "");
  }

  // 4) Safety net — bare root URL typed directly (inquiry-style)
  const bareRootUrlRegex = /https?:\/\/(www\.)?shammarianas\.com\/?(?![^\s)])/gi;
  if (bareRootUrlRegex.test(text)) {
    showInquiryButton = true;
    text = text.replace(bareRootUrlRegex, "");
  }

  // 5) Safety net — markdown link to a deeper page (e.g. a project page)
  //    that the AI wrote out itself instead of using the [[LINK:...]] marker.
  //    We deliberately skip the bare "/portfolio" listing page here — if the AI
  //    substitutes that generic page for a specific project, it's a wrong
  //    answer, and turning it into a button would just make the mistake look legitimate.
  const markdownDeepLinkRegex = /\[([^\]]+)\]\(\s*(https?:\/\/(?:www\.)?shammarianas\.com\/[^\s)]+)\s*\)/gi;
  text = text.replace(markdownDeepLinkRegex, (match, label, url) => {
    if (isGenericPortfolioUrl(url)) return match; // leave as-is, don't buttonize a wrong generic link
    links.push({ label: label.trim(), url: url.trim() });
    return "";
  });

  // 6) Safety net — a bare deep URL (no markdown) the AI typed directly.
  const bareDeepUrlRegex = /https?:\/\/(?:www\.)?shammarianas\.com\/[^\s)\]]+/gi;
  text = text.replace(bareDeepUrlRegex, (match) => {
    if (isGenericPortfolioUrl(match)) return match; // same reasoning as above
    links.push({ label: guessLabelFromUrl(match), url: match });
    return "";
  });

  const cleanText = text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+([.,!?])/g, "$1")
    .trim();

  return { cleanText, showInquiryButton, links };
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! 👋 Welcome to Sham Marianas!", showInquiryButton: false, links: [] },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const sessionIdRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isSending]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setMessages((prev) => [...prev, { role: "user", text, showInquiryButton: false, links: [] }]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch(N8N_CHAT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendMessage",
          sessionId: sessionIdRef.current,
          chatInput: text,
        }),
      });

      if (!res.ok) throw new Error("Request failed with status " + res.status);

      const data = await res.json();
      const rawReply =
        data.output || data.text || "Sorry, I'm having trouble responding right now.";

      const { cleanText, showInquiryButton, links } = extractMarkers(rawReply);

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: cleanText, showInquiryButton, links },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I can't connect right now. Please try again in a moment.",
          showInquiryButton: false,
          links: [],
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          zIndex: 9999,
        }}
      >
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close chat" : "Open chat"}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "#52b0b4",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </button>

        {!isOpen && (
          <div
            style={{
              color: "#cccccc",
              fontSize: "13px",
              fontWeight: 500,
              whiteSpace: "nowrap",
              animation: "assistSlide 60s infinite",
            }}
          >
            I can assist you 👋
          </div>
        )}
      </div>

      {/* Chat window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat window"
          style={{
            position: "fixed",
            bottom: "96px",
            left: "24px",
            width: "320px",
            maxWidth: "90vw",
            height: "500px",
            maxHeight: "70vh",
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999,
            fontFamily: "inherit",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#52b0b4",
              color: "#fff",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: "15px" }}>Sham Marianas</div>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>
                Usually within a few minutes.
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "#f9fafb",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    wordBreak: "break-word",
                    background: msg.role === "user" ? "#52b0b4" : "#e5e7eb",
                    color: msg.role === "user" ? "#fff" : "#111827",
                    padding: "10px 14px",
                    borderRadius: "14px",
                    borderBottomRightRadius: msg.role === "user" ? "4px" : "14px",
                    borderBottomLeftRadius: msg.role === "bot" ? "4px" : "14px",
                    maxWidth: "80%",
                    fontSize: "14px",
                    lineHeight: 1.4,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: renderMessageHtml(msg.text),
                  }}
                />

                {/* Project link buttons — ek ya zyada, jitne bot ne bheje */}
                {msg.role === "bot" && msg.links && msg.links.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "80%" }}>
                    {msg.links.map((link, linkIdx) => (
                      <a
                        key={linkIdx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                          background: "#fff",
                          color: "#2f8286",
                          padding: "8px 14px",
                          borderRadius: "10px",
                          border: "1.5px solid #52b0b4",
                          fontSize: "13px",
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        {link.label}
                        <ExternalLinkIcon />
                      </a>
                    ))}
                  </div>
                )}

                {/* Inquiry form button — sirf tab dikhega jab bot ne marker bheja ho */}
                {msg.role === "bot" && msg.showInquiryButton && (
                  <a
                    href={INQUIRY_FORM_URL}
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#52b0b4",
                      color: "#fff",
                      padding: "9px 16px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 600,
                      textDecoration: "none",
                      boxShadow: "0 2px 8px rgba(82,176,180,0.35)",
                    }}
                  >
                    Fill Inquiry Form <ExternalLinkIcon />
                  </a>
                )}
              </div>
            ))}
            {isSending && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#e5e7eb",
                  color: "#6b7280",
                  padding: "10px 14px",
                  borderRadius: "14px",
                  fontSize: "13px",
                }}
              >
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "8px",
              padding: "12px",
              borderTop: "1px solid #e5e7eb",
              background: "#fff",
              flexShrink: 0,
            }}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Your question..."
              style={{
                flex: 1,
                resize: "none",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                padding: "10px 12px",
                fontSize: "14px",
                outline: "none",
                fontFamily: "inherit",
                maxHeight: "80px",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isSending || !input.trim()}
              aria-label="Message bhejein"
              style={{
                background: "#52b0b4",
                border: "none",
                borderRadius: "50%",
                width: "38px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                cursor: isSending || !input.trim() ? "not-allowed" : "pointer",
                opacity: isSending || !input.trim() ? 0.5 : 1,
                flexShrink: 0,
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           