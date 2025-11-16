import MarkdownIt from "markdown-it";
import { full as emoji } from "markdown-it-emoji";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

const emojiModules = import.meta.glob("../static/emojis/*.png", { eager: true });
export const emojiMap = {};

for (const path in emojiModules) {
  const name = path.match(/([\w-]+)\.png$/)?.[1];
  if (name) {
    emojiMap[name] = emojiModules[path].default || emojiModules[path];
  }
}

export const emojiList = Object.keys(emojiMap).sort((a, b) => a.localeCompare(b));

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
        return `<img src="${src}" alt=":${emojiName}:" class="emoji-inline" loading="lazy" />`;
      }
      return `:${emojiName}:`;
    };
  });

export default markdown;
