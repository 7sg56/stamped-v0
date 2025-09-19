'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, QrCode, CheckCircle, XCircle, Camera, CameraOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import QrScanner from 'qr-scanner';
import { OverlayLoading } from '@/components/ui/loading';

interface AttendanceResult {
  success: boolean;
  message: string;
  data?: {
    participant?: {
      name: string;
      email: string;
      registrationId: string;
      attendanceTime: string;
    };
    event?: {
      id: string;
      title: string;
      date: string;
      venue: string;
    };
    // For duplicate attendance errors
    name?: string;
    eventTitle?: string;
    attendanceTime?: string;
  };
}

export default function ScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null); 
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState<AttendanceResult | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      const adminUser = localStorage.getItem('adminUser');
      
      if (!token || !adminUser) {
        setIsAuthenticated(false);
        toast.error('Access denied. Admin authentication required.');
        router.push('/login');
        return;
      }
      
      setIsAuthenticated(true);
    };

    checkAuth();
    
    return () => {
      stopScanning();
    };
  }, [router]);

  const startScanning = async () => {
    try {
      if (!videoRef.current) return;

      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          handleQRCodeDetected(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScannerRef.current = qrScanner;
      await qrScanner.start();
      setIsScanning(true);
      setHasPermission(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      setHasPermission(false);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleQRCodeDetected = async (qrData: string) => {
    if (isProcessing || lastScannedCode === qrData) return;
    
    setLastScannedCode(qrData);
    setQrCodePreview(qrData);
    setIsProcessing(true);
    setAttendanceResult(null);
    setScanCount(prev => prev + 1);
    stopScanning();

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          qrData: qrData
        }),
      });

      const result: AttendanceResult = await response.json();
      setAttendanceResult(result);

      if (result.success) {
        setSuccessCount(prev => prev + 1);
        // Show enhanced toast with participant and event details
        const participantName = result.data?.participant?.name || 'Participant';
        const eventTitle = result.data?.event?.title || 'Event';
        toast.success(`${participantName} successfully marked for ${eventTitle}!`);
        
        // Clear result immediately - no visual card needed
        setAttendanceResult(null);
        setLastScannedCode(null);
        setQrCodePreview(null);
      } else {
        toast.error(result.message);
        // Clear error after 3 seconds
        setTimeout(() => {
          setAttendanceResult(null);
          setLastScannedCode(null);
          setQrCodePreview(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      toast.error('Failed to process QR code');
      setAttendanceResult({
        success: false,
        message: 'Failed to process QR code. Please try again.'
      });
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setAttendanceResult(null);
        setLastScannedCode(null);
        setQrCodePreview(null);
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setAttendanceResult(null);
    setLastScannedCode(null);
    setQrCodePreview(null);
    setIsProcessing(false);
  };

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

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Admin authentication required to access the scanner.</p>
          <Link href="/login" className="text-primary hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Admin Scanner</span>
              <span className="sm:hidden">Scanner</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <QrCode className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">QR Code Scanner</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Scan QR codes to mark attendance at events
          </p>
        </div>
        {/* Session Statistics */}
        {scanCount > 0 && (
          <div className="bg-card border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-medium text-card-foreground mb-3">Session Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-primary">{scanCount}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Scans</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-chart-2">{successCount}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Successful</p>
              </div>
            </div>
          </div>
        )}

        {/* Scanner Section */}
        <div className="bg-card border rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-48 sm:h-64 bg-muted rounded-lg object-cover"
              playsInline
              muted
            />
            
            {!isScanning && !attendanceResult && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground">Camera not active</p>
                </div>
              </div>
            )}

            {isProcessing && (
              <OverlayLoading text="LOADING" />
            )}
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            {!isScanning ? (
              <button
                onClick={startScanning}
                disabled={hasPermission === false}
                className={`inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground transition-colors ${
                  hasPermission === false
                    ? 'bg-muted cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                }`}
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-destructive-foreground bg-destructive hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive"
              >
                <CameraOff className="h-4 w-4 mr-2" />
                Stop Scanning
              </button>
            )}

            {attendanceResult && (
              <button
                onClick={resetScanner}
                className="inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-border text-sm font-medium rounded-md shadow-sm text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Scan Another
              </button>
            )}
          </div>

          {hasPermission === false && (
            <div className="mt-4 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-xs sm:text-sm">
                <strong>Camera Access Denied:</strong> Please allow camera access to use the QR scanner.
              </p>
            </div>
          )}
        </div>

        {/* QR Code Preview Section */}
        {qrCodePreview && !attendanceResult && (
          <div className="bg-card border rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <QrCode className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-xl font-semibold text-card-foreground">QR Code Detected</h2>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Scanned Data:</p>
              <p className="font-mono text-sm text-card-foreground break-all bg-background p-3 rounded border">
                {qrCodePreview}
              </p>
            </div>
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Processing attendance...</p>
            </div>
          </div>
        )}

        {/* Results Section - Only show for errors, success is handled by toast */}
        {attendanceResult && !attendanceResult.success && (
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <XCircle className="h-8 w-8 text-destructive mr-3" />
              <h2 className="text-xl font-semibold text-card-foreground">
                Error
              </h2>
            </div>

            <p className="text-lg mb-4 text-destructive">
              {attendanceResult.message}
            </p>

            {/* Show duplicate attendance info if available */}
            {!attendanceResult.success && attendanceResult.data && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium text-destructive mb-3 flex items-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  Duplicate Attendance Detected
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Participant</p>
                    <p className="font-medium text-card-foreground">{attendanceResult.data.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Event</p>
                    <p className="font-medium text-card-foreground">{attendanceResult.data.eventTitle}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Previously Attended</p>
                    <p className="font-medium text-destructive">{attendanceResult.data.attendanceTime ? formatDate(attendanceResult.data.attendanceTime) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-chart-1/10 border border-chart-1/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-chart-1 mb-3">How to Use</h3>
          <ul className="text-chart-1 space-y-2">
            <li>• Click &quot;Start Scanning&quot; to activate your camera</li>
            <li>• Point the camera at a QR code from event registration</li>
            <li>• The system will automatically process the QR code</li>
            <li>• Attendance will be marked and confirmed</li>
            <li>• Each QR code can only be used once per event</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
