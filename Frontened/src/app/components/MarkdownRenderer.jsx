import React, { useState } from 'react';

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  // Split content by code blocks: ```[lang]\n[code]\n```
  const parts = [];
  let remaining = content;

  while (remaining) {
    const codeBlockStart = remaining.indexOf('```');
    if (codeBlockStart === -1) {
      parts.push({ type: 'text', value: remaining });
      break;
    }

    if (codeBlockStart > 0) {
      parts.push({ type: 'text', value: remaining.substring(0, codeBlockStart) });
    }

    const codeBlockEnd = remaining.indexOf('```', codeBlockStart + 3);
    if (codeBlockEnd === -1) {
      parts.push({ type: 'code', lang: '', value: remaining.substring(codeBlockStart + 3) });
      break;
    }

    const blockContent = remaining.substring(codeBlockStart + 3, codeBlockEnd);
    const newlineIndex = blockContent.indexOf('\n');
    let lang = '';
    let code = blockContent;
    if (newlineIndex !== -1) {
      lang = blockContent.substring(0, newlineIndex).trim();
      code = blockContent.substring(newlineIndex + 1);
    }

    parts.push({ type: 'code', lang, value: code });
    remaining = remaining.substring(codeBlockEnd + 3);
  }

  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return <CodeBlock key={index} lang={part.lang} code={part.value} />;
        } else {
          return <TextBlock key={index} text={part.value} />;
        }
      })}
    </div>
  );
}

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-slate-800 bg-slate-900/60 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 text-[11px] text-slate-400 font-mono select-none">
        <span className="uppercase tracking-wider font-semibold text-slate-500">{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-slate-200 active:scale-95 transition-all focus:outline-none cursor-pointer"
        >
          {copied ? (
            <span className="text-emerald-400 font-semibold">Copied!</span>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto code-scrollbar bg-slate-950/30">
        <pre className="text-xs sm:text-sm font-mono text-slate-300 leading-relaxed text-left whitespace-pre">
          <code>{code.trim()}</code>
        </pre>
      </div>
    </div>
  );
}

function TextBlock({ text }) {
  const lines = text.split('\n');
  const elements = [];
  let currentParagraph = [];
  let currentList = [];
  let isOrderedList = false;

  const flushParagraph = (key) => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={key} className="text-slate-300 text-sm sm:text-base leading-relaxed text-left">
          {renderInlineFormatting(currentParagraph.join(' '))}
        </p>
      );
      currentParagraph = [];
    }
  };

  const flushList = (key) => {
    if (currentList.length > 0) {
      const ListTag = isOrderedList ? 'ol' : 'ul';
      elements.push(
        <ListTag key={key} className={`pl-6 my-3 text-left space-y-1.5 ${isOrderedList ? 'list-decimal' : 'list-disc text-slate-400'}`}>
          {currentList.map((item, idx) => (
            <li key={idx} className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {renderInlineFormatting(item)}
            </li>
          ))}
        </ListTag>
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check Headers
    if (trimmed.startsWith('#')) {
      flushParagraph(`p-${i}`);
      flushList(`l-${i}`);

      const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const headerText = headerMatch[2];
        const HeaderTag = `h${level}`;
        
        let headerClass = "font-bold text-white text-left mt-5 mb-2.5";
        if (level === 1) headerClass += " text-xl sm:text-2xl border-b border-slate-800/60 pb-1.5";
        else if (level === 2) headerClass += " text-lg sm:text-xl";
        else if (level === 3) headerClass += " text-base sm:text-lg";
        else headerClass += " text-sm sm:text-base text-slate-200";

        elements.push(
          <HeaderTag key={`h-${i}`} className={headerClass}>
            {renderInlineFormatting(headerText)}
          </HeaderTag>
        );
        continue;
      }
    }

    // Check List Items (bullet list)
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      flushParagraph(`p-${i}`);
      if (isOrderedList) {
        flushList(`l-${i}`);
        isOrderedList = false;
      }
      currentList.push(trimmed.substring(2));
      continue;
    }

    // Check Ordered List Items
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph(`p-${i}`);
      if (!isOrderedList) {
        flushList(`l-${i}`);
        isOrderedList = true;
      }
      currentList.push(olMatch[2]);
      continue;
    }

    // Empty lines separate paragraphs
    if (trimmed === '') {
      flushParagraph(`p-${i}`);
      flushList(`l-${i}`);
      continue;
    }

    // Regular line, append to current paragraph
    currentParagraph.push(line);
  }

  flushParagraph(`p-final`);
  flushList(`l-final`);

  return <div className="space-y-2 mt-1">{elements}</div>;
}

function renderInlineFormatting(text) {
  if (!text) return '';

  const parts = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining) {
    const boldIndex = remaining.indexOf('**');
    const codeIndex = remaining.indexOf('`');

    if (boldIndex === -1 && codeIndex === -1) {
      parts.push(remaining);
      break;
    }

    if (boldIndex !== -1 && (codeIndex === -1 || boldIndex < codeIndex)) {
      if (boldIndex > 0) {
        parts.push(remaining.substring(0, boldIndex));
      }
      const boldEnd = remaining.indexOf('**', boldIndex + 2);
      if (boldEnd === -1) {
        parts.push(remaining.substring(boldIndex));
        break;
      }
      const boldText = remaining.substring(boldIndex + 2, boldEnd);
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-semibold text-slate-100">
          {boldText}
        </strong>
      );
      remaining = remaining.substring(boldEnd + 2);
    } else {
      if (codeIndex > 0) {
        parts.push(remaining.substring(0, codeIndex));
      }
      const codeEnd = remaining.indexOf('`', codeIndex + 1);
      if (codeEnd === -1) {
        parts.push(remaining.substring(codeIndex));
        break;
      }
      const codeText = remaining.substring(codeIndex + 1, codeEnd);
      parts.push(
        <code key={`c-${keyIdx++}`} className="px-1.5 py-0.5 rounded bg-slate-900 font-mono text-[13px] text-slate-200 border border-slate-800">
          {codeText}
        </code>
      );
      remaining = remaining.substring(codeEnd + 1);
    }
  }

  return <>{parts}</>;
}
