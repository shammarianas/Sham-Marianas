'use client';
import { useEffect } from 'react';

function Cursor() {
  useEffect(() => {
    const cursor = document.querySelector('.cursor');

    // Mouse move event for cursor
    const editCursor = (e) => {
      const { clientX: x, clientY: y } = e;
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
    };

    // Hover animation for .hover-this elements
    const animateit = function (e) {
      const hoverAnim = this.querySelector('.hover-anim');
      if (!hoverAnim) return;

      const { offsetX: x, offsetY: y } = e;
      const { offsetWidth: width, offsetHeight: height } = this;
      const move = 25;
      const xMove = (x / width) * (move * 2) - move;
      const yMove = (y / height) * (move * 2) - move;

      hoverAnim.style.transform = `translate(${xMove}px, ${yMove}px)`;
      if (e.type === 'mouseleave') hoverAnim.style.transform = '';
    };

    // Event handler for links and cursor-pointer elements
    const handleMouseOver = (_e) => {
      cursor.classList.add('cursor-active');
    };

    const handleMouseLeave = (_e) => {
      cursor.classList.remove('cursor-active');
    };

    // Function to setup event listeners
    const setupEventListeners = () => {
      // For .hover-this elements
      const linkElements = document.querySelectorAll('.hover-this');
      linkElements.forEach((b) => {
        b.removeEventListener('mousemove', animateit);
        b.removeEventListener('mouseleave', animateit);
        b.addEventListener('mousemove', animateit);
        b.addEventListener('mouseleave', animateit);
      });

      // For links and .cursor-pointer elements
      const interactiveElements = document.querySelectorAll('a, .cursor-pointer');
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseOver);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.addEventListener('mouseenter', handleMouseOver);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    // Initial setup
    setupEventListeners();
    window.addEventListener('mousemove', editCursor);

    // Use MutationObserver to detect DOM changes for dynamic content
    const observer = new MutationObserver(() => {
      setupEventListeners();
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', editCursor);
      observer.disconnect();

      // Remove all event listeners
      document.querySelectorAll('.hover-this').forEach((b) => {
        b.removeEventListener('mousemove', animateit);
        b.removeEventListener('mouseleave', animateit);
      });

      document.querySelectorAll('a, .cursor-pointer').forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseOver);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return <div className="cursor"></div>;
}

export default Cursor;