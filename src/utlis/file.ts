// install if needed: npm i buffer
// then at your app entry (e.g., index.ts), add: import 'buffer';
export const toBase64 = (s: string) => Buffer.from(s, 'utf8').toString('base64');
export const fromBase64 = (b: string) => Buffer.from(b, 'base64').toString('utf8');
