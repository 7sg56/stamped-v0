"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Eye,
  Download,
  LogOut,
  QrCode,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageLoading } from "@/components/ui/loading";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  maxParticipants?: number;
  participantCount: number;
  attendedCount: number;
  isActive: boolean;
  organizer?: {
    username: string;
  };
}

interface AdminUser {
  id: string;
  username: string;
  role?: string;
  isSuperAdmin?: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  // Remove aggregated stats - we'll show per-event stats instead

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUser");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    try {
      setAdminUser(JSON.parse(user));
    } catch (error) {
      console.error("Error parsing admin user:", error);
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (adminUser) {
      fetchEvents();

      // Refresh when page becomes visible (user navigates back)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          fetchEvents();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("focus", handleVisibilityChange);

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        window.removeEventListener("focus", handleVisibilityChange);
      };
    }
  }, [adminUser]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
      } else {
        toast.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  // Removed calculateStats function - we'll show per-event stats instead

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    toast.success("Logged out successfully");
    router.push("/");
  };



  const exportEventData = async (eventId: string, eventTitle: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/export/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${eventTitle.replace(
          /[^a-z0-9]/gi,
          "_"
        )}_attendance.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Export started");
      } else {
        toast.error("Failed to export data");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  if (loading) {
    return <PageLoading text="LOADING" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-3" />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center justify-between sm:space-x-4">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Welcome,{" "}
                <strong className="text-foreground">
                  {adminUser?.username}
                </strong>
                {adminUser?.isSuperAdmin && (
                  <span className="ml-2 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-semibold">
                    SUPERADMIN
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-muted-foreground hover:text-destructive transition-colors text-sm"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        {/* Events & Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
            Events & Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Create New Event Card */}
            <Link href="/events/create" className="group">
              <div className="bg-zinc-950/80 backdrop-blur-sm rounded-xl border border-zinc-900 p-6 hover:border-zinc-700 hover:bg-zinc-950/90 transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full flex flex-col items-center justify-center min-h-[240px] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/10 to-zinc-900/20"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="p-4 rounded-full bg-zinc-800/50 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="h-8 w-8 text-zinc-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white text-center">
                    Create Event
                  </h3>
                  <p className="text-sm text-zinc-500 mt-2 text-center">
                    Start something new
                  </p>
                </div>
              </div>
            </Link>

            {/* Existing Events */}
            {events.map((event) => {
              const attendanceRate =
                event.participantCount > 0
                  ? Math.round(
                      (event.attendedCount / event.participantCount) * 100 * 100
                    ) / 100
                  : 0;

              return (
                <div
                  key={event._id}
                  className="bg-card rounded-lg border p-3 sm:p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base sm:text-lg font-medium text-foreground truncate">
                      {event.title}
                    </h3>
                    {adminUser?.isSuperAdmin && event.organizer && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        by {event.organizer.username}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Registrations:
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        {event.participantCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Attended:
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        {event.attendedCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Attendance Rate:
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        {attendanceRate}%
                      </span>
                    </div>
                    {event.maxParticipants && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Capacity:
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-foreground">
                          {event.participantCount}/{event.maxParticipants}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Status:
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          event.isActive
                            ? "bg-chart-2/10 text-chart-2"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {event.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Inline Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <Link
                      href={`/events/admin/${event._id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-border text-xs font-medium rounded text-foreground bg-background hover:bg-muted hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 active:bg-muted/80 active:scale-95 transition-all duration-150"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Manage
                    </Link>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/events/${event._id}/scanner`}
                        className="inline-flex items-center px-3 py-1.5 border border-border text-xs font-medium rounded text-foreground bg-background hover:bg-muted hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 active:bg-muted/80 active:scale-95 transition-all duration-150"
                      >
                        <QrCode className="h-3 w-3 mr-1" />
                        Scanner
                      </Link>
                      <button
                        onClick={() => exportEventData(event._id, event.title)}
                        className="inline-flex items-center px-3 py-1.5 border border-border text-xs font-medium rounded text-foreground bg-background hover:bg-muted hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 active:bg-muted/80 active:scale-95 transition-all duration-150"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {events.length === 0 && (
            <div className="text-center py-8 col-span-full">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Ready to get started?
              </h3>
              <p className="text-muted-foreground">
                Click the &quot;Create New Event&quot; card above to create your first
                event!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
