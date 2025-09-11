'use client';

import Link from 'next/link';
import { Calendar, MapPin, Users, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
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

  const isEventFull = event.maxParticipants && event.participantCount >= event.maxParticipants;
  const isEventPast = new Date(event.date) < new Date();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl text-card-foreground mb-2">
              {event.title}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {event.description}
            </CardDescription>
          </div>
          <div className="ml-4">
            {!event.isActive && (
              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
                Inactive
              </span>
            )}
            {isEventPast && (
              <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-semibold rounded-full">
                Past Event
              </span>
            )}
            {isEventFull && (
              <span className="px-2 py-1 bg-chart-3/10 text-chart-3 text-xs font-semibold rounded-full">
                Full
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{event.venue}</span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {event.participantCount}
              {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} participants
            </span>
          </div>
          
          <div className="flex items-center text-muted-foreground">
            <User className="h-4 w-4 mr-2" />
            <span className="text-sm">
              Organized by {event.organizer?.username || 'Unknown Organizer'}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <Link href={`/events/${event._id}`}>
              View Details
            </Link>
          </Button>
          
          {event.isActive && !isEventPast && !isEventFull && (
            <Button variant="outline" asChild>
              <Link href={`/events/${event._id}`}>
                Register
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
