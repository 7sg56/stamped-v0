"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import EventCard from "@/components/EventCard";
import { PageLoading } from "@/components/ui/loading";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  maxParticipants?: number;
  participantCount: number;
  isActive: boolean;
  organizer?: {
    _id: string;
    username: string;
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();

    // Set up periodic refresh every 30 seconds to keep participant counts updated
    const refreshInterval = setInterval(fetchEvents, 30000);

    // Refresh when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchEvents();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, []);

  const fetchEvents = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
        if (isManualRefresh) {
          toast.success("Events updated");
        }
      } else {
        toast.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchEvents(true);
  };

  if (loading) {
    return <PageLoading text="LOADING" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <Link
              href="/"
              className="flex items-center text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Available Events
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Browse through all available events and register for the ones
            you&apos;d like to attend. You&apos;ll receive a digital ticket with
            QR code after registration.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-4">📅</div>
            <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
              No Events Available
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              There are currently no active events. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
