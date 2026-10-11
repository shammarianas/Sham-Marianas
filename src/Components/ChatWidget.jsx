import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

//  IMPORTANT: Apna production webhook URL yahan daalein.

//  IMPORTANT: Apna production webhook URL yahan daalein.
const N8N_CHAT_WEBHOOK_URL = "https://n8n.agentixsystem.com/webhook/sham-marianas-chatbot";

const SESSION_STORAGE_KEY = "sm_chat_session_id";
const INQUIRY_FORM_URL = "#INQUIRY_FORM";
const INQUIRY_MARKER = "[[SHOW_INQUIRY_FORM]]";

// WhatsApp — number international format mein, koi +, space ya leading 00 nahi.
const WHATSAPP_NUMBER = "971528036012";
const WHATSAPP_PREFILL_TEXT = "Hi! I have a question about your services.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_PREFILL_TEXT)}`;
const WHATSAPP_MARKER = "[[SHOW_WHATSAPP]]";

// Matches: [[LINK:Project Name::https://example.com/project]]
const LINK_MARKER_REGEX =
  /\[\[LINK:\s*(.*?)\s*::\s*(https?:\/\/.*?)\s*\]\]/g;

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

// WhatsApp brand icon (filled), 14x14 to match ExternalLinkIcon sizing on buttons.
const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12.004 2.003c-5.518 0-9.997 4.478-9.997 9.997 0 1.762.462 3.484 1.34 5.002L2 22l5.117-1.342a9.96 9.96 0 0 0 4.887 1.245h.004c5.518 0 9.997-4.478 9.997-9.997 0-2.67-1.04-5.18-2.928-7.069a9.935 9.935 0 0 0-7.073-2.834zm0 18.187h-.003a8.202 8.202 0 0 1-4.178-1.144l-.3-.178-3.037.797.811-2.96-.196-.305a8.176 8.176 0 0 1-1.253-4.4c0-4.523 3.68-8.203 8.16-8.203a8.13 8.13 0 0 1 5.775 2.393 8.128 8.128 0 0 1 2.39 5.804c0 4.524-3.68 8.196-8.169 8.196z" />
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
    return path === "/case-study";
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
// - whatsapp button (agar [[SHOW_WHATSAPP]] mila)
// - project link buttons (agar [[LINK:Name::url]] mile, ek ya zyada)
//
// Safety net: agar AI marker ke bajaye khud markdown link ya bare URL
// bana de, usay bhi pakad kar button mein convert kar dete hain.
function extractMarkers(rawText) {
  let text = rawText;
  let showInquiryButton = false;
  let showWhatsappButton = false;
  const links = [];

  // 1) Explicit inquiry marker
  if (text.includes(INQUIRY_MARKER)) {
    showInquiryButton = true;
    text = text.split(INQUIRY_MARKER).join("");
  }

  // 1b) Explicit whatsapp marker
  if (text.includes(WHATSAPP_MARKER)) {
    showWhatsappButton = true;
    text = text.split(WHATSAPP_MARKER).join("");
  }

  // 2) Explicit project link markers — [[LINK:Name::url]], can be multiple
  text = text.replace(LINK_MARKER_REGEX, (match, label, url) => {
  links.push({
    label: label.trim(),
    url: url.trim(),
  });
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

  // 4b) Safety net — AI types the WhatsApp number or a wa.me link itself instead of the marker
  const waLinkRegex = /https?:\/\/(www\.)?(wa\.me|api\.whatsapp\.com)\/[^\s)]+/gi;
  if (waLinkRegex.test(text)) {
    showWhatsappButton = true;
    text = text.replace(waLinkRegex, "");
  }
 const barePhoneRegex = /(\+?971[\s-]?5\d(?:[\s-]?\d){7}|\+?971528036012)/g;
if (barePhoneRegex.test(text)) {
  showWhatsappButton = true;
  // Number ko text se delete nahi karna — bas WhatsApp button bhi dikha do
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

  return { cleanText, showInquiryButton, showWhatsappButton, links };
}

const ChatWidget = () => {
  const { pathname } = useLocation();
  const companyPages = [
    "/",
    "/about",
    "/terms-and-conditions",
    "/privacy-policy",
    "/services",
    "/case-study",
    "/blog",
    "/contact-us",
    "/project-details",
    "/Blog-details",
    "/page-team",
  ];
  const isCompanyPage = companyPages.some((path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path)
  );
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! 👋 Welcome to Sham Marianas!", showInquiryButton: false, showWhatsappButton: false, links: [] },
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

    setMessages((prev) => [...prev, { role: "user", text, showInquiryButton: false, showWhatsappButton: false, links: [] }]);
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

      const { cleanText, showInquiryButton, showWhatsappButton, links } = extractMarkers(rawReply);

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: cleanText, showInquiryButton, showWhatsappButton, links },
      ]);
    } catch (_err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I can't connect right now. Please try again in a moment.",
          showInquiryButton: false,
          showWhatsappButton: false,
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

  if (!isCompanyPage) return null;

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
              <div style={{ fontWeight: 600, fontSize: "15px" }}>Sham Marianas - AI Assistent</div>
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

                {/* Inquiry form + WhatsApp buttons — jab bot dono/koi ek marker bheje, dono ek sath dikh saktay hain */}
                {msg.role === "bot" && (msg.showInquiryButton || msg.showWhatsappButton) && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "80%" }}>
                    {msg.showInquiryButton && (
                      <a
                        href={INQUIRY_FORM_URL}
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
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

                    {msg.showWhatsappButton && (
                      <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          background: "#25D366",
                          color: "#fff",
                          padding: "9px 16px",
                          borderRadius: "10px",
                          fontSize: "13px",
                          fontWeight: 600,
                          textDecoration: "none",
                          boxShadow: "0 2px 8px rgba(37,211,102,0.35)",
                        }}
                      >
                        <WhatsAppIcon /> Chat on WhatsApp
                      </a>
                    )}
                  </div>
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
