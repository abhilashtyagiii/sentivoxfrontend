import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, TrendingUp, Target, AlertTriangle, CheckCircle2, Star } from "lucide-react";

interface TrainingRecommendation {
  area: string;
  priority: "critical" | "high" | "medium" | "low";
  issue: string;
  recommendation: string;
  resources: string[];
  expectedImprovement: string;
}

interface PerformanceGap {
  metric: string;
  currentScore: number;
  targetScore: number;
  gap: number;
  severity: "critical" | "moderate" | "minor";
}

interface TrainingRecommendationsProps {
  recommendations?: TrainingRecommendation[];
  performanceGaps?: PerformanceGap[];
  strengthAreas?: string[];
  overallRating?: "excellent" | "good" | "needs_improvement" | "poor";
}

export default function TrainingRecommendations({
  recommendations = [],
  performanceGaps = [],
  strengthAreas = [],
  overallRating
}: TrainingRecommendationsProps) {
  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      critical: { variant: "destructive", className: "" },
      high: { variant: "default", className: "bg-orange-500 hover:bg-orange-600" },
      medium: { variant: "secondary", className: "" },
      low: { variant: "outline", className: "" }
    };
    return variants[priority] || variants.medium;
  };

  const getRatingBadge = (rating?: string) => {
    const variants: Record<string, { variant: any; text: string; icon: any }> = {
      excellent: { variant: "default", text: "Excellent Performance", icon: <Star className="h-4 w-4 fill-current" /> },
      good: { variant: "secondary", text: "Good Performance", icon: <CheckCircle2 className="h-4 w-4" /> },
      needs_improvement: { variant: "outline", text: "Needs Improvement", icon: <TrendingUp className="h-4 w-4" /> },
      poor: { variant: "destructive", text: "Requires Attention", icon: <AlertTriangle className="h-4 w-4" /> }
    };
    return variants[rating || ""] || null;
  };

  if (recommendations.length === 0 && strengthAreas.length === 0) {
    return null;
  }

  const ratingBadge = getRatingBadge(overallRating);

  return (
    <div className="space-y-6" data-testid="training-recommendations-section">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Recruiter Training & Development
        </h3>
        {ratingBadge && (
          <Badge variant={ratingBadge.variant} className="flex items-center gap-1" data-testid="overall-rating-badge">
            {ratingBadge.icon}
            {ratingBadge.text}
          </Badge>
        )}
      </div>

      {/* Strengths */}
      {strengthAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              Areas of Strength
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strengthAreas.map((strength, index) => (
                <li key={index} className="flex items-start gap-2" data-testid={`strength-${index}`}>
                  <Star className="h-4 w-4 text-green-600 dark:text-green-400 mt-1 shrink-0" />
                  <span className="text-sm text-foreground">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Performance Gaps */}
      {performanceGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              Performance Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceGaps.map((gap, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0" data-testid={`performance-gap-${index}`}>
                  <div>
                    <p className="font-medium text-foreground">{gap.metric}</p>
                    <p className="text-sm text-muted-foreground">
                      Current: {gap.currentScore} → Target: {gap.targetScore} (Gap: {gap.gap} points)
                    </p>
                  </div>
                  <Badge variant={gap.severity === "critical" ? "destructive" : gap.severity === "moderate" ? "default" : "secondary"}>
                    {gap.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Action Plan & Recommendations
          </h4>
          {recommendations.map((rec, index) => (
            <Alert key={index} data-testid={`recommendation-${index}`} className={
              rec.priority === "critical" ? "border-red-500 dark:border-red-700" :
              rec.priority === "high" ? "border-orange-500 dark:border-orange-700" : ""
            }>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${
                  rec.priority === "critical" ? "text-red-600 dark:text-red-400" :
                  rec.priority === "high" ? "text-orange-600 dark:text-orange-400" :
                  "text-blue-600 dark:text-blue-400"
                }`} />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <h5 className="font-semibold text-foreground">{rec.area}</h5>
                    <Badge {...getPriorityBadge(rec.priority)} data-testid={`priority-badge-${index}`}>
                      {rec.priority.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <AlertDescription className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Issue:</p>
                      <p className="text-sm text-muted-foreground">{rec.issue}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-foreground">Recommendation:</p>
                      <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-foreground">Expected Improvement:</p>
                      <p className="text-sm text-green-600 dark:text-green-400">{rec.expectedImprovement}</p>
                    </div>
                    
                    {rec.resources.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Training Resources:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {rec.resources.map((resource, rIndex) => (
                            <li key={rIndex} className="flex items-start gap-2">
                              <BookOpen className="h-3 w-3 mt-1 shrink-0" />
                              <span>{resource}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}
