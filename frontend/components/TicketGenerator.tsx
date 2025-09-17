'use client';

import { forwardRef, useImperativeHandle } from 'react';

interface TicketData {
  participant: {
    name: string;
    email: string;
    registrationId: string;
  };
  event: {
    title: string;
    description: string;
    date: string;
    venue: string;
  };
  qrCodeData: string;
}

interface TicketGeneratorProps {
  ticketData: TicketData;
}

export interface TicketGeneratorRef {
  generateAndDownloadTicket: () => Promise<void>;
}

const TicketGenerator = forwardRef<TicketGeneratorRef, TicketGeneratorProps>(({ ticketData }, ref) => {
  const generateAndDownloadTicket = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      
      // Create PDF document with landscape orientation for better ticket layout
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Set font
      pdf.setFont('helvetica');
      
      // Header Section - Black background
      pdf.setFillColor(0, 0, 0); // Black color
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Event Title (white text on black background)
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.text(ticketData.event.title, pageWidth / 2, 25, { align: 'center' });
      
      // Ticket subtitle
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('EVENT TICKET', pageWidth / 2, 35, { align: 'center' });
      
      // Reset text color to black
      pdf.setTextColor(0, 0, 0);
      
      // Main content area
      const contentStartY = 50;
      const contentWidth = pageWidth - 40;
      const contentHeight = pageHeight - 100;
      
      // Outer border - thick black
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(2);
      pdf.rect(20, contentStartY, contentWidth, contentHeight);
      
      // Inner border - thin black
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(1);
      pdf.rect(25, contentStartY + 5, contentWidth - 10, contentHeight - 10);
      
      // Two-column layout
      const leftColumnX = 35;
      const rightColumnX = pageWidth / 2 + 10;
      
      // Left Column - Participant Details
      let currentY = contentStartY + 20;
      
      // Participant Details Header
      pdf.setFillColor(0, 0, 0);
      pdf.rect(leftColumnX - 5, currentY - 8, 120, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PARTICIPANT DETAILS', leftColumnX, currentY);
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      currentY += 20;
      
      // Participant Info
      pdf.setFontSize(12);
      
      // Name
      pdf.setFont('helvetica', 'bold');
      pdf.text('Name:', leftColumnX, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(ticketData.participant.name, leftColumnX + 25, currentY);
      currentY += 10;
      
      // Email
      pdf.setFont('helvetica', 'bold');
      pdf.text('Email:', leftColumnX, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(ticketData.participant.email, leftColumnX + 25, currentY);
      currentY += 10;
      
      // Registration ID
      pdf.setFont('helvetica', 'bold');
      pdf.text('Registration ID:', leftColumnX, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(ticketData.participant.registrationId, leftColumnX + 50, currentY);
      currentY += 20;
      
      // Event Details Header
      pdf.setFillColor(0, 0, 0);
      pdf.rect(leftColumnX - 5, currentY - 8, 120, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EVENT DETAILS', leftColumnX, currentY);
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      currentY += 20;
      
      // Event Info
      pdf.setFontSize(12);
      
      // Date
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date:', leftColumnX, currentY);
      pdf.setFont('helvetica', 'normal');
      const eventDate = new Date(ticketData.event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      pdf.text(eventDate, leftColumnX + 25, currentY);
      currentY += 10;
      
      // Venue
      pdf.setFont('helvetica', 'bold');
      pdf.text('Venue:', leftColumnX, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(ticketData.event.venue, leftColumnX + 25, currentY);
      currentY += 10;
      
      // Description (if not too long)
      if (ticketData.event.description && ticketData.event.description.length < 80) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Description:', leftColumnX, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(ticketData.event.description, leftColumnX + 35, currentY);
      }
      
      // Right Column - QR Code Section
      const qrSectionY = contentStartY + 20;
      const qrSize = 70;
      const qrX = rightColumnX + (contentWidth / 2 - qrSize) / 2;
      const qrY = qrSectionY + 20;
      
      // QR Code Header
      pdf.setFillColor(0, 0, 0);
      pdf.rect(rightColumnX - 5, qrSectionY - 8, contentWidth / 2 - 10, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CHECK-IN QR CODE', rightColumnX, qrSectionY);
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      
      // QR Code Border - thick black
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(3);
      pdf.rect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
      
      // Add QR code image
      const qrCodeImage = `data:image/png;base64,${ticketData.qrCodeData}`;
      pdf.addImage(qrCodeImage, 'PNG', qrX, qrY, qrSize, qrSize);
      
      // QR Code Instructions
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Present this QR code at the event', rightColumnX + 20, qrY + qrSize + 20, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.text('for instant check-in', rightColumnX + 20, qrY + qrSize + 30, { align: 'center' });
      
      // Ticket Number/ID at bottom
      const ticketIdY = contentStartY + contentHeight - 25;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Ticket ID: ${ticketData.participant.registrationId}`, pageWidth / 2, ticketIdY, { align: 'center' });
      
      // Footer
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Generated by STAMPED Event Management System', pageWidth / 2, pageHeight - 20, { align: 'center' });
      pdf.setFontSize(8);
      pdf.text(new Date().toLocaleString(), pageWidth / 2, pageHeight - 12, { align: 'center' });
      
      // Download the PDF
      pdf.save(`${ticketData.event.title.replace(/[^a-z0-9]/gi, '_')}-ticket.pdf`);
      
    } catch (error) {
      console.error('Ticket generation failed:', error);
      throw error; // Re-throw to allow error handling in parent component
    }
  };

  useImperativeHandle(ref, () => ({
    generateAndDownloadTicket
  }));

  return null; // This component doesn't render anything visible
});

TicketGenerator.displayName = 'TicketGenerator';

export default TicketGenerator;
