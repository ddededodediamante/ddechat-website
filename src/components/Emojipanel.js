import { useState, useEffect, useRef } from "react";

const emojiList = [];
const importAll = (r) =>
  r.keys().forEach((key) => {
    const name = key.match(/\.\/([\w-]+)\.png$/)?.[1];
    if (name) emojiList.push(name);
  });
importAll(require.context("../static/emojis", false, /\.png$/));

const emojiMap = {};
emojiList
  .sort((a, b) => a.localeCompare(b))
  .forEach((name) => {
    emojiMap[name] = require(`../static/emojis/${name}.png`);
  });

export default function EmojiPanel() {
  const [targetInput, setTargetInput] = useState(null);
  const panelRef = useRef(null);
  const [position, setPosition] = useState({
    x: 20,
    y: 20,
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
    const handleMouseUp = () => {
      setDragging(false);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, rel]);

  const onMouseDown = (e) => {
    if (
      e.button !== 0 ||
      (e.target && e.target.className === "emoji-picker-item")
    )
      return;
    const rect = panelRef.current.getBoundingClientRect();
    setDragging(true);
    setRel({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    e.stopPropagation();
    e.preventDefault();
  };

  function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(
      prototype,
      "value"
    )?.set;

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
    const newText =
      value.substring(0, selectionStart) +
      emojiSyntax +
      value.substring(selectionEnd);

    setNativeValue(targetInput, newText);
    targetInput.focus();
    targetInput.selectionStart = targetInput.selectionEnd =
      selectionStart + emojiSyntax.length;

    const inputEvent = new Event("input", { bubbles: true, cancelable: true });
    targetInput.dispatchEvent(inputEvent);
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
      <div className="emoji-panel-header">Emojis</div>
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
          />
        ))}
      </div>
    </div>
  );
}
