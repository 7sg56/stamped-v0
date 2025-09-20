'use client';

import Link from 'next/link';
import { QrCode, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/spotlight';
import { ShootingStars } from '@/components/ui/shooting-stars';
import { StarsBackground } from '@/components/ui/stars-background';

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
    <div className="min-h-screen relative overflow-hidden">
      
      <StarsBackground 
        starDensity={0.0004} 
        allStarsTwinkle={true} 
        twinkleProbability={0.7}
        minTwinkleSpeed={0.3}
        maxTwinkleSpeed={0.8}
      />
      <ShootingStars 
        minSpeed={10}
        maxSpeed={30}
        minDelay={4200}
        maxDelay={8700}
        starColor="#9E00FF"
        trailColor="#2EB9DF"
        starWidth={10}
        starHeight={1}
      />
      
      {/* Subtle wavy background effect */}
      <div className="absolute inset-0 opacity-5 z-[-5]">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 via-transparent to-primary/20 transform -skew-y-1"></div>
        <div className="absolute top-20 left-0 w-full h-full bg-gradient-to-l from-primary/10 via-transparent to-primary/10 transform skew-y-1"></div>
      </div>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-2 sm:pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-border/30 bg-background/60 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg">
            <div className="flex justify-between items-center py-2 sm:py-3 px-3 sm:px-6">
              <div className="flex items-center">
                <StampLogo size="w-6 h-6 sm:w-8 sm:h-8" className="mr-2" />
                <h1 className="text-lg sm:text-xl font-bold text-foreground font-orbitron tracking-wider">STAMPED</h1>
              </div>
              <nav className="flex items-center space-x-2 sm:space-x-6">
                <Link 
                  href="/events" 
                  className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
                >
                  Events
                </Link>
                <Button variant="outline" size="sm" asChild className="h-8 px-3 sm:px-4 text-xs sm:text-sm">
                  <Link href="/auth/login" className="flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Page */}
      <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative pt-16 sm:pt-20">
        {/* Spotlight Effect */}
        <Spotlight className="-top-[40rem] -left-60 animate-spotlight" fill="white" />
        <div className="text-center max-w-6xl mx-auto relative z-10">
          
          <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-black text-foreground mb-4 sm:mb-6 leading-tight">
            <span className="block font-orbitron font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60 cursor-default">
              STAMPED
            </span>
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair font-semibold text-primary/90 mt-1 cursor-default">
              Event Management
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto font-medium leading-relaxed px-4">
            The <span className="text-primary font-semibold">ultimate platform</span> for seamless event registration, 
            instant QR check-ins, and real-time analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-4">
            <Link href="/events" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                <StampLogo size="w-4 h-4 sm:w-5 sm:h-5" className="mr-2" />
                Explore Events
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border border-primary/30 text-primary hover:bg-primary/10 px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Register as Admin
              </Button>
            </Link>
          </div>
          
          <div className="text-xs sm:text-sm text-muted-foreground px-4">
            Trusted by <span className="text-primary font-semibold">10,000+</span> event organizers worldwide
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="container py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose <span className="text-primary">STAMPED</span>?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Experience the future of event management with our cutting-edge platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center group p-4 sm:p-6 rounded-xl hover:bg-card/50 transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
              <StampLogo size="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Discover Events</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Browse through exciting events and register for the ones that interest you.
            </p>
          </div>
          
          <div className="text-center group p-4 sm:p-6 rounded-xl hover:bg-card/50 transition-all duration-300">
            <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
              <QrCode className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Quick Check-in</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Fast and secure event check-in using QR codes. No more waiting in lines.
            </p>
          </div>
          
          <div className="text-center group p-4 sm:p-6 rounded-xl hover:bg-card/50 transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">Secure & Reliable</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Enterprise-grade security with real-time analytics and data export.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm mt-12 sm:mt-20">
        <div className="container py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <StampLogo size="w-6 h-6 sm:w-8 sm:h-8" className="mr-2" />
              <h3 className="text-base sm:text-lg font-bold text-foreground font-orbitron tracking-wider">STAMPED</h3>
            </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-4 px-4">
                Built with ❤️ by <a href="https://github.com/7sg56" className="text-primary hover:text-primary/80 transition-colors duration-200">Sourish Ghosh</a>
              </div>
          </div>
        </div>
      </footer>
    </div>
  );
}