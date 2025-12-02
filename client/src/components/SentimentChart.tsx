import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Info, TrendingDown, TrendingUp } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SentimentChartProps {
  data: Array<{
    time: string;
    recruiter: number;
    candidate: number;
  }>;
  onPointClick?: (timestamp: string) => void;
}

export default function SentimentChart({ data, onPointClick }: SentimentChartProps) {
  // Use actual data only - no fake sample data
  const chartData = data;

  // Calculate sentiment trends
  const recruiterTrend = chartData.length > 1 ? 
    chartData[chartData.length - 1].recruiter - chartData[0].recruiter : 0;
  const candidateTrend = chartData.length > 1 ?
    chartData[chartData.length - 1].candidate - chartData[0].candidate : 0;

  const handleClick = (e: any) => {
    if (e && e.activePayload && e.activePayload[0]) {
      const timestamp = e.activeLabel;
      if (onPointClick && timestamp) {
        onPointClick(timestamp);
      }
    }
  };

  return (
    <TooltipProvider>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">Sentiment Analysis Over Time</h3>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" data-testid="info-icon-sentiment-chart" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs" side="top">
                  <div className="space-y-2">
                    <p className="font-semibold">Sentiment Analysis</p>
                    <p className="text-sm">Tracks emotional tone throughout the interview. Click on any point to jump to that moment in the transcript.</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ Scores above 7 indicate positive, engaging conversation
                    </p>
                  </div>
                </TooltipContent>
              </UITooltip>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Recruiter</span>
                {recruiterTrend !== 0 && (
                  recruiterTrend > 0 ? 
                    <TrendingUp className="h-4 w-4 text-green-500" /> :
                    <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Candidate</span>
                {candidateTrend !== 0 && (
                  candidateTrend > 0 ? 
                    <TrendingUp className="h-4 w-4 text-green-500" /> :
                    <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
          <div className="h-[300px]" data-testid="sentiment-chart-container">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} onClick={handleClick} className="cursor-pointer">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                    label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                    label={{ value: 'Sentiment Score', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                            <p className="font-medium mb-2">Time: {label}</p>
                            <p className="text-xs text-muted-foreground mb-2">Click to view transcript</p>
                            {payload.map((entry, index) => (
                              <div key={index} className="flex items-center space-x-2 mb-1">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: entry.color }}
                                ></div>
                                <span className="text-sm">
                                  {entry.name}: <span className="font-medium">{entry.value}/10</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="recruiter"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5, cursor: 'pointer' }}
                    activeDot={{ r: 8, fill: "#1d4ed8", stroke: "#ffffff", strokeWidth: 2, cursor: 'pointer' }}
                    name="Recruiter"
                  />
                  <Line
                    type="monotone"
                    dataKey="candidate"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 5, cursor: 'pointer' }}
                    activeDot={{ r: 8, fill: "#059669", stroke: "#ffffff", strokeWidth: 2, cursor: 'pointer' }}
                    name="Candidate"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                <h4 className="text-lg font-medium text-foreground mb-2">No Sentiment Analysis Yet</h4>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Sentiment analysis over time will appear here once your interview audio is processed.
                </p>
              </div>
            )}
          </div>
          
          {/* Sentiment Summary - only show when data is available */}
          {chartData.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Recruiter</span>
                </div>
                <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                  {(chartData.reduce((sum, item) => sum + item.recruiter, 0) / chartData.length).toFixed(1)}/10
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Average Sentiment</p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Candidate</span>
                </div>
                <p className="text-lg font-bold text-green-800 dark:text-green-200">
                  {(chartData.reduce((sum, item) => sum + item.candidate, 0) / chartData.length).toFixed(1)}/10
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">Average Sentiment</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
