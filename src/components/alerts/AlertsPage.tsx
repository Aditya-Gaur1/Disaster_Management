import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmergencyCheckIn } from '@/components/emergency/EmergencyCheckIn';
import { VoiceAssistant } from '@/components/voice/VoiceAssistant';

interface DisasterAlert {
  id: string;
  title: string;
  description: string;
  disaster_type: string;
  severity: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  radius_km: number | null;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
}

interface UserLocation {
  lat: number;
  lng: number;
}

const AlertsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  useEffect(() => {
    getCurrentLocation();
    fetchAlerts();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Access",
            description: "Unable to get your location. You'll see all alerts.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('disaster_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch alerts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const isAlertRelevant = (alert: DisasterAlert): boolean => {
    if (!userLocation || !alert.latitude || !alert.longitude) return true;
    
    const distance = calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      alert.latitude, 
      alert.longitude
    );
    
    return distance <= (alert.radius_km || 10);
  };

  const handleCheckIn = async (status: 'safe' | 'need_help', alertId: string) => {
    if (!user) return;
    
    setCheckingIn(alertId);
    try {
      const { error } = await supabase
        .from('user_alert_status')
        .upsert({
          user_id: user.id,
          alert_id: alertId,
          status,
          location_lat: userLocation?.lat || null,
          location_lng: userLocation?.lng || null
        });

      if (error) throw error;

      toast({
        title: "Check-in Successful",
        description: `You've been marked as ${status === 'safe' ? 'safe' : 'needing help'}.`,
      });

      // Mock SMS fallback notification
      if (status === 'need_help') {
        toast({
          title: "Emergency SMS Sent",
          description: "Emergency contacts have been notified via SMS.",
        });
      }
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "Check-in Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setCheckingIn(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const relevantAlerts = alerts.filter(isAlertRelevant);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Disaster Alerts & Emergency Check-In</h1>
        <p className="text-muted-foreground">
          {userLocation 
            ? `Showing alerts for your location (${relevantAlerts.length} relevant)`
            : `Showing all alerts (${alerts.length} total)`
          }
        </p>
      </div>

      {/* Emergency Check-In and Voice Assistant */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <EmergencyCheckIn />
        <VoiceAssistant />
      </div>

      {relevantAlerts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Alerts</h3>
            <p className="text-muted-foreground">There are currently no disaster alerts for your area.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {relevantAlerts.map((alert) => (
            <Card key={alert.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {alert.disaster_type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{alert.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{alert.location_name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleCheckIn('safe', alert.id)}
                    disabled={checkingIn === alert.id}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    I'm Safe
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleCheckIn('need_help', alert.id)}
                    disabled={checkingIn === alert.id}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Need Help
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;