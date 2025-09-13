'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import TicketGenerator from '@/components/TicketGenerator';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  maxParticipants: number | null;
  isActive: boolean;
  participantCount: number;
  organizer: {
    username: string;
  };
}

interface RegistrationData {
  name: string;
  email: string;
  registrationId: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  description: string;
  qrCodeData: string;
}

export default function ThankYouPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  useEffect(() => {
    // Get registration data from URL params
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const registrationId = searchParams.get('registrationId');
    const eventTitle = searchParams.get('eventTitle');
    const eventDate = searchParams.get('eventDate');
    const venue = searchParams.get('venue');
    const description = searchParams.get('description');
    const qrCodeData = searchParams.get('qrCodeData');

    if (name && email && registrationId && eventTitle && eventDate && venue && qrCodeData) {
      setRegistrationData({
        name,
        email,
        registrationId,
        eventTitle,
        eventDate,
        venue,
        description: description || '',
        qrCodeData
      });
      
      // Create event object from URL params
      setEvent({
        _id: eventId,
        title: eventTitle,
        description: description || '',
        date: eventDate,
        venue,
        maxParticipants: null,
        isActive: true,
        participantCount: 0,
        organizer: { username: 'Event Organizer' }
      });
      
      setLoading(false);
    } else {
      toast.error('Invalid registration data');
      router.push('/events');
    }
  }, [eventId, searchParams, router]);


  const handleDownloadTicket = () => {
    if (registrationData) {
      // Trigger ticket generation
      const ticketGenerator = document.createElement('div');
      ticketGenerator.innerHTML = '<div id="ticket-trigger"></div>';
      document.body.appendChild(ticketGenerator);
      
      // Remove after a moment
      setTimeout(() => {
        document.body.removeChild(ticketGenerator);
      }, 100);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8 sm:py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event || !registrationData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Registration Not Found</h1>
            <Link
              href="/events"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/events"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">Registration Complete</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="container py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="bg-card rounded-lg shadow-md p-6 sm:p-8 text-center border mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Registration Successful!</h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-6">
              Thank you for registering for <strong>{event.title}</strong>. 
              Your registration has been confirmed.
            </p>
            
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <FileText className="h-5 w-5 text-primary mr-2" />
                <span className="text-primary font-medium">Your Ticket</span>
              </div>
              <p className="text-primary text-sm">
                Download your personalized event ticket with QR code below.
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadTicket}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors mb-6"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Ticket
            </button>
          </div>

          {/* Event Details */}
          <div className="bg-card rounded-lg shadow-md p-6 sm:p-8 border mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Event Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Date & Time</p>
                  <p className="text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Venue</p>
                  <p className="text-muted-foreground">{event.venue}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Participants</p>
                  <p className="text-muted-foreground">
                    {event.participantCount} registered
                    {event.maxParticipants && ` (max ${event.maxParticipants})`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-medium text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          </div>

          {/* Registration Details */}
          <div className="bg-card rounded-lg shadow-md p-6 sm:p-8 border mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Your Registration</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Name:</span>
                <span className="text-muted-foreground">{registrationData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Email:</span>
                <span className="text-muted-foreground">{registrationData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Registration ID:</span>
                <span className="text-muted-foreground font-mono text-sm">{registrationData.registrationId}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-muted/50 border border-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">What happens next?</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Download and save your ticket to your device</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Bring the QR code to the event for easy check-in</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Your attendance will be automatically tracked</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Keep your registration ID for reference</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              href="/events"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
            >
              Browse More Events
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-border text-base font-medium rounded-md text-foreground bg-card hover:bg-muted transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </main>

      {/* Auto-generate ticket when component mounts */}
      {registrationData && (
        <TicketGenerator
          ticketData={{
            participant: {
              name: registrationData.name,
              email: registrationData.email,
              registrationId: registrationData.registrationId
            },
            event: {
              title: registrationData.eventTitle,
              description: registrationData.description,
              date: registrationData.eventDate,
              venue: registrationData.venue
            },
            qrCodeData: registrationData.qrCodeData
          }}
        />
      )}
    </div>
  );
}
