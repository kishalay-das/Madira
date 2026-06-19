import type { ReactNode } from "react";

/** Inline **bold** → <strong>, everything else as text. */
function renderInline(text: string, keyBase: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyBase}-${i}`} className="font-semibold text-cream">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyBase}-${i}`}>{part}</span>;
  });
}

/**
 * Minimal, dependency-free renderer for the light-markdown blog content:
 *   `## heading`, `- bullet`, `**bold**`, blank-line-separated paragraphs.
 * Renders to React nodes (no dangerouslySetInnerHTML).
 */
export function PostContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let k = 0;

  const flushPara = () => {
    if (para.length) {
      const key = k++;
      blocks.push(
        <p key={key} className="leading-relaxed text-parchment">
          {renderInline(para.join(" "), `p${key}`)}
        </p>
      );
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      const key = k++;
      blocks.push(
        <ul key={key} className="ml-1 space-y-2">
          {list.map((it, i) => (
            <li key={i} className="flex gap-2.5 leading-relaxed text-parchment">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span>{renderInline(it, `li${key}-${i}`)}</span>
            </li>
          ))}
        </ul>
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushPara();
      flushList();
      const key = k++;
      blocks.push(
        <h2 key={key} className="font-display text-xl text-cream md:text-2xl">
          {renderInline(line.slice(3), `h${key}`)}
        </h2>
      );
      continue;
    }
    if (line.startsWith("- ")) {
      flushPara();
      list.push(line.slice(2));
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();

  return <div className="space-y-5">{blocks}</div>;
}
