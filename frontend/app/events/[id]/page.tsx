"use client";

import { useState, useEffect } from "react";
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
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OverlayLoading } from "@/components/ui/loading";

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
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      const token = localStorage.getItem("adminToken");
      const adminUserStr = localStorage.getItem("adminUser");

      if (token && adminUserStr) {
        try {
          const adminUser = JSON.parse(adminUserStr);
          setIsAuthenticated(true);
          setIsAdmin(true);
        } catch (error) {
          console.error("Error parsing admin user:", error);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchEventData = async () => {
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
        toast.error("Failed to load event");
        router.push("/events");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId, router]);

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

  const handleRegister = async () => {
    setIsRegistering(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Guest User", // This should be replaced with actual user input
            email: "guest@example.com", // This should be replaced with actual user input
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Registration successful!");
        router.push(
          `/events/${eventId}/thank-you?registrationId=${data.registrationId}`
        );
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error registering:", error);
      toast.error("Registration failed");
    } finally {
      setIsRegistering(false);
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

  if (loading) {
    return <OverlayLoading text="Loading Event..." />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Event Not Found
          </h1>
          <p className="text-muted-foreground mb-4">
            The event you're looking for doesn't exist.
          </p>
          <Link href="/events" className="text-primary hover:underline">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const isEventFull =
    event.maxParticipants && event.participantCount >= event.maxParticipants;
  const attendedCount = participants.filter((p) => p.attended).length;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <Link
              href={isAdmin ? "/dashboard" : "/events"}
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base"
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
        {/* Event Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl sm:text-3xl text-card-foreground mb-2">
                  {event.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  {event.description}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {!event.isActive && (
                  <span className="px-3 py-1 bg-muted text-muted-foreground text-sm font-semibold rounded-full">
                    Inactive
                  </span>
                )}
                {isEventFull && (
                  <span className="px-3 py-1 bg-chart-3/10 text-chart-3 text-sm font-semibold rounded-full">
                    Full
                  </span>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-5 w-5 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium text-foreground">
                    {formatDate(event.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-5 w-5 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Venue</p>
                  <p className="font-medium text-foreground">{event.venue}</p>
                </div>
              </div>

              <div className="flex items-center text-muted-foreground">
                <Users className="h-5 w-5 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="font-medium text-foreground">
                    {event.participantCount}
                    {event.maxParticipants
                      ? ` / ${event.maxParticipants}`
                      : ""}{" "}
                    registered
                  </p>
                </div>
              </div>

              <div className="flex items-center text-muted-foreground">
                <User className="h-5 w-5 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Organizer</p>
                  <p className="font-medium text-foreground">
                    {event.organizer.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Stats */}
            {isAdmin && participants.length > 0 && (
              <div className="border-t pt-4 mb-6">
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!isAdmin && event.isActive && !isEventFull && (
                <Button
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="flex-1"
                >
                  {isRegistering ? "Registering..." : "Register for Event"}
                </Button>
              )}

              {isAdmin && (
                <>
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
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Participants List (Admin Only) */}
        {isAdmin && showParticipants && participants.length > 0 && (
          <Card>
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
