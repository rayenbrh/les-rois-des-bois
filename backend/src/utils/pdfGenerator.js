import PDFDocument from 'pdfkit';
import dayjs from 'dayjs';

// Generate invoice PDF for an order
export const generateInvoicePDF = (order, stream) => {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(stream);

  // Header
  doc.fontSize(20).text('LES ROIS DES BOIS', { align: 'center' });
  doc.fontSize(10).text('Luxury Furniture', { align: 'center' });
  doc.moveDown();

  // Invoice title
  doc.fontSize(16).text('FACTURE / INVOICE', { align: 'center' });
  doc.moveDown();

  // Invoice details
  doc.fontSize(10);
  doc.text(`Invoice Number: ${order.orderNumber}`, 50, 150);
  doc.text(`Date: ${dayjs(order.createdAt).format('DD/MM/YYYY')}`, 50, 165);
  doc.text(`Status: ${order.status.toUpperCase()}`, 50, 180);
  doc.text(`Payment: ${order.isPaid ? 'PAID' : 'UNPAID'}`, 50, 195);

  // Client information
  doc.text(`Client:`, 350, 150);
  doc.text(`${order.client.name}`, 350, 165);
  doc.text(`${order.client.email}`, 350, 180);
  if (order.client.phone) {
    doc.text(`${order.client.phone}`, 350, 195);
  }

  // Draw line
  doc.moveTo(50, 220).lineTo(550, 220).stroke();

  // Table header
  let yPosition = 240;
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Product', 50, yPosition);
  doc.text('Qty', 300, yPosition);
  doc.text('Price', 370, yPosition);
  doc.text('Total', 480, yPosition);

  yPosition += 20;
  doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();

  // Table content
  doc.font('Helvetica');
  yPosition += 10;

  order.items.forEach(item => {
    if (yPosition > 700) {
      doc.addPage();
      yPosition = 50;
    }

    doc.text(item.title, 50, yPosition, { width: 230 });
    if (item.color && item.color.name) {
      doc.fontSize(8).text(`Color: ${item.color.name}`, 50, yPosition + 12);
      doc.fontSize(10);
    }
    doc.text(item.quantity.toString(), 300, yPosition);
    doc.text(`€${item.priceAtOrder.toFixed(2)}`, 370, yPosition);
    doc.text(`€${item.totalPrice.toFixed(2)}`, 480, yPosition);

    yPosition += 35;
  });

  // Totals
  yPosition += 20;
  doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
  yPosition += 15;

  doc.text('Subtotal:', 370, yPosition);
  doc.text(`€${order.subtotal.toFixed(2)}`, 480, yPosition);
  yPosition += 20;

  if (order.discount > 0) {
    doc.text('Discount:', 370, yPosition);
    doc.text(`-€${order.discount.toFixed(2)}`, 480, yPosition);
    yPosition += 20;
  }

  doc.text('Tax (20%):', 370, yPosition);
  doc.text(`€${order.tax.toFixed(2)}`, 480, yPosition);
  yPosition += 20;

  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('TOTAL:', 370, yPosition);
  doc.text(`€${order.total.toFixed(2)}`, 480, yPosition);

  // Footer
  doc.fontSize(8).font('Helvetica');
  doc.text('Les Rois des Bois - Luxury Furniture', 50, 750, { align: 'center' });
  doc.text('Thank you for your business', 50, 765, { align: 'center' });

  doc.end();
};

// Generate receipt PDF for a POS sale
export const generateReceiptPDF = (sale, stream) => {
  const doc = new PDFDocument({ size: [226.77, 600], margin: 10 }); // Thermal receipt size
  doc.pipe(stream);

  // Header
  doc.fontSize(14).font('Helvetica-Bold').text('LES ROIS DES BOIS', { align: 'center' });
  doc.fontSize(8).font('Helvetica').text('Luxury Furniture', { align: 'center' });
  doc.moveDown();

  // Receipt details
  doc.fontSize(8);
  doc.text(`Receipt: ${sale.saleNumber}`, { align: 'center' });
  doc.text(`Date: ${dayjs(sale.createdAt).format('DD/MM/YYYY HH:mm')}`, { align: 'center' });
  doc.text(`Type: ${sale.saleType.toUpperCase()}`, { align: 'center' });
  doc.moveDown();

  // Items
  doc.text('--------------------------------');

  sale.items.forEach(item => {
    doc.fontSize(9).font('Helvetica-Bold').text(item.title);
    doc.fontSize(8).font('Helvetica');
    doc.text(`  ${item.quantity} x €${item.priceAtSale.toFixed(2)} = €${item.totalPrice.toFixed(2)}`);
    if (item.color && item.color.name) {
      doc.text(`  Color: ${item.color.name}`);
    }
  });

  doc.text('--------------------------------');
  doc.moveDown();

  // Totals
  doc.fontSize(9);
  doc.text(`Subtotal: €${sale.subtotal.toFixed(2)}`);
  if (sale.discount > 0) {
    doc.text(`Discount: -€${sale.discount.toFixed(2)}`);
  }
  doc.text(`Tax (20%): €${sale.tax.toFixed(2)}`);
  doc.fontSize(11).font('Helvetica-Bold');
  doc.text(`TOTAL: €${sale.total.toFixed(2)}`);
  doc.moveDown();

  doc.fontSize(8).font('Helvetica');
  doc.text(`Payment: ${sale.paymentMethod.toUpperCase()}`, { align: 'center' });
  doc.moveDown();

  // Footer
  doc.fontSize(7);
  doc.text('Thank you for your visit!', { align: 'center' });
  doc.text('Les Rois des Bois', { align: 'center' });

  doc.end();
};

// Generate sales report PDF
export const generateSalesReportPDF = (data, stream) => {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(stream);

  // Header
  doc.fontSize(20).text('LES ROIS DES BOIS', { align: 'center' });
  doc.fontSize(12).text('Sales Report', { align: 'center' });
  doc.moveDown();

  // Report period
  doc.fontSize(10);
  doc.text(`Report Period: ${data.period}`, { align: 'center' });
  doc.text(`Generated: ${dayjs().format('DD/MM/YYYY HH:mm')}`, { align: 'center' });
  doc.moveDown(2);

  // Summary
  doc.fontSize(14).font('Helvetica-Bold').text('Summary');
  doc.fontSize(10).font('Helvetica');
  doc.text(`Total Revenue: €${data.totalRevenue.toFixed(2)}`);
  doc.text(`Total Orders: ${data.totalOrders}`);
  doc.text(`Total POS Sales: ${data.totalSales}`);
  doc.text(`Average Order Value: €${data.averageOrderValue.toFixed(2)}`);
  doc.moveDown();

  // Additional data can be added here

  doc.end();
};
