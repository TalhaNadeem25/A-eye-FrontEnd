'use client';

import { useState } from 'react';
import { AlertTriangle, Search, RefreshCw } from 'lucide-react';
import EventCard from './EventCard';

interface Alert {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: Date;
  confidence: number;
  description: string;
  imageUrl: string;
  audioUrl?: string;
  status: 'new' | 'acknowledged' | 'dismissed';
}

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
}

export default function AlertPanel({ alerts, onAcknowledge, onDismiss }: AlertPanelProps) {
  const [filter, setFilter] = useState<'all' | 'new' | 'acknowledged' | 'dismissed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || alert.status === filter;
    const matchesSearch = alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.cameraName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const newAlertsCount = alerts.filter(alert => alert.status === 'new').length;
  const acknowledgedCount = alerts.filter(alert => alert.status === 'acknowledged').length;
  const dismissedCount = alerts.filter(alert => alert.status === 'dismissed').length;

  return (
    <div className="glassmorphism border border-border rounded-lg h-full flex flex-col hover-lift transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-warning" size={20} />
            <h2 className="text-lg font-semibold bg-gradient-to-r from-warning to-amber-400 bg-clip-text text-transparent">Alerts</h2>
            {newAlertsCount > 0 && (
              <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-medium">
                {newAlertsCount} New
              </span>
            )}
          </div>
          <button className="p-2 hover:bg-muted rounded-md transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-md">
          {[
            { key: 'all', label: 'All', count: alerts.length },
            { key: 'new', label: 'New', count: newAlertsCount },
            { key: 'acknowledged', label: 'Acknowledged', count: acknowledgedCount },
            { key: 'dismissed', label: 'Dismissed', count: dismissedCount }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as 'all' | 'new' | 'acknowledged' | 'dismissed')}
              className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                filter === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <AlertTriangle size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No alerts found</p>
            {searchTerm && (
              <p className="text-xs mt-1">Try adjusting your search terms</p>
            )}
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <EventCard
              key={alert.id}
              {...alert}
              onAcknowledge={onAcknowledge}
              onDismiss={onDismiss}
            />
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-border bg-muted/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-destructive">{newAlertsCount}</div>
            <div className="text-xs text-muted-foreground">New</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-warning">{acknowledgedCount}</div>
            <div className="text-xs text-muted-foreground">Acknowledged</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-muted-foreground">{dismissedCount}</div>
            <div className="text-xs text-muted-foreground">Dismissed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
