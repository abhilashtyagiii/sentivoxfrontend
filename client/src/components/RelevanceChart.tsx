import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Target } from "lucide-react";

interface RelevanceChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
    icon?: string;
    details?: string;
    matchedSkills?: string[];
    missingSkills?: string[];
    yearsRequired?: number;
    yearsCandidate?: number;
  }>;
  title?: string;
}

export default function RelevanceChart({ data, title = "JD Relevance Breakdown" }: RelevanceChartProps) {
  // Use actual data only - no fake sample data
  const chartData = data;

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
        <div className="h-[320px]" data-testid="relevance-chart-container">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-900 p-4 border rounded-xl shadow-2xl max-w-sm">
                          <div className="flex items-center space-x-3 mb-3">
                            {data.icon && (
                              <span className="text-2xl">{data.icon}</span>
                            )}
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                              style={{ backgroundColor: data.color }}
                            ></div>
                            <span className="font-bold text-gray-900 dark:text-white">{data.name}</span>
                          </div>
                          <p className="text-2xl font-bold mb-2" style={{ color: data.color }}>
                            {data.value}%
                          </p>
                          {data.details && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                              {data.details}
                            </p>
                          )}
                          {data.matchedSkills && data.matchedSkills.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">✅ Matched Skills:</p>
                              <p className="text-xs text-gray-700 dark:text-gray-300">{data.matchedSkills.join(', ')}</p>
                            </div>
                          )}
                          {data.missingSkills && data.missingSkills.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">❌ Missing Skills:</p>
                              <p className="text-xs text-gray-700 dark:text-gray-300">{data.missingSkills.join(', ')}</p>
                            </div>
                          )}
                          {data.yearsRequired !== undefined && data.yearsCandidate !== undefined && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">Required: {data.yearsRequired}+ years</span>
                              <span className="text-gray-600 dark:text-gray-400">Candidate: {data.yearsCandidate} years</span>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-medium">Job Relevance Score</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Target className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">No JD Analysis Yet</h4>
              <p className="text-sm text-muted-foreground max-w-sm">
                Job description relevance analysis will appear here once your interview audio is processed.
              </p>
            </div>
          )}
        </div>
        {chartData.length > 0 && (
          <>
            <div className="mt-6 space-y-3">
              {chartData.map((item, index) => (
                <div 
                  key={item.name} 
                  className="flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-sm" 
                  style={{ 
                    backgroundColor: `${item.color}15`, 
                    borderColor: `${item.color}30` 
                  }}
                  data-testid={`relevance-item-${index}`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon && (
                      <span className="text-xl">{item.icon}</span>
                    )}
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="flex-1">
                      <span className="font-semibold text-foreground">{item.name}</span>
                      {item.details && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.details}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span 
                      className="text-lg font-bold"
                      style={{ color: item.color }}
                    >
                      {item.value}%
                    </span>
                    <div className="text-xs text-muted-foreground">Match Score</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Overall Score */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Overall JD Match</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Average compatibility with job requirements
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
