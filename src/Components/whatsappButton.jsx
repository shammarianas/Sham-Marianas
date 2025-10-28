// components/WhatsAppButton.jsx
export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/971528036012"
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="/assets/imgs/whatsapp-icon.png"
        alt="WhatsApp"
        className="whatsapp-icon"
      />
    </a>
  );
}