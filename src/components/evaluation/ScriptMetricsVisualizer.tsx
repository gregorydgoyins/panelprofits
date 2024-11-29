import React from 'react';
import { motion } from 'framer-motion';
import { Radar } from '@nivo/radar';
import { Line } from '@nivo/line';
import { useScriptEvaluationStore } from '../../store/useScriptEvaluationStore';
import { Brain, TrendingUp, Target } from 'lucide-react';

export default function ScriptMetricsVisualizer() {
  const { currentScript, emotionalTrajectory } = useScriptEvaluationStore();

  const metricsData = [
    {
      metric: "Current Script",
      ...currentScript.metrics
    }
  ];

  const emotionalData = [{
    id: "emotional trajectory",
    data: emotionalTrajectory.map(point => ({
      x: point.scene,
      y: point.intensity
    }))
  }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-2xl p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-indigo-600" />
          <div>
            <h2 className="text-2xl font-bold">Script Analysis</h2>
            <p className="text-gray-600">Comprehensive metrics visualization</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-indigo-600" />
          <span className="text-lg font-semibold">
            Score: {currentScript.totalScore.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <div className="h-[400px]">
          <h3 className="text-lg font-semibold mb-4">Script Metrics</h3>
          <Radar
            data={metricsData}
            keys={Object.keys(currentScript.metrics)}
            indexBy="metric"
            maxValue={100}
            margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
            curve="linearClosed"
            borderWidth={2}
            borderColor={{ from: 'color' }}
            gridLevels={5}
            gridShape="circular"
            gridLabelOffset={12}
            enableDots={true}
            dotSize={8}
            dotColor={{ theme: 'background' }}
            dotBorderWidth={2}
            dotBorderColor={{ from: 'color' }}
            enableDotLabel={true}
            dotLabel="value"
            dotLabelYOffset={-12}
            colors={{ scheme: 'nivo' }}
            fillOpacity={0.25}
            blendMode="multiply"
            animate={true}
          />
        </div>

        {/* Emotional Trajectory */}
        <div className="h-[400px]">
          <h3 className="text-lg font-semibold mb-4">Emotional Arc</h3>
          <Line
            data={emotionalData}
            margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 0, max: 100 }}
            curve="monotoneX"
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Scene',
              legendOffset: 36,
              legendPosition: 'middle'
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Emotional Intensity',
              legendOffset: -40,
              legendPosition: 'middle'
            }}
            enablePoints={true}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            enableArea={true}
            areaOpacity={0.15}
          />
        </div>
      </div>

      {/* Market Viability */}
      <div className="mt-8">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Market Analysis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Genre Popularity</h4>
            <div className="text-2xl font-bold text-indigo-600">
              {currentScript.metrics.marketViability}%
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">List Category</h4>
            <div className="text-2xl font-bold text-indigo-600">
              {currentScript.listCategory || 'Pending'}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Genre Alignment</h4>
            <div className="text-2xl font-bold text-indigo-600">
              {currentScript.metrics.genreAlignment}%
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}