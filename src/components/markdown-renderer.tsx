"use client";

import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownRendererProps = {
  markdown: string;
};

function getTextContent(node: unknown): string {
  if (typeof node === "string") {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map(getTextContent).join("");
  }

  if (node && typeof node === "object" && "props" in node) {
    return getTextContent((node as { props?: { children?: unknown } }).props?.children);
  }

  return "";
}

function CopyButton({ text }: { text: string }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard access can fail on restricted browsers; silent fallback keeps UX clean.
    }
  };

  return (
    <button type="button" className="copy-button" onClick={handleCopy}>
      copy
    </button>
  );
}

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: { className: ["heading-anchor"] },
              content: {
                type: "text",
                value: " #",
              },
            },
          ],
        ]}
        skipHtml
        components={{
          pre: ({ children }) => {
            const text = getTextContent(children).trim();

            return (
              <div className="code-shell">
                <CopyButton text={text} />
                <pre>{children}</pre>
              </div>
            );
          },
          a: ({ ...props }) => (
            <a
              {...props}
              className="accent-link"
              target={props.href?.startsWith("#") ? undefined : "_blank"}
              rel={props.href?.startsWith("#") ? undefined : "noreferrer"}
            />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
