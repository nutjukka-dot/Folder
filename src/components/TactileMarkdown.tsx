import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface TactileMarkdownProps {
  content: string;
  className?: string;
}

export const TactileMarkdown: React.FC<TactileMarkdownProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderFormattedText = (text: string) => {
    // Replace inline code, bold, links, italic
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    // Tokenize bold, code, links
    const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-[var(--color-text-primary)]">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={keyIdx++}
            className="px-1.5 py-0.5 mx-0.5 rounded text-xs font-mono bg-[var(--color-inset)] text-[var(--color-sage-dark)] dark:text-[#A9D1C2] border border-black/5 dark:border-white/5"
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
        const title = token.substring(1, token.indexOf(']('));
        const url = token.substring(token.indexOf('](') + 2, token.length - 1);
        parts.push(
          <a
            key={keyIdx++}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-sage-base)] hover:underline font-medium"
          >
            {title}
          </a>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Split lines and parse blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let codeBlockCounter = 0;
  let listBuffer: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuffer) return;
    const ListTag = listBuffer.type;
    elements.push(
      <ListTag
        key={`list-${elements.length}`}
        className={`my-3 pl-6 space-y-1 text-sm text-[var(--color-text-primary)] ${
          listBuffer.type === 'ul' ? 'list-disc marker:text-[var(--color-sage-base)]' : 'list-decimal'
        }`}
      >
        {listBuffer.items.map((item, i) => (
          <li key={i} className="leading-relaxed">
            {renderFormattedText(item)}
          </li>
        ))}
      </ListTag>
    );
    listBuffer = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check code fence
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBuffer.join('\n');
        const blockIdx = codeBlockCounter++;
        elements.push(
          <div
            key={`code-${blockIdx}`}
            className="my-4 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 tactile-inset"
          >
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-black/5 dark:bg-white/5 text-xs text-[var(--color-text-muted)] font-mono border-b border-black/5 dark:border-white/5">
              <span>{codeLanguage || 'code'}</span>
              <button
                type="button"
                onClick={() => handleCopy(codeText, blockIdx)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-[11px]"
              >
                {copiedIndex === blockIdx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 text-xs font-mono overflow-x-auto text-[var(--color-text-primary)] leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLanguage = '';
      } else {
        flushList();
        inCodeBlock = true;
        codeLanguage = trimmed.replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Headers
    if (trimmed.startsWith('#### ')) {
      flushList();
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-semibold mt-4 mb-2 text-[var(--color-text-primary)] tracking-tight">
          {trimmed.replace('#### ', '')}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-semibold mt-5 mb-2 text-[var(--color-text-primary)] flex items-center gap-2">
          {trimmed.replace('### ', '')}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg font-semibold mt-6 mb-3 text-[var(--color-text-primary)] pb-1 border-b border-black/5 dark:border-white/5">
          {trimmed.replace('## ', '')}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${i}`} className="text-xl font-bold mt-6 mb-3 text-[var(--color-text-primary)]">
          {trimmed.replace('# ', '')}
        </h1>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 pl-4 py-1 border-l-3 border-[var(--color-sage-base)] bg-black/2 dark:bg-white/2 rounded-r-lg text-sm text-[var(--color-text-muted)] italic"
        >
          {renderFormattedText(trimmed.replace('> ', ''))}
        </blockquote>
      );
      continue;
    }

    // Unordered List
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.substring(2);
      if (!listBuffer || listBuffer.type !== 'ul') {
        flushList();
        listBuffer = { type: 'ul', items: [itemText] };
      } else {
        listBuffer.items.push(itemText);
      }
      continue;
    }

    // Ordered List
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      const itemText = olMatch[2];
      if (!listBuffer || listBuffer.type !== 'ol') {
        flushList();
        listBuffer = { type: 'ol', items: [itemText] };
      } else {
        listBuffer.items.push(itemText);
      }
      continue;
    }

    // Empty line
    if (!trimmed) {
      flushList();
      continue;
    }

    // Normal paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="my-2 text-sm leading-relaxed text-[var(--color-text-primary)]">
        {renderFormattedText(rawLine)}
      </p>
    );
  }

  flushList();

  return <div className={`tactile-markdown ${className}`}>{elements}</div>;
};
