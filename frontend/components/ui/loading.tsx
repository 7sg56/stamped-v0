'use client';

import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  className?: string;
  variant?: 'default' | 'overlay' | 'inline';
  progress?: number; // 0-100 for progress bar
  onComplete?: () => void; // Callback when loading completes
  estimatedDuration?: number; // Custom estimated duration in milliseconds
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

// Custom loading animation with blinking dots and progress bar
function CustomLoadingAnimation({ text = 'LOADING', progress = 0, onComplete, estimatedDuration }: { text?: string; progress?: number; onComplete?: () => void; estimatedDuration?: number }) {
  const [dotCount, setDotCount] = useState(0);
  const [realProgress, setRealProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4); // 0, 1, 2, 3 dots
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  // Real progress simulation based on actual time elapsed
  useEffect(() => {
    if (progress === 0 && !isComplete) {
      const now = Date.now();
      setStartTime(now);
      const duration = estimatedDuration || 20000; // Default 20 seconds for faster progress
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - now;
        const timeLeft = Math.max(0, duration - elapsed);
        const calculatedProgress = Math.min((elapsed / duration) * 100, 95); // Cap at 95% until real completion
        
        setRealProgress(calculatedProgress);
        
        // Stop at 95% to wait for actual completion
        if (calculatedProgress >= 95) {
          clearInterval(progressInterval);
        }
      }, 100); // Update every 100ms for faster, more responsive progress
      
      return () => clearInterval(progressInterval);
    } else if (progress > 0) {
      setRealProgress(progress);
    }
  }, [progress, isComplete, estimatedDuration]);

  // Handle completion
  useEffect(() => {
    if (onComplete && !isComplete) {
      const timer = setTimeout(() => {
        setRealProgress(100);
        setIsComplete(true);
        onComplete();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [onComplete, isComplete]);

  const dots = '.'.repeat(dotCount);
  const progressBars = 14; // Number of rectangular bars
  const filledBars = Math.floor((realProgress / 100) * progressBars);

  return (
    <div className="flex flex-col space-y-6">
      {/* Blinking dots text - left aligned */}
      <div className="text-4xl font-bold text-white text-left">
        {text}{dots}
      </div>
      
      {/* Progress bar made of rectangular divs */}
      <div className="flex space-x-1">
        {Array.from({ length: progressBars }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-3 h-8 border border-primary/30 transition-all duration-300',
              index < filledBars ? 'bg-white' : 'bg-transparent'
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function Loading({ 
  size = 'lg', 
  text, 
  fullScreen = false, 
  className,
  variant = 'default',
  progress,
  onComplete,
  estimatedDuration
}: LoadingProps) {
  // Always use custom animation with progress
  const content = <CustomLoadingAnimation text={text} progress={progress || 0} onComplete={onComplete} estimatedDuration={estimatedDuration} />;
  
  if (variant === 'overlay') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
        <div className="text-center text-primary-foreground">
          {content}
        </div>
      </div>
    );
  }

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

// Specialized loading components for common use cases
export function PageLoading({ text = 'LOADING', progress, onComplete, estimatedDuration }: { text?: string; progress?: number; onComplete?: () => void; estimatedDuration?: number }) {
  return <Loading text={text} fullScreen progress={progress} onComplete={onComplete} estimatedDuration={estimatedDuration} />
}

export function ButtonLoading({ text, onComplete, estimatedDuration }: { text: string; onComplete?: () => void; estimatedDuration?: number }) {
  return <Loading size="sm" text={text} variant="inline" onComplete={onComplete} estimatedDuration={estimatedDuration} />
}

export function OverlayLoading({ text, progress, onComplete, estimatedDuration }: { text: string; progress?: number; onComplete?: () => void; estimatedDuration?: number }) {
  return <Loading text={text} variant="overlay" progress={progress} onComplete={onComplete} estimatedDuration={estimatedDuration} />
}

export function InlineLoading({ text, size = 'md', onComplete, estimatedDuration }: { text?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; onComplete?: () => void; estimatedDuration?: number }) {
  return <Loading size={size} text={text} variant="inline" onComplete={onComplete} estimatedDuration={estimatedDuration} />
}

// Hook for managing loading state with real async operations
export function useLoadingWithProgress(estimatedDuration?: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setProgress(0);
    setStartTime(Date.now());
  };

  const completeLoading = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
      setStartTime(null);
    }, 500);
  };

  const updateProgress = (newProgress: number) => {
    setProgress(newProgress);
  };

  // Auto-update progress based on time elapsed with adaptive speed
  useEffect(() => {
    if (isLoading && startTime) {
      const duration = estimatedDuration || 20000; // Default 20 seconds for faster progress
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const calculatedProgress = Math.min((elapsed / duration) * 100, 95);
        setProgress(calculatedProgress);
        
        if (calculatedProgress >= 95) {
          clearInterval(interval);
        }
      }, 100); // Update every 100ms for faster, more responsive progress

      return () => clearInterval(interval);
    }
  }, [isLoading, startTime, estimatedDuration]);

  return {
    isLoading,
    progress,
    startLoading,
    completeLoading,
    updateProgress
  };
}

// Predefined durations for common operations
export const LOADING_DURATIONS = {
  FAST: 5000,      // 5 seconds - quick operations
  NORMAL: 15000,    // 15 seconds - normal API calls
  SLOW: 30000,      // 30 seconds - heavy operations
  RENDER_COLD: 45000, // 45 seconds - Render.com cold starts
} as const;
