'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLoading } from '@/components/ui/loading';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  maxParticipants?: number;
  participantCount: number;
}

interface RegistrationData {
  name: string;
  email: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    name: '',
    email: ''
  });

  const fetchEvent = useCallback(async () => {
    try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`);
      const data = await response.json();
      
      if (data.success) {
        setEvent(data.event);
      } else {
        toast.error('Event not found');
        router.push('/events');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to fetch event details');
      router.push('/events');
    } finally {
      setLoading(false);
    }
  }, [eventId, router]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
    
    // Refresh when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden && eventId) {
        fetchEvent();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [eventId, fetchEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...registrationData,
          eventId: eventId
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to thank you page with registration data
        const searchParams = new URLSearchParams({
          name: data.registration.name,
          email: data.registration.email,
          registrationId: data.registration.registrationId,
          eventTitle: data.registration.eventTitle,
          eventDate: data.registration.eventDate,
          venue: data.registration.venue,
          description: event?.description || '',
          qrCodeData: data.registration.qrCodeData
        });
        
        router.push(`/events/${eventId}/thank-you?${searchParams.toString()}`);
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventFull = () => {
    return !!(event?.maxParticipants && event.participantCount >= event.maxParticipants);
  };

  // Note: Past events are automatically paused, so they won't be accessible

  if (loading) {
    return <PageLoading text="LOADING" />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h2>
          <Link href="/events" className="text-primary hover:text-primary/80">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container">
          <div className="flex items-center py-4 sm:py-6">
            <Link href="/events" className="flex items-center text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Back to Events</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Event Details */}
          <div className="bg-card rounded-lg shadow-md p-4 sm:p-6 border">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4">{event.title}</h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">{event.description}</p>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                <span className="text-sm sm:text-base">{formatDate(event.date)}</span>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                <span className="text-sm sm:text-base">{event.venue}</span>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                <span className="text-sm sm:text-base">
                  {event.participantCount} registered
                  {event.maxParticipants && ` / ${event.maxParticipants} max`}
                </span>
              </div>
            </div>

            {isEventFull() && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-xs sm:text-sm">
                  <strong>Event Full:</strong> This event has reached its maximum capacity.
                </p>
              </div>
            )}

          </div>

          {/* Registration Form */}
          <div className="bg-card rounded-lg shadow-md p-4 sm:p-6 border">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6">Register for Event</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={registrationData.name}
                  onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                  className="w-full px-3 py-3 sm:py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring text-foreground text-base sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={registrationData.email}
                  onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                  className="w-full px-3 py-3 sm:py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring text-foreground text-base sm:text-sm"
                  placeholder="Enter your email address"
                />
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Your QR code will be generated for this email address
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || isEventFull()}
                className={`w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground transition-colors ${
                  submitting || isEventFull()
                    ? 'bg-muted cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring'
                }`}
              >
                {submitting ? 'Registering...' : 'Register for Event'}
              </button>
            </form>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/50 border border-border rounded-lg">
              <h3 className="text-sm font-medium text-foreground mb-2">What happens next?</h3>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li>• You&apos;ll receive a digital ticket with your QR code</li>
                <li>• Bring the QR code to the event for easy check-in</li>
                <li>• Your attendance will be automatically tracked</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
