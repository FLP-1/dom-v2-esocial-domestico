/**
 * 🔐 Serviço de Criptografia de Certificados Digitais
 * 
 * Implementa criptografia AES-256-GCM para senhas de certificados
 * em conformidade com LGPD e normas de segurança
 */

import crypto from 'crypto'

// Algoritmo de criptografia (AES-256-GCM)
const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16 // 128 bits
const SALT_LENGTH = 64
const AUTH_TAG_LENGTH = 16

/**
 * Gera uma chave mestra a partir da chave do ambiente
 * IMPORTANTE: MASTER_KEY deve estar no .env e NUNCA ser commitada
 */
function getMasterKey(): Buffer {
  const masterKey = process.env.CERTIFICATE_MASTER_KEY
  
  if (!masterKey) {
    throw new Error('CERTIFICATE_MASTER_KEY não configurada no ambiente')
  }
  
  // Deriva uma chave de 256 bits usando PBKDF2
  return crypto.pbkdf2Sync(
    masterKey,
    'dom-certificate-salt-v1',
    100000,
    KEY_LENGTH,
    'sha512'
  )
}

/**
 * Criptografa a senha de um certificado
 */
export function encryptCertificatePassword(password: string): {
  encryptedPassword: string
  salt: string
  iv: string
  authTag: string
} {
  try {
    // Gera salt e IV aleatórios
    const salt = crypto.randomBytes(SALT_LENGTH)
    const iv = crypto.randomBytes(IV_LENGTH)
    
    // Obtém a chave mestra
    const masterKey = getMasterKey()
    
    // Cria o cipher
    const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv)
    
    // Criptografa a senha
    let encrypted = cipher.update(password, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // Obtém o authentication tag
    const authTag = cipher.getAuthTag()
    
    return {
      encryptedPassword: encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    }
  } catch (error) {
    console.error('❌ Erro ao criptografar senha:', error)
    throw new Error('Falha na criptografia da senha do certificado')
  }
}

/**
 * Descriptografa a senha de um certificado
 */
export function decryptCertificatePassword(
  encryptedPassword: string,
  salt: string,
  iv: string,
  authTag: string
): string {
  try {
    // Obtém a chave mestra
    const masterKey = getMasterKey()
    
    // Cria o decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      masterKey,
      Buffer.from(iv, 'hex')
    )
    
    // Define o authentication tag
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))
    
    // Descriptografa
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('❌ Erro ao descriptografar senha:', error)
    throw new Error('Falha na descriptografia da senha do certificado')
  }
}

/**
 * Gera hash do arquivo de certificado para verificação de integridade
 */
export function generateFileHash(fileBuffer: Buffer): string {
  return crypto
    .createHash('sha256')
    .update(fileBuffer)
    .digest('hex')
}

/**
 * Gera um salt aleatório para bcrypt
 */
export function generateSalt(): string {
  return crypto.randomBytes(SALT_LENGTH).toString('hex')
}

/**
 * Valida a força de uma senha
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 6) {
    errors.push('Senha deve ter no mínimo 6 caracteres')
  }
  
  if (password.length > 128) {
    errors.push('Senha muito longa')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Ofusca dados sensíveis para logs (LGPD)
 */
export function obfuscateSensitiveData(data: string, showChars: number = 4): string {
  if (!data || data.length <= showChars) {
    return '****'
  }
  
  const visible = data.slice(-showChars)
  return '*'.repeat(data.length - showChars) + visible
}

/**
 * Registra acesso ao certificado (para auditoria LGPD)
 */
export interface CertificateAccessLog {
  certificadoId: string
  usuarioId?: string
  acao: 'LEITURA' | 'CRIACAO' | 'ATUALIZACAO' | 'EXCLUSAO' | 'USO' | 'EXPORTACAO'
  descricao?: string
  enderecoIP: string
  userAgent?: string
  sucesso: boolean
  mensagemErro?: string
}

/**
 * Valida se o certificado está dentro do prazo de validade
 */
export function isCertificateValid(dataValidade: Date): {
  valid: boolean
  daysUntilExpiration: number
  expired: boolean
} {
  const now = new Date()
  const expiration = new Date(dataValidade)
  const diffTime = expiration.getTime() - now.getTime()
  const daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return {
    valid: daysUntilExpiration > 0,
    daysUntilExpiration,
    expired: daysUntilExpiration < 0
  }
}

/**
 * Gera thumbprint do certificado
 */
export function generateThumbprint(certBuffer: Buffer): string {
  return crypto
    .createHash('sha1')
    .update(certBuffer)
    .digest('hex')
    .toUpperCase()
}

/**
 * Máscara de CPF/CNPJ para exibição (LGPD)
 */
export function maskCpfCnpj(document: string): string {
  if (document.length === 11) {
    // CPF: XXX.XXX.XXX-XX -> ***.***.**-XX
    return `***.***.**-${document.slice(-2)}`
  } else if (document.length === 14) {
    // CNPJ: XX.XXX.XXX/XXXX-XX -> **.***.***/****-XX
    return `**.***.***/****-${document.slice(-2)}`
  }
  return '***'
}

/**
 * Exporta dados do certificado para JSON (com dados sensíveis mascarados)
 */
export function exportCertificateData(certificate: any): any {
  return {
    id: certificate.id,
    nome: certificate.nome,
    tipo: certificate.tipo,
    tipoDocumento: certificate.tipoDocumento,
    cpfCnpjTitular: maskCpfCnpj(certificate.cpfCnpjTitular),
    nomeTitular: certificate.nomeTitular,
    numeroSerial: obfuscateSensitiveData(certificate.numeroSerial, 6),
    emissor: certificate.emissor,
    dataEmissao: certificate.dataEmissao,
    dataValidade: certificate.dataValidade,
    ativo: certificate.ativo,
    revogado: certificate.revogado,
    criadoEm: certificate.criadoEm,
    // Dados sensíveis NUNCA são exportados
    senhaHash: '*** CRIPTOGRAFADO ***',
    caminhoArquivo: '*** PROTEGIDO ***'
  }
}

