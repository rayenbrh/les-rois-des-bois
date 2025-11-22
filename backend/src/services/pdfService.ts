import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/env';
import logger from '../utils/logger';
import { IInvoice, IPOSSale, IOrder, IUser } from '../types';

interface InvoiceData {
  invoice: IInvoice;
  order: IOrder;
  client: IUser;
  commercial?: IUser;
}

interface ReceiptData {
  sale: IPOSSale;
  cashier: IUser;
}

class PDFService {
  private pdfDir: string;

  constructor() {
    this.pdfDir = config.pdfPath;
    this.ensurePdfDir();
  }

  /**
   * Ensure PDF directory exists
   */
  private async ensurePdfDir(): Promise<void> {
    try {
      await fs.promises.mkdir(this.pdfDir, { recursive: true });
    } catch (error) {
      logger.error('Error creating PDF directory:', error);
    }
  }

  /**
   * Generate professional invoice PDF (Arabic, RTL layout)
   */
  async generateInvoice(data: InvoiceData): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `invoice_${data.invoice.invoiceNumber.replace(/\//g, '_')}_${uuidv4()}.pdf`;
        const filePath = path.join(this.pdfDir, fileName);
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        this.addInvoiceHeader(doc, data);

        // Client and Invoice Info
        this.addInvoiceInfo(doc, data);

        // Line Items Table
        this.addInvoiceItems(doc, data);

        // Totals
        this.addInvoiceTotals(doc, data);

        // Footer
        this.addInvoiceFooter(doc, data);

        doc.end();

        stream.on('finish', () => {
          logger.info(`Invoice PDF generated: ${filePath}`);
          resolve(filePath);
        });

        stream.on('error', (error) => {
          logger.error('Error writing invoice PDF:', error);
          reject(error);
        });
      } catch (error) {
        logger.error('Error generating invoice PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Add invoice header with company info
   */
  private addInvoiceHeader(doc: PDFKit.PDFDocument, data: InvoiceData): void {
    const { company } = config;

    // Company Name (Arabic - larger, bold)
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(company.nameAr, 50, 50, { align: 'center' });

    doc.fontSize(18).text(company.name, { align: 'center' });

    // Company Details
    doc.fontSize(10).font('Helvetica');
    doc.text(company.addressAr, { align: 'center' });
    doc.text(`${company.phone} | ${company.email}`, { align: 'center' });
    doc.text(`${company.taxId}`, { align: 'center' });

    // Invoice Title
    doc.moveDown(2);
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('فاتورة / INVOICE', { align: 'center' });

    doc.moveDown(1);
  }

  /**
   * Add invoice and client information
   */
  private addInvoiceInfo(doc: PDFKit.PDFDocument, data: InvoiceData): void {
    const { invoice, client, commercial } = data;
    const y = doc.y;

    // Right side - Client Info (RTL style)
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('معلومات العميل / Client Information', 300, y);
    doc.font('Helvetica');
    doc.text(`الاسم / Name: ${client.name}`, 300);
    doc.text(`البريد / Email: ${client.email}`, 300);
    if (client.phone) doc.text(`الهاتف / Phone: ${client.phone}`, 300);
    if (client.address) doc.text(`العنوان / Address: ${client.address}`, 300);

    // Left side - Invoice Info
    doc.font('Helvetica-Bold');
    doc.text('رقم الفاتورة / Invoice #:', 50, y);
    doc.font('Helvetica');
    doc.text(invoice.invoiceNumber, 50);

    doc.font('Helvetica-Bold');
    doc.text('التاريخ / Date:', 50);
    doc.font('Helvetica');
    doc.text(new Date(invoice.createdAt).toLocaleDateString('ar-TN'), 50);

    doc.font('Helvetica-Bold');
    doc.text('تاريخ الاستحقاق / Due Date:', 50);
    doc.font('Helvetica');
    doc.text(new Date(invoice.dueDate).toLocaleDateString('ar-TN'), 50);

    if (commercial) {
      doc.font('Helvetica-Bold');
      doc.text('المندوب / Commercial:', 50);
      doc.font('Helvetica');
      doc.text(commercial.name, 50);
    }

    doc.moveDown(2);
  }

  /**
   * Add invoice line items table
   */
  private addInvoiceItems(doc: PDFKit.PDFDocument, data: InvoiceData): void {
    const { order } = data;
    const tableTop = doc.y + 10;
    const itemCodeX = 50;
    const descriptionX = 120;
    const quantityX = 320;
    const priceX = 400;
    const totalX = 480;

    // Table Header
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('الوصف', descriptionX, tableTop);
    doc.text('الكمية', quantityX, tableTop);
    doc.text('السعر', priceX, tableTop);
    doc.text('المجموع', totalX, tableTop);

    // Underline
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Line Items
    doc.font('Helvetica');
    let y = tableTop + 25;

    order.lines.forEach((line, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.fontSize(9);
      doc.text(line.titleAtOrder.ar, descriptionX, y, { width: 180 });
      doc.text(line.qty.toString(), quantityX, y);
      doc.text(this.formatCurrency(line.unitPrice), priceX, y);
      doc.text(this.formatCurrency(line.lineTotal), totalX, y);

      y += 25;
    });

    doc.y = y + 10;
  }

  /**
   * Add invoice totals
   */
  private addInvoiceTotals(doc: PDFKit.PDFDocument, data: InvoiceData): void {
    const { order } = data;
    const x = 400;
    let y = doc.y + 20;

    doc.fontSize(10).font('Helvetica');

    // Subtotal
    doc.text('المجموع الفرعي / Subtotal:', x, y);
    doc.text(this.formatCurrency(order.subtotal), x + 150, y);
    y += 20;

    // Remise
    if (order.remise > 0) {
      doc.text('الخصم / Discount:', x, y);
      doc.text(`-${this.formatCurrency(order.remise)}`, x + 150, y);
      y += 20;
    }

    // Tax
    if (order.tax > 0) {
      doc.text(`الضريبة / Tax (${config.taxRate * 100}%):`, x, y);
      doc.text(this.formatCurrency(order.tax), x + 150, y);
      y += 20;
    }

    // Total
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('المجموع الكلي / TOTAL:', x, y);
    doc.text(this.formatCurrency(order.total), x + 150, y);

    // Amount Paid
    y += 30;
    doc.fontSize(10).font('Helvetica');
    doc.text('المبلغ المدفوع / Amount Paid:', x, y);
    doc.text(this.formatCurrency(data.invoice.amountPaid), x + 150, y);

    // Balance Due
    y += 20;
    const balanceDue = data.invoice.amountDue - data.invoice.amountPaid;
    doc.font('Helvetica-Bold');
    doc.text('المبلغ المتبقي / Balance Due:', x, y);
    doc.text(this.formatCurrency(balanceDue), x + 150, y);

    doc.y = y + 30;
  }

  /**
   * Add invoice footer
   */
  private addInvoiceFooter(doc: PDFKit.PDFDocument, data: InvoiceData): void {
    const { company } = config;

    doc.fontSize(9).font('Helvetica');
    doc.text('شروط الدفع / Payment Terms:', 50);
    doc.fontSize(8);
    doc.text('الرجاء الدفع في موعد الاستحقاق. شكراً لتعاملكم معنا.', 50);
    doc.text('Please pay by due date. Thank you for your business.', 50);

    // Footer at bottom
    doc.fontSize(8);
    doc.text(
      `${company.name} | ${company.website}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );
  }

  /**
   * Generate POS receipt PDF (compact, Arabic)
   */
  async generateReceipt(data: ReceiptData): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `receipt_${data.sale.receiptNumber.replace(/\//g, '_')}_${uuidv4()}.pdf`;
        const filePath = path.join(this.pdfDir, fileName);
        const doc = new PDFDocument({ size: [226, 600], margin: 10 }); // Thermal printer size

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(14).font('Helvetica-Bold').text(config.company.nameAr, { align: 'center' });
        doc.fontSize(8).font('Helvetica').text(config.company.phone, { align: 'center' });
        doc.moveDown(0.5);

        // Receipt Info
        doc.fontSize(10).font('Helvetica-Bold').text('إيصال / RECEIPT', { align: 'center' });
        doc.fontSize(8).font('Helvetica');
        doc.text(`#${data.sale.receiptNumber}`, { align: 'center' });
        doc.text(new Date(data.sale.createdAt).toLocaleString('ar-TN'), { align: 'center' });
        doc.text(`الكاشير / Cashier: ${data.cashier.name}`, { align: 'center' });
        doc.moveDown(0.5);

        // Divider
        doc.text('----------------------------------------', { align: 'center' });

        // Items
        data.sale.lines.forEach((line) => {
          doc.fontSize(9);
          doc.text(line.titleAtOrder.ar);
          doc.text(
            `${line.qty} x ${this.formatCurrency(line.unitPrice)} = ${this.formatCurrency(line.lineTotal)}`,
            { indent: 10 }
          );
        });

        // Divider
        doc.text('----------------------------------------', { align: 'center' });

        // Totals
        doc.fontSize(9);
        doc.text(`المجموع الفرعي / Subtotal: ${this.formatCurrency(data.sale.subtotal)}`);
        if (data.sale.remise > 0) {
          doc.text(`الخصم / Discount: -${this.formatCurrency(data.sale.remise)}`);
        }
        if (data.sale.tax > 0) {
          doc.text(`الضريبة / Tax: ${this.formatCurrency(data.sale.tax)}`);
        }
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text(`المجموع / TOTAL: ${this.formatCurrency(data.sale.total)}`);

        // Footer
        doc.moveDown(1);
        doc.fontSize(8).font('Helvetica');
        doc.text('شكراً لزيارتكم / Thank you!', { align: 'center' });
        doc.text(config.company.website, { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          logger.info(`Receipt PDF generated: ${filePath}`);
          resolve(filePath);
        });

        stream.on('error', (error) => {
          logger.error('Error writing receipt PDF:', error);
          reject(error);
        });
      } catch (error) {
        logger.error('Error generating receipt PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} ${config.currencySymbol}`;
  }

  /**
   * Delete PDF file
   */
  async deletePDF(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
      logger.info(`PDF deleted: ${filePath}`);
    } catch (error) {
      logger.error('Error deleting PDF:', error);
      throw new Error('Failed to delete PDF');
    }
  }
}

export default new PDFService();
