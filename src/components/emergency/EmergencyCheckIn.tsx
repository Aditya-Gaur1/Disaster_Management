import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, AlertTriangle, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CheckInStatus {
  id: string;
  status: 'safe' | 'need_help' | 'unknown';
  message?: string;
  location_name?: string;
  created_at: string;
}

interface EmergencyCheckInProps {
  onStatusUpdate?: (status: CheckInStatus) => void;
}

export const EmergencyCheckIn = ({ onStatusUpdate }: EmergencyCheckInProps) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'safe' | 'need_help' | null>(null);
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; name?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getCurrentLocation = () => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  };

  const getLocationName = async (lat: number, lng: number): Promise<string> => {
    try {
      // Simple reverse geocoding using a mock implementation
      // In a real app, you'd use a proper geocoding service
      return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      return `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const handleCheckIn = async (selectedStatus: 'safe' | 'need_help') => {
    if (!user) {
      toast.error('Please sign in to use emergency check-in');
      return;
    }

    setLoading(true);
    try {
      // Get current location
      let currentLocation = location;
      let locationName = 'Unknown location';

      try {
        if (!currentLocation) {
          const coords = await getCurrentLocation();
          currentLocation = coords;
          setLocation(coords);
        }
        locationName = await getLocationName(currentLocation.lat, currentLocation.lng);
      } catch (locationError) {
        console.warn('Could not get location:', locationError);
      }

      // Insert check-in record
      const { data, error } = await supabase
        .from('emergency_checkins')
        .insert([{
          user_id: user.id,
          status: selectedStatus,
          message: message.trim() || null,
          location_lat: currentLocation?.lat || null,
          location_lng: currentLocation?.lng || null,
          location_name: locationName
        }])
        .select()
        .single();

      if (error) throw error;

      setStatus(selectedStatus);
      toast.success(
        selectedStatus === 'safe' 
          ? 'Successfully checked in as safe!' 
          : 'Emergency help request submitted!'
      );

      if (onStatusUpdate && data) {
        onStatusUpdate(data as CheckInStatus);
      }

      setIsDialogOpen(false);
      setMessage('');
    } catch (error: any) {
      console.error('Error submitting check-in:', error);
      toast.error('Failed to submit check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (selectedStatus: 'safe' | 'need_help') => {
    setStatus(selectedStatus);
    setIsDialogOpen(true);
  };

  return (
    <Card className="shadow-card border-2 border-alert/20">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2 text-xl">
          <Shield className="h-6 w-6" />
          <span>Emergency Check-In</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Let others know your status during emergencies
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => openDialog('safe')}
              className="w-full h-20 gradient-success text-white hover:opacity-90"
              disabled={loading}
            >
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-1" />
                <div className="font-semibold">I'm Safe</div>
                <div className="text-xs opacity-90">Report that you're okay</div>
              </div>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => openDialog('need_help')}
              variant="destructive"
              className="w-full h-20 gradient-alert text-white hover:opacity-90"
              disabled={loading}
            >
              <div className="text-center">
                <AlertTriangle className="h-6 w-6 mx-auto mb-1" />
                <div className="font-semibold">Need Help</div>
                <div className="text-xs opacity-90">Request emergency assistance</div>
              </div>
            </Button>
          </motion.div>
        </div>

        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-muted/50 border"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Badge 
                variant={status === 'safe' ? 'secondary' : 'destructive'}
                className={cn(
                  'flex items-center space-x-1',
                  status === 'safe' && 'gradient-success text-white',
                  status === 'need_help' && 'gradient-alert text-white'
                )}
              >
                {status === 'safe' ? <Shield className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                <span>{status === 'safe' ? 'Safe' : 'Need Help'}</span>
              </Badge>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>Just now</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your status has been recorded and shared with emergency contacts.
            </p>
          </motion.div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {status === 'safe' ? (
                  <Shield className="h-5 w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-alert" />
                )}
                <span>
                  {status === 'safe' ? 'Confirm Safe Status' : 'Request Emergency Help'}
                </span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {status === 'safe' 
                  ? 'Let others know you are safe and secure in your current location.'
                  : 'This will alert emergency contacts that you need immediate assistance.'
                }
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Additional Message (Optional)
                </label>
                <Textarea
                  placeholder={
                    status === 'safe' 
                      ? 'I am safe and secure...' 
                      : 'Describe your situation...'
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>Your location will be automatically included</span>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  className={cn(
                    'flex-1',
                    status === 'safe' && 'gradient-success text-white',
                    status === 'need_help' && 'gradient-alert text-white'
                  )}
                  onClick={() => handleCheckIn(status!)}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Confirm'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};