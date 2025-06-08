import MarkdownIt from "markdown-it";
import { full as emoji } from "markdown-it-emoji";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

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

const markdown = new MarkdownIt({
  breaks: true,
  linkify: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        }</code></pre>`;
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${markdown.utils.escapeHtml(str)}</code></pre>`;
  },
})
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
