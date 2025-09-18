import {
  createEmailTransporter,
  createValidationEmailTemplate,
} from './emailConfig';
import { sendTwilioEmail } from './twilioEmailConfig';

// Estratégia de envio de email
export type EmailProvider = 'nodemailer' | 'twilio' | 'auto';

// Configuração do serviço de email
export class EmailService {
  private provider: EmailProvider;

  constructor(provider: EmailProvider = 'auto') {
    this.provider = provider;
  }

  // Detectar automaticamente o melhor provedor
  private detectProvider(): 'nodemailer' | 'twilio' {
    const hasSendGrid = process.env.SENDGRID_API_KEY;
    const hasNodemailer = process.env.EMAIL_USER && process.env.EMAIL_PASS;

    // Prioridade: Twilio SendGrid > Nodemailer
    if (hasSendGrid) return 'twilio';
    if (hasNodemailer) return 'nodemailer';

    // Se nenhum provedor está configurado, orientar sobre configuração
    console.error('❌ Nenhum provedor de email configurado');
    console.log('💡 Configure pelo menos uma opção em .env.local:');
    console.log('   - SENDGRID_API_KEY (Twilio SendGrid)');
    console.log('   - EMAIL_USER + EMAIL_PASS (Gmail)');
    throw new Error('Configure um provedor de email para envio real');
  }

  // Enviar email de validação
  async sendValidationEmail(
    email: string,
    codigo: string,
    tipo: 'email' | 'telefone' = 'email'
  ) {
    const provider =
      this.provider === 'auto' ? this.detectProvider() : this.provider;

    console.log(
      `📧 Enviando email via ${provider.toUpperCase()} para: ${email}`
    );

    switch (provider) {
      case 'twilio':
        return await this.sendViaTwilio(email, codigo, tipo);

      case 'nodemailer':
        return await this.sendViaNodemailer(email, codigo, tipo);

      default:
        throw new Error(`Provedor não suportado: ${provider}`);
    }
  }

  // Enviar via Twilio SendGrid
  private async sendViaTwilio(
    email: string,
    codigo: string,
    tipo: 'email' | 'telefone'
  ) {
    try {
      const result = await sendTwilioEmail(email, codigo, tipo);
      console.log(`✅ Email enviado via Twilio SendGrid: ${result.messageId}`);
      return {
        success: true,
        provider: 'twilio',
        messageId: result.messageId,
        message: 'Email enviado com sucesso via Twilio SendGrid',
      };
    } catch (error) {
      console.error('Erro no Twilio SendGrid:', error);
      throw new Error(
        `Erro no Twilio SendGrid: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  // Enviar via Nodemailer
  private async sendViaNodemailer(
    email: string,
    codigo: string,
    tipo: 'email' | 'telefone'
  ) {
    try {
      const transporter = createEmailTransporter();
      const emailTemplate = createValidationEmailTemplate(codigo, tipo);

      const info = await transporter.sendMail({
        from: `"DOM Sistema" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      });

      console.log(`✅ Email enviado via Nodemailer: ${info.messageId}`);
      return {
        success: true,
        provider: 'nodemailer',
        messageId: info.messageId,
        message: 'Email enviado com sucesso via Nodemailer',
      };
    } catch (error) {
      console.error('Erro no Nodemailer:', error);
      throw new Error(
        `Erro no Nodemailer: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  // Verificar status dos provedores
  getProviderStatus() {
    const status = {
      twilio: {
        configured: !!process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL || 'não configurado',
      },
      nodemailer: {
        configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
        fromEmail: process.env.EMAIL_USER || 'não configurado',
      },
    };

    return {
      ...status,
      recommended: this.detectProvider(),
      allConfigured: status.twilio.configured && status.nodemailer.configured,
    };
  }
}

// Instância padrão do serviço
export const emailService = new EmailService();
