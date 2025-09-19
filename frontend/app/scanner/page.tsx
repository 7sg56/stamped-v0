'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, QrCode, Shield, Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OverlayLoading } from '@/components/ui/loading';

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
    _id: string;
    username: string;
  };
}

export default function ScannerSelectorPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      const adminUserStr = localStorage.getItem('adminUser');
      
      if (!token || !adminUserStr) {
        setIsAuthenticated(false);
        toast.error('Access denied. Admin authentication required.');
        router.push('/login');
        return;
      }
      
      try {
        JSON.parse(adminUserStr);
        setIsAuthenticated(true);
        fetchEvents();
      } catch (error) {
        console.error('Error parsing admin user:', error);
        setIsAuthenticated(false);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Filter only active events for scanning
        const activeEvents = data.events.filter((event: Event) => event.isActive);
        setEvents(activeEvents);
      } else {
        toast.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = (eventId: string) => {
    router.push(`/events/${eventId}/scanner`);
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

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Admin authentication required to access the scanner.</p>
          <Link href="/login" className="text-primary hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <OverlayLoading text="Loading Events..." />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Select Event to Scan</span>
              <span className="sm:hidden">Select Event</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <QrCode className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Event Scanner</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Select an event to open its dedicated scanner. Each scanner only accepts QR codes for that specific event.
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Security Enhancement</h3>
              <p className="text-sm text-muted-foreground">
                For security reasons, we now use event-specific scanners. This prevents cross-event attendance issues 
                and ensures each QR code can only be used for its intended event.
              </p>
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl sm:text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Active Events</h3>
            <p className="text-muted-foreground px-4">
              There are currently no active events available for scanning. 
              Create an event or activate existing events to use the scanner.
            </p>
            <Link href="/events/create" className="mt-4 inline-block">
              <Button>Create New Event</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {events.map((event) => (
                <Card key={event._id} className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-card-foreground mb-2">
                          {event.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm line-clamp-2">
                          {event.description}
                        </CardDescription>
                      </div>
                      <QrCode className="h-6 w-6 text-primary" />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-muted-foreground text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      
                      <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.venue}</span>
                      </div>
                      
                      <div className="flex items-center text-muted-foreground text-sm">
                        <Users className="h-4 w-4 mr-2" />
                        <span>
                          {event.participantCount}
                          {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} participants
                        </span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleEventSelect(event._id)}
                      className="w-full group-hover:bg-primary/90"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Open Scanner
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-card border rounded-lg p-6">
              <h3 className="text-lg font-medium text-foreground mb-3">How Event-Specific Scanners Work</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>• Each event has its own dedicated scanner for security</li>
                <li>• Scanners only accept QR codes generated for that specific event</li>
                <li>• This prevents accidental cross-event attendance marking</li>
                <li>• Users registered for multiple events get separate QR codes for each</li>
                <li>• Attendance can only be marked at the correct event scanner</li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
