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

  // Simplified progress simulation - always fills completely
  useEffect(() => {
    if (!isComplete) {
      const now = Date.now();
      setStartTime(now);
      const duration = estimatedDuration || 15000; // Default 15 seconds
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - now;
        const calculatedProgress = Math.min((elapsed / duration) * 100, 100); // Always reach 100%
        
        setRealProgress(calculatedProgress);
        
        // Auto-complete when duration is reached
        if (calculatedProgress >= 100) {
          setRealProgress(100);
          setIsComplete(true);
          if (onComplete) {
            onComplete();
          }
          clearInterval(progressInterval);
        }
      }, 50); // Update every 50ms for smooth progress
      
      return () => clearInterval(progressInterval);
    }
  }, [isComplete, estimatedDuration, onComplete]);

  // Handle external progress updates
  useEffect(() => {
    if (progress > 0) {
      setRealProgress(progress);
      if (progress >= 100) {
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
      }
    }
  }, [progress, onComplete]);

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
    // Ensure completion callback is called
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
      setStartTime(null);
    }, 200); // Shorter delay for faster completion
  };

  const updateProgress = (newProgress: number) => {
    setProgress(newProgress);
  };

  // Auto-update progress based on time elapsed - always completes
  useEffect(() => {
    if (isLoading && startTime) {
      const duration = estimatedDuration || 15000; // Default 15 seconds
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const calculatedProgress = Math.min((elapsed / duration) * 100, 100); // Always reach 100%
        setProgress(calculatedProgress);
        
        // Auto-complete when duration is reached
        if (calculatedProgress >= 100) {
          setProgress(100);
          clearInterval(interval);
          // Auto-complete after reaching 100%
          setTimeout(() => {
            setIsLoading(false);
            setProgress(0);
            setStartTime(null);
          }, 200);
        }
      }, 50); // Update every 50ms for smooth progress

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
  LIGHTNING: 100,  // 0.1 seconds - lightning fast operations
  INSTANT: 500,    // 0.5 seconds - instant operations
  FAST: 3000,      // 3 seconds - quick operations
  NORMAL: 8000,    // 8 seconds - normal API calls
  SLOW: 15000,     // 15 seconds - heavy operations
  RENDER_COLD: 20000, // 20 seconds - Render.com cold starts
} as const;

// Smart duration selection based on operation type
export const getLoadingDuration = (operation: string, context?: any): number => {
  const operationLower = operation.toLowerCase();
  
  // Check for cold start first - this is the main issue
  if (context?.isFirstLoad || 
      context?.isColdStart || 
      operationLower.includes('cold') ||
      operationLower.includes('startup') ||
      operationLower.includes('first')) {
    return LOADING_DURATIONS.RENDER_COLD;
  }
  
  // Most operations are actually very fast (<500ms)
  // Lightning fast operations (0.1s) - for immediate feedback
  if (operationLower.includes('save') || 
      operationLower.includes('toggle') || 
      operationLower.includes('click') ||
      operationLower.includes('switch') ||
      operationLower.includes('update') ||
      operationLower.includes('delete') ||
      operationLower.includes('login') || 
      operationLower.includes('logout') ||
      operationLower.includes('navigate') ||
      operationLower.includes('redirect') ||
      operationLower.includes('fetch') || 
      operationLower.includes('load') ||
      operationLower.includes('get') ||
      operationLower.includes('search') ||
      operationLower.includes('create') || 
      operationLower.includes('register') ||
      operationLower.includes('submit')) {
    return LOADING_DURATIONS.LIGHTNING;
  }
  
  // Only heavy operations get longer durations
  if (operationLower.includes('export') || 
      operationLower.includes('generate') ||
      operationLower.includes('process') ||
      operationLower.includes('calculate') ||
      operationLower.includes('upload')) {
    return LOADING_DURATIONS.SLOW;
  }
  
  // Default to lightning for most operations
  return LOADING_DURATIONS.LIGHTNING;
};

// Context-aware loading duration selection
export const getContextualDuration = (context: {
  operation: string;
  isFirstLoad?: boolean;
  isColdStart?: boolean;
  isHeavyOperation?: boolean;
  isQuickOperation?: boolean;
}): number => {
  const { operation, isFirstLoad, isColdStart, isHeavyOperation, isQuickOperation } = context;
  
  // Cold start is the main issue - everything else is fast
  if (isFirstLoad || isColdStart) return LOADING_DURATIONS.RENDER_COLD;
  
  // Only heavy operations get longer durations
  if (isHeavyOperation) return LOADING_DURATIONS.SLOW;
  
  // Everything else is lightning fast (most operations <500ms)
  return LOADING_DURATIONS.LIGHTNING;
};
