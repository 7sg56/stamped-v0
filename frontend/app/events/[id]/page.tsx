"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  User,
  QrCode,
  Shield,
  Clock,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/loading";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  maxParticipants?: number;
  isActive: boolean;
  participantCount: number;
  organizer: {
    _id: string;
    username: string;
  };
}

interface RegistrationData {
  name: string;
  email: string;
}

interface Participant {
  _id: string;
  name: string;
  email: string;
  registrationId: string;
  createdAt: string;
  attended: boolean;
  attendanceTime?: string;
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    name: "",
    email: "",
  });

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      const token = localStorage.getItem("adminToken");
      const adminUserStr = localStorage.getItem("adminUser");

      if (token && adminUserStr) {
        try {
          JSON.parse(adminUserStr);
          setIsAdmin(true);
        } catch (error) {
          console.error("Error parsing admin user:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAuth();
  }, []);

  const fetchEvent = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`
      );
      const data = await response.json();

      if (data.success) {
        setEvent(data.event);
      } else {
        toast.error("Event not found");
        router.push("/events");
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Failed to fetch event details");
      router.push("/events");
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

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [eventId, fetchEvent]);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!isAdmin || !event) return;

      try {
        const token = localStorage.getItem("adminToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/registrations/event/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (data.success) {
          setParticipants(data.data.registrations);
        }
      } catch (error) {
        console.error("Error fetching participants:", error);
        toast.error("Failed to load participants");
      }
    };

    fetchParticipants();
  }, [eventId, isAdmin, event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/registrations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...registrationData,
            eventId: eventId,
          }),
        }
      );

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
          description: event?.description || "",
          qrCodeData: data.registration.qrCodeData,
        });
        router.push(`/events/${eventId}/thank-you?${searchParams.toString()}`);
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Note: Past events are automatically paused, so they won't be accessible
  if (loading) {
    return <PageLoading text="LOADING" />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Event Not Found
          </h2>
          <Link href="/events" className="text-primary hover:text-primary/80">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const isEventFull = () => {
    return !!(
      event?.maxParticipants && event.participantCount >= event.maxParticipants
    );
  };
  const attendedCount = participants.filter((p) => p.attended).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <Link
              href={isAdmin ? "/dashboard" : "/events"}
              className="flex items-center text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">
                {isAdmin ? "Back to Dashboard" : "Back to Events"}
              </span>
              <span className="sm:hidden">Back</span>
            </Link>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Link href={`/events/${eventId}/scanner`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Scanner</span>
                    <span className="sm:hidden">Scan</span>
                  </Button>
                </Link>
                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Admin View</span>
                  <span className="sm:hidden">Admin</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Event Details */}
          <div className="bg-card rounded-lg shadow-md p-4 sm:p-6 border">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
              {event.title}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              {event.description}
            </p>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                <span className="text-sm sm:text-base">
                  {formatDate(event.date)}
                </span>
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

              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                <span className="text-sm sm:text-base">
                  Organized by {event.organizer.username}
                </span>
              </div>
            </div>

            {isEventFull() && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-xs sm:text-sm">
                  <strong>Event Full:</strong> This event has reached its
                  maximum capacity.
                </p>
              </div>
            )}

            {/* Admin Stats */}
            {isAdmin && participants.length > 0 && (
              <div className="mt-4 sm:mt-6 border-t pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">
                      {participants.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Registered
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {attendedCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Attended</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {participants.length - attendedCount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Not Attended
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Action Buttons */}
            {isAdmin && (
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3">
                <Link href={`/events/${eventId}/scanner`} className="flex-1">
                  <Button className="w-full">
                    <QrCode className="h-4 w-4 mr-2" />
                    Open Scanner
                  </Button>
                </Link>

                {participants.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="flex-1"
                  >
                    {showParticipants ? "Hide" : "Show"} Participants
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Registration Form (Public Users Only) */}
          {!isAdmin && (
            <div className="bg-card rounded-lg shadow-md p-4 sm:p-6 border">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6">
                Register for Event
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={registrationData.name}
                    onChange={(e) =>
                      setRegistrationData({
                        ...registrationData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-3 sm:py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring text-foreground text-base sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={registrationData.email}
                    onChange={(e) =>
                      setRegistrationData({
                        ...registrationData,
                        email: e.target.value,
                      })
                    }
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
                      ? "bg-muted cursor-not-allowed"
                      : "bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                  }`}
                >
                  {submitting ? "Registering..." : "Register for Event"}
                </button>
              </form>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/50 border border-border rounded-lg">
                <h3 className="text-sm font-medium text-foreground mb-2">
                  What happens next?
                </h3>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <li>
                    • You&apos;ll receive a digital ticket with your QR code
                  </li>
                  <li>• Bring the QR code to the event for easy check-in</li>
                  <li>• Your attendance will be automatically tracked</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Participants List (Admin Only) */}
        {isAdmin && showParticipants && participants.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Participants ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {participant.attended ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-orange-500" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">
                            {participant.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {participant.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono text-muted-foreground">
                        ID: {participant.registrationId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Registered: {formatDateTime(participant.createdAt)}
                      </p>
                      {participant.attended && participant.attendanceTime && (
                        <p className="text-xs text-green-600">
                          Attended: {formatDateTime(participant.attendanceTime)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
