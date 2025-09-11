'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, QrCode, CheckCircle, XCircle, Camera, CameraOff } from 'lucide-react';
import toast from 'react-hot-toast';
import QrScanner from 'qr-scanner';

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

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

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
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrData: qrData
        }),
      });

      const result: AttendanceResult = await response.json();
      setAttendanceResult(result);

      if (result.success) {
        setSuccessCount(prev => prev + 1);
        toast.success(result.message);
        // Auto-clear result after 5 seconds
        setTimeout(() => {
          setAttendanceResult(null);
          setLastScannedCode(null);
          setQrCodePreview(null);
        }, 5000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <QrCode className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">QR Code Scanner</h1>
          <p className="text-muted-foreground">
            Scan QR codes to mark attendance at events
          </p>
          
          {/* Testing Notice */}
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-chart-1/10 border border-chart-1/20 rounded-lg">
            <div className="w-2 h-2 bg-chart-1 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm text-chart-1 font-medium">Scanner in Testing Mode</span>
          </div>
        </div>

        {/* Session Statistics */}
        {scanCount > 0 && (
          <div className="bg-card border rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-card-foreground mb-3">Session Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{scanCount}</p>
                <p className="text-sm text-muted-foreground">Total Scans</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-chart-2">{successCount}</p>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
            </div>
          </div>
        )}

        {/* Scanner Section */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 bg-muted rounded-lg object-cover"
              playsInline
              muted
            />
            
            {!isScanning && !attendanceResult && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Camera not active</p>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-center text-primary-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-foreground mx-auto mb-2"></div>
                  <p>Processing QR code...</p>
                  {qrCodePreview && (
                    <p className="text-xs text-muted-foreground mt-2 font-mono">
                      {qrCodePreview.substring(0, 50)}...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            {!isScanning ? (
              <button
                onClick={startScanning}
                disabled={hasPermission === false}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground transition-colors ${
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-destructive-foreground bg-destructive hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive"
              >
                <CameraOff className="h-4 w-4 mr-2" />
                Stop Scanning
              </button>
            )}

            {attendanceResult && (
              <button
                onClick={resetScanner}
                className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md shadow-sm text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Scan Another
              </button>
            )}
          </div>

          {hasPermission === false && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">
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

        {/* Results Section */}
        {attendanceResult && (
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center mb-4">
              {attendanceResult.success ? (
                <CheckCircle className="h-8 w-8 text-chart-2 mr-3" />
              ) : (
                <XCircle className="h-8 w-8 text-destructive mr-3" />
              )}
              <h2 className="text-xl font-semibold text-card-foreground">
                {attendanceResult.success ? 'Attendance Marked!' : 'Error'}
              </h2>
            </div>

            <p className={`text-lg mb-4 ${
              attendanceResult.success ? 'text-chart-2' : 'text-destructive'
            }`}>
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

            {attendanceResult.success && attendanceResult.data && attendanceResult.data.participant && attendanceResult.data.event && (
              <div className="space-y-6">
                {/* Participant Information */}
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-lg font-medium text-card-foreground mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-chart-2 mr-2" />
                    Participant Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-semibold text-card-foreground text-lg">{attendanceResult.data.participant.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email Address</p>
                      <p className="font-medium text-card-foreground">{attendanceResult.data.participant.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Registration ID</p>
                      <p className="font-mono text-sm text-primary bg-primary/10 px-2 py-1 rounded">{attendanceResult.data.participant.registrationId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Attendance Time</p>
                      <p className="font-medium text-chart-2">{formatDate(attendanceResult.data.participant.attendanceTime)}</p>
                    </div>
                  </div>
                </div>

                {/* Event Information */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-card-foreground mb-3 flex items-center">
                    <QrCode className="h-5 w-5 text-primary mr-2" />
                    Event Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Event Title</p>
                      <p className="font-semibold text-card-foreground text-lg">{attendanceResult.data.event.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Event Date</p>
                      <p className="font-medium text-card-foreground">{formatDate(attendanceResult.data.event.date)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Venue</p>
                      <p className="font-medium text-card-foreground">{attendanceResult.data.event.venue}</p>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="bg-chart-2/10 border border-chart-2/20 rounded-lg p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-chart-2 mx-auto mb-2" />
                  <p className="font-semibold text-chart-2">Attendance Successfully Recorded!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {attendanceResult.data.participant.name} has been marked as present for {attendanceResult.data.event.title}
                  </p>
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
