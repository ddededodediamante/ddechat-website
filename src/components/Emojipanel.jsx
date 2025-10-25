import { useState, useEffect, useRef } from "react";
import { emojiMap, emojiList } from "../functions/Markdown";

export default function EmojiPanel({ close = () => {} }) {
  const [targetInput, setTargetInput] = useState(null);
  const panelRef = useRef(null);
  const [position, setPosition] = useState({
    x: 15,
    y: 15, 
  });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleFocus = (e) => {
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") {
        setTargetInput(e.target);
      }
    };
    window.addEventListener("focusin", handleFocus);
    return () => window.removeEventListener("focusin", handleFocus);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging) return;
      setPosition({ x: e.clientX - rel.x, y: e.clientY - rel.y });
    };
    const handleMouseUp = () => setDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, rel]);

  const onMouseDown = (e) => {
    if (e.button !== 0 || (e.target && e.target.className === "emoji-picker-item")) return;
    const rect = panelRef.current.getBoundingClientRect();
    setDragging(true);
    setRel({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    e.stopPropagation();
    e.preventDefault();
  };

  function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    if (valueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else {
      valueSetter.call(element, value);
    }
  }

  const insertEmoji = (name) => {
    if (!targetInput) return;
    const emojiSyntax = `:${name}:`;
    const { selectionStart, selectionEnd, value } = targetInput;
    const newText = value.substring(0, selectionStart) + emojiSyntax + value.substring(selectionEnd);
    setNativeValue(targetInput, newText);
    targetInput.focus();
    targetInput.selectionStart = targetInput.selectionEnd = selectionStart + emojiSyntax.length;
    targetInput.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
  };

  return (
    <div
      ref={panelRef}
      onMouseDown={onMouseDown}
      className="emoji-panel"
      style={{
        cursor: dragging ? "grabbing" : "grab",
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <div className="emoji-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Emojis</span>
        <button
          onClick={(e) => { e.stopPropagation(); close(); }}
          style={{
            background: "red",
            fontWeight: "bold",
          }}
        >
          X
        </button>
      </div>
      <div className="line" />
      <div className="emoji-grid">
        {emojiList.map((name) => (
          <img
            key={name}
            alt={name}
            title={name}
            src={emojiMap[name]}
            onClick={() => insertEmoji(name)}
            className="emoji-picker-item"
            draggable={false}
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}
