'use client';

import Link from 'next/link';
import { QrCode, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/spotlight';

// Clean Professional Stamp Logo Component
const StampLogo = ({ size = "w-10 h-10", className = "", animated = false }) => {
  const isLarge = size.includes('w-80') || size.includes('w-96') || size.includes('28rem');
  
  return (
    <div className={`${size} ${className} relative`}>
      {/* Outer rotating ring - clean and simple */}
      <div 
        className={`absolute inset-0 border-2 border-primary/30 rounded-lg rotate-12 ${animated ? 'animate-spin' : ''}`}
        style={{ animationDuration: '8s' }}
      ></div>
      
      {/* Inner rotating ring - counter rotation */}
      <div 
        className={`absolute inset-1 border border-primary/50 rounded-md rotate-6 ${animated ? 'animate-reverse-spin' : ''}`}
        style={{ animationDuration: '6s' }}
      ></div>
      
      {/* Main stamp body - clean gradient */}
      <div className="absolute inset-2 bg-gradient-to-br from-primary to-primary/80 rounded-sm flex items-center justify-center shadow-sm">
        {/* Simple center dot */}
        <div className={`${isLarge ? 'w-4 h-4' : 'w-2 h-2'} bg-primary-foreground rounded-full`}></div>
      </div>
      
      {/* Subtle stamp impression */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-primary/10 rounded-lg"></div>
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Subtle wavy background effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 via-transparent to-primary/20 transform -skew-y-1"></div>
        <div className="absolute top-20 left-0 w-full h-full bg-gradient-to-l from-primary/10 via-transparent to-primary/10 transform skew-y-1"></div>
      </div>
      
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <StampLogo size="w-10 h-10" className="mr-3" />
              <h1 className="text-2xl font-bold text-foreground font-orbitron tracking-wider">STAMPED</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link 
                href="/scanner" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                QR Scanner
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login" className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Login
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Page */}
      <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        {/* Spotlight Effect */}
        <Spotlight className="-top-[48rem] -left-60 animate-spotlight" fill="white" />
        <div className="text-center max-w-5xl mx-auto relative z-10">
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-foreground mb-8 leading-tight">
            <span className="block font-orbitron font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60 hover:from-primary/80 hover:via-primary hover:to-primary/80 transition-all duration-500 cursor-default transform hover:scale-105">
              STAMPED
            </span>
            <span className="block text-4xl md:text-5xl lg:text-6xl font-playfair font-semibold text-primary/90 mt-2 hover:text-primary transition-colors duration-300 cursor-default">
              Event Management
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-muted-foreground mb-16 max-w-3xl mx-auto font-medium leading-relaxed">
            The <span className="text-primary font-bold">ultimate platform</span> for seamless event registration, 
            instant QR check-ins, and real-time analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/events">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center">
                <StampLogo size="w-6 h-6" className="mr-3" />
                Explore Events
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
            </Link>
            <Link href="/scanner">
              <Button variant="outline" size="lg" className="border-2 border-primary/30 text-primary hover:bg-primary/10 px-12 py-4 text-lg font-bold rounded-xl backdrop-blur-sm transition-all duration-300 flex items-center">
                <QrCode className="h-6 w-6 mr-3" />
                Try Scanner
              </Button>
            </Link>
          </div>
          
          <div className="mt-16 text-sm text-muted-foreground">
            Trusted by <span className="text-primary font-semibold">10,000+</span> event organizers worldwide
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <StampLogo size="w-8 h-8" />
              </div>
            <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Discover Events</h3>
            <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              Browse through exciting events and register for the ones that interest you.
            </p>
          </div>
          
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
              <QrCode className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Quick Check-in</h3>
            <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              Fast and secure event check-in using QR codes. No more waiting in lines.
            </p>
          </div>
          
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Secure & Reliable</h3>
            <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              Enterprise-grade security with real-time analytics and data export.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <StampLogo size="w-10 h-10" className="mr-3" />
            <h3 className="text-xl font-bold text-foreground font-orbitron tracking-wider">STAMPED</h3>
          </div>
            <p className="text-muted-foreground mb-6">
              The future of event management and attendance tracking
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/events" className="text-muted-foreground hover:text-foreground transition-colors">
                Events
              </Link>
              <Link href="/scanner" className="text-muted-foreground hover:text-foreground transition-colors">
                QR Scanner
              </Link>
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}