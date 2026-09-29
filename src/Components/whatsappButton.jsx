// components/WhatsAppButton.jsx
// components/WhatsAppButton.jsx
import { useState, useEffect } from "react";

export default function WhatsAppButton() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Jab scroll 50px se zyada ho → bottom badhao
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <a
      href="https://wa.me/971528036012"
      className={`whatsapp-float ${isScrolled ? "scrolled" : "top"}`}
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