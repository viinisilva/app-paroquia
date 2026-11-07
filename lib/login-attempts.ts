// Limites de login por e-mail. O par e-mail+IP barra força bruta de uma origem; o limite global
// do e-mail fica acima do limite por IP, para que uma única origem não bloqueie a conta de outra pessoa.
export const AUTH_LIMIT_PER_IP = 60;
export const LOGIN_LIMIT_PER_EMAIL_AND_IP = 10;
export const LOGIN_LIMIT_PER_EMAIL = 100;
export function loginAttemptLimits(email: string, ip: string) {
  return [
    { key: `email-ip:${email}:${ip}`, limit: LOGIN_LIMIT_PER_EMAIL_AND_IP },
    { key: `email:${email}`, limit: LOGIN_LIMIT_PER_EMAIL },
  ];
}
