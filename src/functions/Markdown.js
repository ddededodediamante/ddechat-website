import MarkdownIt from "markdown-it";
import { full as emoji } from "markdown-it-emoji";

const emojiList = [];
const importAll = (r) =>
  r.keys().forEach((key) => {
    const name = key.match(/\.\/([\w-]+)\.png$/)?.[1];
    if (name) emojiList.push(name);
  });
importAll(require.context("../static/emojis", false, /\.png$/));

const emojiMap = {};
emojiList.forEach((name) => {
  emojiMap[name] = require(`../static/emojis/${name}.png`);
});

const markdown = new MarkdownIt({ breaks: true, linkify: true })
  .disable("image")
  .use(emoji, {
    defs: Object.fromEntries(emojiList.map((name) => [name, name])),
  })
  .use(function emojiPlugin(md) {
    md.renderer.rules.emoji = function (tokens, idx) {
      const emojiName = tokens[idx].markup;
      const src = emojiMap[emojiName];
      if (src) {
        return `<img src="${src}" alt=":${emojiName}:" class="emoji-inline"/>`;
      }
      return `:${emojiName}:`;
    };
  });

export default markdown;
