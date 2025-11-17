import { useState, useEffect, useRef } from "react";
import { emojiMap } from "../functions/Markdown";

export default function EmojiPanel({ close = () => {} }) {
  const [targetInput, setTargetInput] = useState(null);
  const panelRef = useRef(null);

  const [position, setPosition] = useState({ x: 15, y: 15 });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });

  const categories = {};
  for (const name in emojiMap) {
    const { category, src } = emojiMap[name];
    if (!categories[category]) categories[category] = [];
    categories[category].push({ name, src });
  }

  const categoryList = Object.keys(categories);

  const [activeCategory, setActiveCategory] = useState(categoryList[0]);

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

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (!dragging) return;
      const t = e.touches[0];
      setPosition({
        x: t.clientX - rel.x,
        y: t.clientY - rel.y,
      });
      e.preventDefault();
    };

    const handleTouchEnd = () => setDragging(false);

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragging, rel]);

  useEffect(() => {
    if (dragging) return;
    const panel = panelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x = position.x;
    let y = position.y;

    if (rect.left < 0) x = 0;
    if (rect.top < 0) y = 0;
    if (rect.right > vw) x = vw - rect.width;
    if (rect.bottom > vh) y = vh - rect.height;

    if (x !== position.x || y !== position.y) {
      setPosition({ x, y });
    }
  }, [dragging]);

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

  const onTouchStart = (e) => {
    const t = e.touches[0];
    const rect = panelRef.current.getBoundingClientRect();
    setDragging(true);
    setRel({ x: t.clientX - rect.left, y: t.clientY - rect.top });
    e.stopPropagation();
    e.preventDefault();
  };

  function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
    const proto = Object.getPrototypeOf(element);
    const protoSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (valueSetter && valueSetter !== protoSetter)
      protoSetter.call(element, value);
    else valueSetter.call(element, value);
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
    targetInput.dispatchEvent(new Event("input", { bubbles: true }));
  };

  return (
    <div
      ref={panelRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className="emoji-panel"
      style={{
        cursor: dragging ? "grabbing" : "grab",
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <div className="emoji-panel-header">
        <span>Emojis</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          style={{ background: "red", fontWeight: "bold" }}
        >
          X
        </button>
      </div>

      <div className="line" />

      <div className="emoji-category-bar">
        {categoryList.map((cat) => {
          const firstEmoji = categories[cat][0];
          return (
            <button
              key={cat}
              onClick={(e) => {
                e.stopPropagation();
                setActiveCategory(cat);
              }}
              className="emoji-category-button"
            >
              <img
                src={firstEmoji.src}
                alt={firstEmoji.name}
                draggable={false}
              />
              <span style={{ fontSize: "0.9em" }}>{cat}</span>
            </button>
          );
        })}
      </div>

      <div className="emoji-grid">
        {categories[activeCategory].map(({ name, src }) => (
          <img
            key={name}
            alt={name}
            title={name}
            src={src}
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
