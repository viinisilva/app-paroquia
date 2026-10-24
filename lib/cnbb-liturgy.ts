import 'server-only';
import { parseCnbbLiturgy, type CnbbLiturgy } from './cnbb-liturgy-parser';

const CNBB_API = 'https://api-liturgia.edicoescnbb.com.br';
export const CNBB_LITURGY_URL = 'https://liturgiadiaria.edicoescnbb.com.br/';

export async function getCnbbLiturgy(date: string): Promise<CnbbLiturgy | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  try {
    const response = await fetch(`${CNBB_API}/contents/in/date/${date}`, {
      headers: {
        Accept: 'application/json',
        Origin: CNBB_LITURGY_URL.slice(0, -1),
        Referer: CNBB_LITURGY_URL,
      },
      next: { revalidate: 6 * 60 * 60 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`CNBB_HTTP_${response.status}`);

    return parseCnbbLiturgy(await response.json(), date, CNBB_LITURGY_URL);
  } catch (error) {
    console.warn('cnbb_liturgy_unavailable', error instanceof Error ? error.name : 'UnknownError');
    return null;
  }
}
