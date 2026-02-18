'use client';

import { forwardRef, useImperativeHandle } from 'react';
import { generateAndDownloadTicket, TicketData } from '@/lib/ticket-utils';

interface TicketGeneratorProps {
  ticketData: TicketData;
}

export interface TicketGeneratorRef {
  generateAndDownloadTicket: () => Promise<void>;
}

const TicketGenerator = forwardRef<TicketGeneratorRef, TicketGeneratorProps>(({ ticketData }, ref) => {
  const handleGenerateAndDownload = async () => {
    await generateAndDownloadTicket(ticketData);
  };

  useImperativeHandle(ref, () => ({
    generateAndDownloadTicket: handleGenerateAndDownload
  }));

  return null;
});

TicketGenerator.displayName = 'TicketGenerator';

export default TicketGenerator;
