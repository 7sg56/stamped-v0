'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Users, 
  Plus, 
  Eye, 
  Download, 
  LogOut,
  TrendingUp,
  Clock,
  QrCode
} from 'lucide-react';
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
  attendedCount: number;
  isActive: boolean;
}

interface AdminUser {
  id: string;
  username: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  // Remove aggregated stats - we'll show per-event stats instead

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');

    if (!token || !user) {
      router.push('/login');
      return;
    }

    try {
      setAdminUser(JSON.parse(user));
    } catch (error) {
      console.error('Error parsing admin user:', error);
      router.push('/login');
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
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleVisibilityChange);
      };
    }
  }, [adminUser]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events);
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

  // Removed calculateStats function - we'll show per-event stats instead

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportEventData = async (eventId: string, eventTitle: string) => {
    try {
      const token = localStorage.getItem('adminToken');
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/export/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${eventTitle.replace(/[^a-z0-9]/gi, '_')}_attendance.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Export started');
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
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
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Admin Dashboard</h1>
            </div>
            <div className="flex items-center justify-between sm:space-x-4">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Welcome, <strong className="text-foreground">{adminUser?.username}</strong>
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
        {/* Event Statistics Overview */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Event Statistics Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => {
              const attendanceRate = event.participantCount > 0 
                ? Math.round((event.attendedCount / event.participantCount) * 100 * 100) / 100 
                : 0;
              
              return (
                <div key={event._id} className="bg-card rounded-lg border p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-medium text-foreground mb-3 truncate">{event.title}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">Registrations:</span>
                      <span className="text-xs sm:text-sm font-medium text-foreground">{event.participantCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">Attended:</span>
                      <span className="text-xs sm:text-sm font-medium text-foreground">{event.attendedCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">Attendance Rate:</span>
                      <span className="text-xs sm:text-sm font-medium text-foreground">{attendanceRate}%</span>
                    </div>
                    {event.maxParticipants && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Capacity:</span>
                        <span className="text-xs sm:text-sm font-medium text-foreground">
                          {event.participantCount}/{event.maxParticipants}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">Status:</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        event.isActive 
                          ? 'bg-chart-2/10 text-chart-2' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {event.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {events.length === 0 && (
            <div className="text-center py-6 sm:py-8">
              <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground">No events created yet</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/events/create"
              className="inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Event
            </Link>
            <Link
              href="/scanner"
              className="inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-border text-sm font-medium rounded-md shadow-sm text-foreground bg-card hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Scanner
            </Link>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-card shadow overflow-hidden sm:rounded-md border">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-foreground">Events</h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Manage your events and view attendance statistics
            </p>
          </div>
          
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first event to get started</p>
              <Link
                href="/events/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {events.map((event) => (
                <li key={event._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-foreground truncate">
                            {event.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {!event.isActive && (
                              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
                                Inactive
                              </span>
                            )}
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                              {event.participantCount} registered
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-muted-foreground space-x-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {event.venue}
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {event.attendedCount} attended
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <Link
                          href={`/events/admin/${event._id}`}
                          className="inline-flex items-center px-3 py-1 border border-border text-xs font-medium rounded text-foreground bg-card hover:bg-muted hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 active:bg-muted/80 active:scale-95 transition-all duration-150"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Link>
                        <button
                          onClick={() => exportEventData(event._id, event.title)}
                          className="inline-flex items-center px-3 py-1 border border-border text-xs font-medium rounded text-foreground bg-card hover:bg-muted hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 active:bg-muted/80 active:scale-95 transition-all duration-150"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
