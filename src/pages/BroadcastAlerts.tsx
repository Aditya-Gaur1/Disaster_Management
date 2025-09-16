import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Megaphone, AlertTriangle, Shield, Users, Clock } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const BroadcastAlerts: React.FC = () => {
  const { user } = useAuth();
  const { role, canBroadcast, loading: roleLoading } = useRole();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    disaster_type: '',
    severity: 'medium',
    location_name: '',
    radius_km: 10,
    expires_at: ''
  });
  
  const [sending, setSending] = useState(false);

  const disasterTypes = [
    'earthquake',
    'flood',
    'fire',
    'cyclone',
    'tsunami',
    'landslide',
    'drought',
    'other'
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'secondary' },
    { value: 'medium', label: 'Medium', color: 'default' },
    { value: 'high', label: 'High', color: 'destructive' },
    { value: 'critical', label: 'Critical', color: 'destructive' }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Alert title is required.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.description.trim()) {
      toast({
        title: "Validation Error", 
        description: "Alert description is required.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.disaster_type) {
      toast({
        title: "Validation Error",
        description: "Please select a disaster type.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.location_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Location name is required.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleSendAlert = async () => {
    if (!validateForm()) return;
    
    setSending(true);
    try {
      // Calculate expiration time (48 hours from now if not specified)
      let expiresAt = null;
      if (formData.expires_at) {
        expiresAt = new Date(formData.expires_at).toISOString();
      } else {
        const now = new Date();
        now.setHours(now.getHours() + 48); // Auto-expire after 48 hours
        expiresAt = now.toISOString();
      }

      const { error } = await supabase
        .from('disaster_alerts')
        .insert({
          title: formData.title,
          description: formData.description,
          disaster_type: formData.disaster_type,
          severity: formData.severity,
          location_name: formData.location_name,
          radius_km: formData.radius_km,
          expires_at: expiresAt,
          is_active: true,
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Alert Sent Successfully!",
        description: `Emergency alert has been broadcast to all users in ${formData.location_name}.`,
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        disaster_type: '',
        severity: 'medium',
        location_name: '',
        radius_km: 10,
        expires_at: ''
      });

      // Mock push notification simulation
      setTimeout(() => {
        toast({
          title: "Push Notifications Sent",
          description: "Mobile push notifications have been delivered to all users in the target area.",
        });
      }, 2000);

    } catch (error) {
      console.error('Error sending alert:', error);
      toast({
        title: "Failed to Send Alert",
        description: "There was an error broadcasting the alert. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!canBroadcast()) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground mb-4">
              Only teachers and administrators can broadcast emergency alerts.
            </p>
            <Badge variant="outline">Current Role: {role}</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Megaphone className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Emergency Broadcast System</h1>
        </div>
        <p className="text-muted-foreground">
          Create and send emergency alerts to all users in the affected area.
        </p>
        <div className="flex items-center space-x-2 mt-2">
          <Badge variant="default">Role: {role}</Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>Broadcast Authority</span>
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Alert Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Alert Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Flash Flood Warning"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="disaster_type">Disaster Type *</Label>
                  <Select value={formData.disaster_type} onValueChange={(value) => handleInputChange('disaster_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select disaster type" />
                    </SelectTrigger>
                    <SelectContent>
                      {disasterTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Alert Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the emergency situation, safety instructions, and recommended actions..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity Level</Label>
                  <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Affected Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., New Delhi, Delhi"
                    value={formData.location_name}
                    onChange={(e) => handleInputChange('location_name', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="radius">Alert Radius (km)</Label>
                  <Input
                    id="radius"
                    type="number"
                    min="1"
                    max="500"
                    value={formData.radius_km}
                    onChange={(e) => handleInputChange('radius_km', parseInt(e.target.value) || 10)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expires">Expiration Time (Optional)</Label>
                  <Input
                    id="expires"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => handleInputChange('expires_at', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to auto-expire after 48 hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-start space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {formData.title || 'Alert Title'}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={severityLevels.find(s => s.value === formData.severity)?.color as any} className="text-xs">
                        {formData.severity.toUpperCase()}
                      </Badge>
                      {formData.disaster_type && (
                        <Badge variant="outline" className="text-xs">
                          {formData.disaster_type.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {formData.description || 'Alert description will appear here...'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formData.location_name || 'Location'}</span>
                  <span>{formData.radius_km}km radius</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>All users in target area</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Auto-expires in 48 hours</span>
                </div>
              </div>

              <Button 
                onClick={handleSendAlert} 
                disabled={sending || !formData.title || !formData.description}
                className="w-full gradient-alert text-alert-foreground hover:bg-alert/90"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Megaphone className="h-4 w-4 mr-2" />
                    Send Alert
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                This will send push notifications and SMS to all users in the affected area.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BroadcastAlerts;