import { z } from 'zod';

const responseSchema = z.object({
  content: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    title: z.string().max(200),
    color: z.string().max(80),
    details: z.string().max(50_000),
    leituras: z.string().max(20_000),
    body: z.string().max(200_000),
  }),
});

export type CnbbLiturgy = {
  date: string;
  title: string;
  color: string;
  details: string;
  references: string[];
  body: string;
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

function readingReferences(value: string) {
  return liturgyHtmlToText(value)
    .split('\n')
    .map((line) => line.trim())
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

  const body = liturgyHtmlToText(content.body);
  if (!body) throw new Error('CNBB_EMPTY_CONTENT');

  return {
    date: content.date,
    title: liturgyHtmlToText(content.title),
    color: liturgyHtmlToText(content.color),
    details: liturgyDetails(content.details),
    references: readingReferences(content.leituras),
    body,
    sourceUrl,
  };
}
