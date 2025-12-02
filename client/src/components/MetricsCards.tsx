import { Card, CardContent } from "@/components/ui/card";
import { Smile, UserCheck, Target, Route, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MetricsCardsProps {
  metrics: {
    recruiterSentiment: number;
    candidateEngagement: number;
    jdMatchScore: number;
    flowContinuityScore: number;
  };
}

const metricExplanations = {
  recruiterSentiment: {
    title: "Recruiter Sentiment",
    description: "Measures the emotional tone and positivity of the recruiter throughout the interview.",
    goodScore: "A score of 7+ indicates a positive, welcoming interview atmosphere."
  },
  candidateEngagement: {
    title: "Candidate Engagement",
    description: "Evaluates how actively and enthusiastically the candidate participated in the conversation.",
    goodScore: "Above 70% indicates strong engagement with detailed, thoughtful responses."
  },
  jdMatchScore: {
    title: "JD Match Score",
    description: "Analyzes how well the candidate's responses align with the job description requirements.",
    goodScore: "75%+ indicates excellent alignment with required skills and experience."
  },
  flowContinuity: {
    title: "Flow Continuity",
    description: "Assesses the logical flow and natural progression of the conversation.",
    goodScore: "Above 75% indicates smooth transitions and well-connected dialogue."
  }
};

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  // Helper functions to get dynamic descriptions based on actual values
  const getSentimentDescription = (score: number) => {
    if (score >= 8) return "Excellent sentiment";
    if (score >= 7) return "Positive sentiment";
    if (score >= 6) return "Good sentiment";
    if (score >= 5) return "Neutral sentiment";
    if (score >= 3) return "Below average";
    return "Negative sentiment";
  };

  const getEngagementDescription = (score: number) => {
    if (score >= 85) return "High engagement";
    if (score >= 70) return "Good engagement";
    if (score >= 55) return "Moderate engagement";
    if (score >= 30) return "Low engagement";
    return "Very low engagement";
  };

  const getMatchDescription = (score: number) => {
    if (score >= 85) return "Excellent alignment";
    if (score >= 75) return "Good alignment";
    if (score >= 60) return "Fair alignment";
    if (score >= 40) return "Poor alignment";
    return "No alignment";
  };

  const getFlowDescription = (score: number) => {
    if (score >= 85) return "Excellent flow";
    if (score >= 75) return "Logical flow";
    if (score >= 60) return "Acceptable flow";
    if (score >= 40) return "Choppy flow";
    return "Poor flow";
  };

  const cards = [
    {
      title: "Recruiter Sentiment",
      value: metrics.recruiterSentiment.toFixed(1),
      change: getSentimentDescription(metrics.recruiterSentiment),
      icon: Smile,
      bgColor: "bg-chart-2/10",
      iconColor: "text-chart-2",
      explanation: metricExplanations.recruiterSentiment
    },
    {
      title: "Candidate Engagement", 
      value: `${metrics.candidateEngagement}%`,
      change: getEngagementDescription(metrics.candidateEngagement),
      icon: UserCheck,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      explanation: metricExplanations.candidateEngagement
    },
    {
      title: "JD Match Score",
      value: `${metrics.jdMatchScore}%`, 
      change: getMatchDescription(metrics.jdMatchScore),
      icon: Target,
      bgColor: "bg-chart-3/10",
      iconColor: "text-chart-3",
      explanation: metricExplanations.jdMatchScore
    },
    {
      title: "Flow Continuity",
      value: `${metrics.flowContinuityScore}%`,
      change: getFlowDescription(metrics.flowContinuityScore),
      icon: Route,
      bgColor: "bg-chart-4/10", 
      iconColor: "text-chart-4",
      explanation: metricExplanations.flowContinuity
    }
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Card 
            key={card.title}
            className="transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-default"
            data-testid={`metric-card-${index}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" data-testid={`info-icon-${index}`} />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs" side="top">
                        <div className="space-y-2">
                          <p className="font-semibold">{card.explanation.title}</p>
                          <p className="text-sm">{card.explanation.description}</p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            ✓ {card.explanation.goodScore}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl font-bold text-foreground mt-2" data-testid={`metric-value-${index}`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-chart-2" data-testid={`metric-change-${index}`}>
                    {card.change}
                  </p>
                </div>
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", card.bgColor)}>
                  <card.icon className={cn("h-5 w-5", card.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}
