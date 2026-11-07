import { z } from 'zod';
import { formatBibleReference } from './bible-books';

const responseSchema = z.object({
  content: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    title: z.string().max(200),
    color: z.string().max(80),
    details: z.string().max(50_000),
    leituras: z.string().max(20_000),
    // Dias com várias missas (Finados, Natal) passam de 200 mil caracteres.
    body: z.string().max(1_000_000),
  }),
});

export type CnbbLiturgy = {
  date: string;
  title: string;
  color: string;
  details: string;
  references: string[];
  blocks: LiturgyBlock[];
  sourceUrl: string;
};

function decodeHtmlEntities(value: string) {
  const named: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith('#')) {
      const hexadecimal = code[1]?.toLowerCase() === 'x';
      const point = Number.parseInt(code.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      return Number.isFinite(point) && point > 0 && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : entity;
    }
    return named[code.toLowerCase()] ?? entity;
  });
}

export function liturgyHtmlToText(value: string) {
  const withoutUnsafeBlocks = value.replace(
    /<(script|style|template|iframe|object)[^>]*>[\s\S]*?<\/\1>/gi,
    '',
  );
  const withBreaks = withoutUnsafeBlocks
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|center|li)>/gi, '\n')
    .replace(/<(?:p|div|h[1-6]|center|li)\b[^>]*>/gi, '\n');
  return decodeHtmlEntities(withBreaks.replace(/<[^>]*>/g, ''))
    .replace(/\r/g, '')
    .replace(/[\t\f\v ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export type LiturgyBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'verse'; number: string; lines: string[] }
  | { kind: 'paragraph'; style: 'text' | 'subtitle' | 'reference'; lines: string[] };

type Mark = 'center' | 'heading' | 'red' | 'reference' | 'subtitle' | 'number' | 'verse' | 'hidden';
type Segment = { text: string; marks: Set<Mark> };

const VOID_TAGS = new Set(['br', 'img', 'meta', 'hr', 'input', 'link', 'wbr']);
const SKIPPED_TAGS = new Set(['script', 'style', 'template', 'iframe', 'object', 'noscript']);
const BLOCK_TAGS = new Set([
  'div',
  'p',
  'center',
  'li',
  'ul',
  'ol',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
]);
const RED = /color\s*=\s*["']?\s*(red|#f00\b|#ff0000)/i;

function tagMarks(tag: string, attributes: string): Mark[] {
  const marks: Mark[] = [];
  if (/display\s*:\s*none/i.test(attributes)) marks.push('hidden');
  if (tag === 'center') marks.push('center');
  if (/^h[1-6]$/.test(tag)) marks.push('heading');
  if (tag === 'font' && RED.test(attributes)) marks.push('red');
  if (tag === 'font' && /color\s*=\s*["']?\s*tomato/i.test(attributes)) marks.push('reference');
  if (tag === 'p' && /align\s*=\s*["']?\s*right/i.test(attributes)) marks.push('subtitle');
  // Formato da CNBB: coluna estreita com o número e coluna flexível com o texto do versículo.
  if (tag === 'div' && /min-width\s*:\s*30px/i.test(attributes)) marks.push('number');
  if (tag === 'div' && /flex\s*:\s*1\b/i.test(attributes)) marks.push('verse');
  return marks;
}

const clean = (value: string) => value.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

// Converte o HTML da CNBB em blocos estruturados, renderizados como texto pelo React.
export function liturgyBodyBlocks(html: string): LiturgyBlock[] {
  const blocks: LiturgyBlock[] = [];
  const stack: { tag: string; marks: Mark[] }[] = [];
  let line: Segment[] = [];
  let paragraph: Extract<LiturgyBlock, { kind: 'paragraph' }> | null = null;
  let verse: Extract<LiturgyBlock, { kind: 'verse' }> | null = null;
  let pendingNumber = '';
  let numberText = '';

  const active = (mark: Mark) => stack.some((entry) => entry.marks.includes(mark));
  // <center> e títulos só valem para o texto direto deles: a CNBB às vezes deixa <center> sem fechar.
  const currentMarks = () => {
    const innermostBlock = stack.findLastIndex((entry) => BLOCK_TAGS.has(entry.tag));
    return new Set(
      stack.flatMap((entry, index) =>
        entry.marks.filter(
          (mark) => (mark !== 'center' && mark !== 'heading') || index === innermostBlock,
        ),
      ),
    );
  };
  const endParagraph = () => {
    if (paragraph?.lines.length) blocks.push(paragraph);
    paragraph = null;
  };
  const endLine = () => {
    const segments = line;
    line = [];
    const text = clean(segments.map((segment) => segment.text).join(''));
    const every = (mark: Mark) => segments.every((s) => !clean(s.text) || s.marks.has(mark));
    if (!text) return false;
    if (verse) {
      verse.lines.push(text);
      return true;
    }
    // "Salmo responsorial" em vermelho seguido da referência na mesma linha.
    const filled = segments.filter((s) => clean(s.text));
    const split = filled.findIndex((s) => !s.marks.has('red'));
    if (split > 0 && filled.slice(split).every((s) => s.marks.has('reference'))) {
      endParagraph();
      blocks.push({
        kind: 'heading',
        text: clean(
          filled
            .slice(0, split)
            .map((s) => s.text)
            .join(''),
        ),
      });
      paragraph = {
        kind: 'paragraph',
        style: 'reference',
        lines: [
          formatBibleReference(
            clean(
              filled
                .slice(split)
                .map((s) => s.text)
                .join(''),
            ),
          ),
        ],
      };
      endParagraph();
      return true;
    }
    // Respostas (R./V.) nunca são títulos, mesmo dentro de um <center> sem fechamento.
    const isLabel = /^(R\.|V\.|Ou:)(\s|$)/i.test(text);
    if (!isLabel && (every('center') || every('heading') || every('red'))) {
      endParagraph();
      blocks.push({ kind: 'heading', text });
      return true;
    }
    const style = every('subtitle') ? 'subtitle' : every('reference') ? 'reference' : 'text';
    if (paragraph && paragraph.style !== style) endParagraph();
    paragraph ??= { kind: 'paragraph', style, lines: [] };
    paragraph.lines.push(style === 'reference' ? formatBibleReference(text) : text);
    return true;
  };
  // Fora dos versículos, uma quebra sobre linha vazia (<br><br>) encerra o parágrafo.
  const lineBreak = () => {
    if (!endLine() && !verse) endParagraph();
  };

  const tokens = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>|([^<]+)|</g);
  let skipping: string | null = null;
  for (const [, closing, rawTag, attributes = '', text] of tokens) {
    const tag = rawTag?.toLowerCase();
    if (skipping) {
      if (closing && tag === skipping) skipping = null;
      continue;
    }
    if (text !== undefined || !tag) {
      const value = decodeHtmlEntities(text ?? '<');
      if (active('hidden')) continue;
      if (active('number')) numberText += value;
      else line.push({ text: value, marks: currentMarks() });
      continue;
    }
    if (!closing && SKIPPED_TAGS.has(tag)) {
      skipping = tag;
      continue;
    }
    if (tag === 'br') {
      if (!active('hidden') && !active('number')) lineBreak();
      continue;
    }
    if (VOID_TAGS.has(tag)) continue;
    if (!closing) {
      const marks = tagMarks(tag, attributes);
      if (BLOCK_TAGS.has(tag) && !active('hidden')) {
        endLine();
        if (marks.includes('center') || marks.includes('subtitle') || marks.includes('heading'))
          endParagraph();
      }
      if (marks.includes('number')) numberText = '';
      if (marks.includes('verse') && !active('hidden')) {
        endParagraph();
        verse = { kind: 'verse', number: pendingNumber, lines: [] };
        pendingNumber = '';
      }
      stack.push({ tag, marks });
      continue;
    }
    const index = stack.map((entry) => entry.tag).lastIndexOf(tag);
    if (index < 0) continue;
    const closed = stack.splice(index);
    if (BLOCK_TAGS.has(tag) && !active('hidden')) endLine();
    if (closed.some((entry) => entry.marks.includes('number'))) pendingNumber = clean(numberText);
    if (closed.some((entry) => entry.marks.includes('verse')) && verse) {
      endLine();
      if (verse.lines.length) blocks.push(verse);
      verse = null;
    }
    if (
      closed.some((entry) =>
        entry.marks.some((m) => m === 'center' || m === 'subtitle' || m === 'heading'),
      )
    )
      endParagraph();
  }
  endLine();
  if (verse?.lines.length) blocks.push(verse);
  endParagraph();
  return blocks;
}

function readingReferences(value: string) {
  return liturgyHtmlToText(value)
    .split('\n')
    .map((line) => formatBibleReference(line.trim()))
    .filter((line) => line && !/^leituras:?$/i.test(line));
}

function liturgyDetails(value: string) {
  const lines = liturgyHtmlToText(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const readingsIndex = lines.findIndex((line) => /^leituras:?$/i.test(line));
  const headingLines = readingsIndex >= 0 ? lines.slice(0, readingsIndex) : lines;

  return headingLines.filter((line) => !/\b\d{4}$/.test(line)).join('\n');
}

export function parseCnbbLiturgy(
  payload: unknown,
  requestedDate: string,
  sourceUrl: string,
): CnbbLiturgy {
  const { content } = responseSchema.parse(payload);
  if (content.date !== requestedDate) throw new Error('CNBB_DATE_MISMATCH');

  const blocks = liturgyBodyBlocks(content.body);
  if (!blocks.length) throw new Error('CNBB_EMPTY_CONTENT');

  return {
    date: content.date,
    title: liturgyHtmlToText(content.title),
    color: liturgyHtmlToText(content.color),
    details: liturgyDetails(content.details),
    references: readingReferences(content.leituras),
    blocks,
    sourceUrl,
  };
}
