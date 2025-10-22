/**
 * Utilitários de Criptografia para Fingerprinting
 */

/**
 * Gera hash SHA-256 de uma string
 */
export async function sha256(message: string): Promise<string> {
  // Usar Web Crypto API (disponível em navegadores modernos)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
  
  // Fallback para Node.js (server-side)
  if (typeof require !== 'undefined') {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(message).digest('hex');
  }
  
  throw new Error('SHA-256 não disponível neste ambiente');
}

/**
 * Gera hash MD5 de uma string (para compatibilidade)
 */
export async function md5(message: string): Promise<string> {
  // Implementação simplificada de MD5
  // NOTA: MD5 não é seguro para criptografia, mas serve para fingerprinting
  
  if (typeof require !== 'undefined') {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(message).digest('hex');
  }
  
  // Para client-side, usar SHA-256 como fallback
  return sha256(message);
}

/**
 * Gera ID único baseado em timestamp e randomização
 */
export function gerarIdUnico(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Anonimiza dados sensíveis (LGPD compliant)
 */
export async function anonimizarDados(dados: any): Promise<string> {
  const dadosString = JSON.stringify(dados);
  return sha256(dadosString);
}

