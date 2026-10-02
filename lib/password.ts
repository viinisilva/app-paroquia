import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
// OWASP scrypt: N=2^17, r=8, p=1; salt de 128 bits.
function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, 64, { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt:${salt}:${(await derive(password, salt)).toString('hex')}`;
}
export async function verifyPassword(password: string, hash: string) {
  const [algorithm, salt, key] = hash.split(':');
  if (algorithm !== 'scrypt' || !salt || !key || key.length !== 128) return false;
  return timingSafeEqual(await derive(password, salt), Buffer.from(key, 'hex'));
}
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
