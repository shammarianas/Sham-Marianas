import { useEffect, useState } from 'react';

const ComingSoon = () => {
  const [text, setText] = useState('');
  const fullText = 'Coming Soon.......';

  // Typewriter Effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Generate 40 glowing floating circles
  const circles = [...Array(40)].map((_, _i) => ({
    size: Math.random() * 2 + 3, // Tiny glowing dots
    left: Math.random() * 100,
    top: Math.random() *  100, // Start from random position
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        margin: 0,
      }}
    >
      {/* Glowing Floating Particles */}
      {circles.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${c.size}px`,
            height: `${c.size}px`,
            background: '#fff',
            borderRadius: '50%',
            left: `${c.left}vw`,
            top: `${c.top}vh`,
            opacity: 0,
            pointerEvents: 'none',
            animation: `floatGlow ${c.duration}s ease-in-out infinite`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {/* Typewriter Text */}
      <div
        style={{
          fontSize: '4rem',
          fontWeight: 500,
          color: '#fff',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
          letterSpacing: '3px',
         }}
      >
        {text}
        <span
          style={{
            animation: 'blink 0.8s infinite',
            fontWeight: 400,
            marginLeft: '5px',
          }}
        >
          |
        </span>
      </div>

      {/* Inline Animations */}
      <style>{`
        @keyframes floatGlow {
          0% {
            transform: translateY(0) translateX(0) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: ${0.6 + Math.random() * 0.4};
          }
          90% {
            opacity: ${0.3 + Math.random() * 0.3};
          }
          100% {
            transform: translateY(-120vh) translateX(${Math.random() > 0.5 ? '' : '-'}${Math.random() * 50}vw) scale(1.2);
            opacity: 0;
          }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;
