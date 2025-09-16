import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MapPin, AlertTriangle, TrendingUp, Shield, Filter } from 'lucide-react';
import { format, subYears } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DisasterEvent {
  id: string;
  disaster_type: string;
  location_name: string;
  severity: string;
  affected_population: number;
  economic_damage: number;
  event_date: string;
  region: string;
  description: string;
}

interface RiskInsight {
  id: string;
  region: string;
  disaster_type: string;
  risk_level: string;
  priority_modules: string[];
  recommendations: string;
  confidence_score: number;
}

const severityColors = {
  low: '#22c55e',
  moderate: '#f59e0b', 
  high: '#f97316',
  severe: '#ef4444',
  critical: '#dc2626'
};

export const RiskDashboard = () => {
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [insights, setInsights] = useState<RiskInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date>(subYears(new Date(), 5));
  const [endDate, setEndDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsResult, insightsResult] = await Promise.all([
        supabase.from('disaster_events').select('*').order('event_date', { ascending: false }),
        supabase.from('risk_insights').select('*').order('risk_level', { ascending: false })
      ]);

      if (eventsResult.error) throw eventsResult.error;
      if (insightsResult.error) throw insightsResult.error;

      setEvents(eventsResult.data || []);
      setInsights(insightsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.event_date);
    const matchesRegion = selectedRegion === 'all' || event.region === selectedRegion;
    const matchesType = selectedType === 'all' || event.disaster_type === selectedType;
    const matchesDate = eventDate >= startDate && eventDate <= endDate;
    
    return matchesRegion && matchesType && matchesDate;
  });

  const chartData = filteredEvents.reduce((acc, event) => {
    const year = new Date(event.event_date).getFullYear();
    const existingYear = acc.find(item => item.year === year);
    
    if (existingYear) {
      existingYear.count += 1;
      existingYear.affected += event.affected_population || 0;
    } else {
      acc.push({
        year,
        count: 1,
        affected: event.affected_population || 0
      });
    }
    
    return acc;
  }, [] as any[]).sort((a, b) => a.year - b.year);

  const typeDistribution = filteredEvents.reduce((acc, event) => {
    const existing = acc.find(item => item.type === event.disaster_type);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ type: event.disaster_type, count: 1 });
    }
    return acc;
  }, [] as any[]);

  const severityStats = filteredEvents.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const regions = [...new Set(events.map(e => e.region))];
  const disasterTypes = [...new Set(events.map(e => e.disaster_type))];

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading risk insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Risk Insights Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            AI-powered disaster risk analysis and preparedness recommendations
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Data Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Disaster Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {disasterTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(endDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{filteredEvents.length}</div>
              <p className="text-muted-foreground text-sm">Total Events</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredEvents.reduce((sum, e) => sum + (e.affected_population || 0), 0).toLocaleString()}
              </div>
              <p className="text-muted-foreground text-sm">People Affected</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                ₹{(filteredEvents.reduce((sum, e) => sum + (e.economic_damage || 0), 0) / 1000000000).toFixed(1)}B
              </div>
              <p className="text-muted-foreground text-sm">Economic Damage</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {Object.keys(severityStats).filter(s => ['high', 'severe'].includes(s)).reduce((sum, s) => sum + severityStats[s], 0)}
              </div>
              <p className="text-muted-foreground text-sm">High Risk Events</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Temporal Trends */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Disaster Trends Over Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Disaster Type Distribution */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Disaster Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Risk Insights */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>AI Risk Insights</span>
              </CardTitle>
              <CardDescription>
                Personalized recommendations based on regional risk analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="p-4 rounded-lg bg-muted/50 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{insight.region}</span>
                      </div>
                      <Badge 
                        variant={insight.risk_level === 'critical' ? 'destructive' : 'secondary'}
                        className={cn(
                          insight.risk_level === 'critical' && 'gradient-alert text-white',
                          insight.risk_level === 'high' && 'bg-alert/10 text-alert',
                          insight.risk_level === 'moderate' && 'bg-achievement/10 text-achievement'
                        )}
                      >
                        {insight.risk_level} risk
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.recommendations}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {insight.priority_modules.map((module, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {module.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Confidence: {Math.round((insight.confidence_score || 0) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Recent Disaster Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="p-3 rounded-lg bg-muted/50 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{event.location_name}</span>
                      <Badge 
                        style={{ 
                          backgroundColor: severityColors[event.severity as keyof typeof severityColors] 
                        }}
                        className="text-white"
                      >
                        {event.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.disaster_type.charAt(0).toUpperCase() + event.disaster_type.slice(1)} • {new Date(event.event_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.affected_population?.toLocaleString()} people affected
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};