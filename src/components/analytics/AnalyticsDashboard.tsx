import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from '@nivo/line';
import { Heatmap } from '@nivo/heatmap';
import { Network } from '@nivo/network';
import { BarChart2, Users, Clock, Zap, AlertTriangle } from 'lucide-react';
import { AnalyticsService } from '../../services/analytics/AnalyticsService';

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const analytics = AnalyticsService.getInstance();

  useEffect(() => {
    const fetchMetrics = () => {
      const endTime = Date.now();
      const startTime = endTime - getTimeRangeInMs(timeRange);

      const report = analytics.generateReport({
        metrics: ['pageViews', 'interactions', 'aiUsage', 'performance', 'errors'],
        startTime,
        endTime
      });

      setMetrics(report.data);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [timeRange]);

  const getTimeRangeInMs = (range: string): number => {
    const ranges = {
      '1h': 3600000,
      '24h': 86400000,
      '7d': 604800000,
      '30d': 2592000000
    };
    return ranges[range as keyof typeof ranges] || ranges['24h'];
  };

  if (!metrics) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-xl p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <BarChart2 className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <QuickStat
          title="Active Users"
          value={metrics.pageViews.length}
          icon={Users}
          change={+12.5}
        />
        <QuickStat
          title="Avg. Session Time"
          value="12m 30s"
          icon={Clock}
          change={-2.3}
        />
        <QuickStat
          title="AI Operations"
          value={metrics.aiUsage.length}
          icon={Zap}
          change={+45.8}
        />
        <QuickStat
          title="Error Rate"
          value={`${((metrics.errors.length / metrics.pageViews.length) * 100).toFixed(2)}%`}
          icon={AlertTriangle}
          change={-8.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usage Over Time */}
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4">Usage Over Time</h3>
          <div className="h-[300px]">
            <Line
              data={[
                {
                  id: 'pageViews',
                  data: metrics.pageViews.map((pv: any) => ({
                    x: new Date(pv.timestamp),
                    y: 1
                  }))
                }
              ]}
              margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
              xScale={{ type: 'time', format: 'native' }}
              yScale={{ type: 'linear', min: 0, max: 'auto' }}
              axisBottom={{
                format: '%H:%M',
                tickRotation: -45
              }}
              enablePoints={false}
              enableArea={true}
              areaOpacity={0.15}
              curve="monotoneX"
            />
          </div>
        </div>

        {/* AI Usage Distribution */}
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4">AI Usage Distribution</h3>
          <div className="h-[300px]">
            <Heatmap
              data={transformAIUsageData(metrics.aiUsage)}
              margin={{ top: 20, right: 20, bottom: 50, left: 100 }}
              forceSquare={true}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Time',
                legendPosition: 'middle',
                legendOffset: 36
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function QuickStat({ title, value, icon: Icon, change }: any) {
  return (
    <div className="bg-white rounded-lg p-6 border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold">{value}</div>
        <div className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </div>
      </div>
    </div>
  );
}

function transformAIUsageData(aiUsage: any[]) {
  // Transform AI usage data for heatmap visualization
  return [];
}