import MarkdownIt from "markdown-it";
import { full as emoji } from "markdown-it-emoji";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

const emojiModules = import.meta.glob("../static/emojis/*/*.png", {
  eager: true,
});
export const emojiMap = {};

for (const path in emojiModules) {
  const match = path.match(/emojis\/([\w-]+)\/([\w-]+)\.png$/);
  if (!match) continue;

  const [, category, name] = match;
  const file = emojiModules[path].default || emojiModules[path];

  emojiMap[name] = { src: file, category };
}

export const emojiList = Object.keys(emojiMap).sort((a, b) =>
  a.localeCompare(b)
);

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
    return `<pre class="hljs"><code>${markdown.utils.escapeHtml(
      str
    )}</code></pre>`;
  },
})
  .disable("image")
  .use(emoji, {
    defs: Object.fromEntries(emojiList.map((name) => [name, name])),
  })
  .use(function emojiPlugin(md) {
    md.renderer.rules.emoji = function (tokens, idx) {
      const name = tokens[idx].markup;
      const src = emojiMap[name]?.src;
      if (src)
        return `<img src="${src}" alt=":${name}:" class="emoji-inline" loading="lazy" />`;
      else return `:${name}:`;
    };
  });

export default markdown;
