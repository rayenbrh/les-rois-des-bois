import nodemailer, { Transporter } from 'nodemailer';
import config from '../config/env';
import logger from '../utils/logger';
import path from 'path';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  private initializeTransporter(): void {
    if (!config.smtp.user || !config.smtp.password) {
      logger.warn('SMTP credentials not configured. Email service is disabled.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransporter({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.password,
        },
      });

      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email transporter not initialized. Email not sent.');
      return false;
    }

    try {
      const mailOptions = {
        from: config.emailFrom,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId} to ${options.to}`);
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send invoice email with PDF attachment
   */
  async sendInvoiceEmail(
    to: string,
    clientName: string,
    invoiceNumber: string,
    pdfPath: string,
    locale: string = 'ar'
  ): Promise<boolean> {
    const subject =
      locale === 'ar'
        ? `فاتورة رقم ${invoiceNumber} من ${config.company.nameAr}`
        : `Invoice #${invoiceNumber} from ${config.company.name}`;

    const html =
      locale === 'ar'
        ? `
      <div dir="rtl" style="font-family: Arial, sans-serif;">
        <h2>عزيزي ${clientName}</h2>
        <p>نشكركم على تعاملكم معنا. يرجى إيجاد فاتورتكم رقم <strong>${invoiceNumber}</strong> في المرفقات.</p>
        <p>إذا كان لديكم أي استفسار، يرجى التواصل معنا.</p>
        <br>
        <p>مع أطيب التحيات،</p>
        <p><strong>${config.company.nameAr}</strong></p>
        <p>الهاتف: ${config.company.phone}</p>
        <p>البريد الإلكتروني: ${config.company.email}</p>
      </div>
    `
        : `
      <div style="font-family: Arial, sans-serif;">
        <h2>Dear ${clientName}</h2>
        <p>Thank you for your business. Please find attached your invoice #<strong>${invoiceNumber}</strong>.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>${config.company.name}</strong></p>
        <p>Phone: ${config.company.phone}</p>
        <p>Email: ${config.company.email}</p>
      </div>
    `;

    return await this.sendEmail({
      to,
      subject,
      html,
      attachments: [
        {
          filename: `invoice_${invoiceNumber}.pdf`,
          path: pdfPath,
        },
      ],
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(
    to: string,
    clientName: string,
    orderNumber: string,
    orderTotal: number,
    locale: string = 'ar'
  ): Promise<boolean> {
    const subject =
      locale === 'ar'
        ? `تأكيد طلب رقم ${orderNumber}`
        : `Order Confirmation #${orderNumber}`;

    const html =
      locale === 'ar'
        ? `
      <div dir="rtl" style="font-family: Arial, sans-serif;">
        <h2>عزيزي ${clientName}</h2>
        <p>تم استلام طلبكم رقم <strong>${orderNumber}</strong> بنجاح.</p>
        <p>المبلغ الإجمالي: <strong>${orderTotal.toFixed(2)} ${config.currencySymbol}</strong></p>
        <p>سيتم معالجة طلبكم في أقرب وقت ممكن.</p>
        <br>
        <p>شكراً لتعاملكم معنا،</p>
        <p><strong>${config.company.nameAr}</strong></p>
      </div>
    `
        : `
      <div style="font-family: Arial, sans-serif;">
        <h2>Dear ${clientName}</h2>
        <p>Your order #<strong>${orderNumber}</strong> has been received successfully.</p>
        <p>Total Amount: <strong>${orderTotal.toFixed(2)} ${config.currency}</strong></p>
        <p>Your order will be processed shortly.</p>
        <br>
        <p>Thank you for your business,</p>
        <p><strong>${config.company.name}</strong></p>
      </div>
    `;

    return await this.sendEmail({
      to,
      subject,
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    locale: string = 'ar'
  ): Promise<boolean> {
    const resetUrl = `${config.apiBaseUrl}/auth/reset-password?token=${resetToken}`;

    const subject =
      locale === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Password Reset Request';

    const html =
      locale === 'ar'
        ? `
      <div dir="rtl" style="font-family: Arial, sans-serif;">
        <h2>إعادة تعيين كلمة المرور</h2>
        <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.</p>
        <p>يرجى النقر على الرابط التالي لإعادة تعيين كلمة المرور:</p>
        <p><a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a></p>
        <p>هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
        <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.</p>
        <br>
        <p>مع أطيب التحيات،</p>
        <p><strong>${config.company.nameAr}</strong></p>
      </div>
    `
        : `
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password.</p>
        <p>Please click the following link to reset your password:</p>
        <p><a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a></p>
        <p>This link is valid for 1 hour only.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>${config.company.name}</strong></p>
      </div>
    `;

    return await this.sendEmail({
      to,
      subject,
      html,
    });
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(
    to: string,
    userName: string,
    locale: string = 'ar'
  ): Promise<boolean> {
    const subject = locale === 'ar' ? 'مرحباً بك' : 'Welcome';

    const html =
      locale === 'ar'
        ? `
      <div dir="rtl" style="font-family: Arial, sans-serif;">
        <h2>مرحباً ${userName}</h2>
        <p>نرحب بك في ${config.company.nameAr}!</p>
        <p>نحن سعداء بانضمامك إلينا.</p>
        <p>إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.</p>
        <br>
        <p>مع أطيب التحيات،</p>
        <p><strong>${config.company.nameAr}</strong></p>
        <p>الهاتف: ${config.company.phone}</p>
        <p>البريد الإلكتروني: ${config.company.email}</p>
      </div>
    `
        : `
      <div style="font-family: Arial, sans-serif;">
        <h2>Welcome ${userName}</h2>
        <p>Welcome to ${config.company.name}!</p>
        <p>We're excited to have you on board.</p>
        <p>If you have any questions, feel free to reach out to us.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>${config.company.name}</strong></p>
        <p>Phone: ${config.company.phone}</p>
        <p>Email: ${config.company.email}</p>
      </div>
    `;

    return await this.sendEmail({
      to,
      subject,
      html,
    });
  }
}

export default new EmailService();
