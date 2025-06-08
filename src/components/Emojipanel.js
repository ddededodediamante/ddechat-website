import { useState, useEffect } from "react";

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

  useEffect(() => {
    const handleFocus = (e) => {
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") {
        setTargetInput(e.target);
      }
    };
    window.addEventListener("focusin", handleFocus);
    return () => window.removeEventListener("focusin", handleFocus);
  }, []);

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
    <div className="emoji-panel">
      {emojiList.map((name) => (
        <img
          key={name}
          src={emojiMap[name]}
          alt={name}
          title={name}
          onClick={() => insertEmoji(name)}
          className="emoji-picker-item"
        />
      ))}
    </div>
  );
}
