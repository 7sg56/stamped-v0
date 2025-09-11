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
      <header className="fixed top-0 left-0 right-0 z-50 pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-border/30 bg-background/60 backdrop-blur-xl rounded-2xl shadow-lg">
            <div className="flex justify-between items-center py-3 px-6">
              <div className="flex items-center">
                <StampLogo size="w-8 h-8" className="mr-2" />
                <h1 className="text-xl font-bold text-foreground font-orbitron tracking-wider">STAMPED</h1>
              </div>
              <nav className="flex items-center space-x-6">
                <Link 
                  href="/events" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
                >
                  Events
                </Link>
                <Button variant="outline" size="sm" asChild className="h-8 px-4 text-sm">
                  <Link href="/login" className="flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    Login
                  </Link>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Page */}
      <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative pt-20">
        {/* Spotlight Effect */}
        <Spotlight className="-top-[48rem] -left-60 animate-spotlight" fill="white" />
        <div className="text-center max-w-6xl mx-auto relative z-10">
          
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-foreground mb-6 leading-tight">
            <span className="block font-orbitron font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60 hover:from-primary/80 hover:via-primary hover:to-primary/80 transition-all duration-500 cursor-default">
              STAMPED
            </span>
            <span className="block text-3xl md:text-4xl lg:text-5xl font-playfair font-semibold text-primary/90 mt-1 hover:text-primary transition-colors duration-300 cursor-default">
              Event Management
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            The <span className="text-primary font-semibold">ultimate platform</span> for seamless event registration, 
            instant QR check-ins, and real-time analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/events">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center">
                <StampLogo size="w-5 h-5" className="mr-2" />
                Explore Events
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="border border-primary/30 text-primary hover:bg-primary/10 px-8 py-3 text-base font-semibold rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Register as Admin
              </Button>
            </Link>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Trusted by <span className="text-primary font-semibold">10,000+</span> event organizers worldwide
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose <span className="text-primary">STAMPED</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of event management with our cutting-edge platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group p-6 rounded-xl hover:bg-card/50 transition-all duration-300">
            <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
              <StampLogo size="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Discover Events</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Browse through exciting events and register for the ones that interest you.
            </p>
          </div>
          
          <div className="text-center group p-6 rounded-xl hover:bg-card/50 transition-all duration-300">
            <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
              <QrCode className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Quick Check-in</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Fast and secure event check-in using QR codes. No more waiting in lines.
            </p>
          </div>
          
          <div className="text-center group p-6 rounded-xl hover:bg-card/50 transition-all duration-300">
            <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Secure & Reliable</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Enterprise-grade security with real-time analytics and data export.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <StampLogo size="w-8 h-8" className="mr-2" />
              <h3 className="text-lg font-bold text-foreground font-orbitron tracking-wider">STAMPED</h3>
            </div>
              <div className="text-sm text-muted-foreground mt-4">
                Built with ❤️ by <a href="https://github.com/7sg56" className="text-primary hover:text-primary/80 transition-colors duration-200">Sourish Ghosh</a>
              </div>
          </div>
        </div>
      </footer>
    </div>
  );
}