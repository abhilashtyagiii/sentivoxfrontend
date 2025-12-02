import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, HelpCircle, Lightbulb, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QAItem {
  question: string;
  timestamp: string;
  answers: Array<{
    text: string;
    timestamp: string;
    sentiment: string;
    jdMatch: number;
    reasoning?: string;
  }>;
  relevance: number;
  reasoning?: string;
}

interface ConversationAnalysisProps {
  qaAnalysis: QAItem[];
  insights: string[];
}

export default function ConversationAnalysis({ qaAnalysis, insights }: ConversationAnalysisProps) {
  const getBadgeVariant = (score: number) => {
    if (score >= 75) return "default"; // Green for strong match (75%+)
    if (score >= 25) return "secondary"; // Blue for partial match (25-74%)
    if (score >= 5) return "outline"; // Gray for weak relevance (5-24%)
    return "destructive"; // Red for no relevance (<5%)
  };

  const getBadgeText = (score: number) => {
    if (score >= 75) return `Strong Match (${score}%)`;
    if (score >= 25) return `Partial Match (${score}%)`;
    if (score >= 5) return `Weak Match (${score}%)`;
    return `No Match (${score}%)`;
  };

  const getRelevanceExplanation = (score: number, reasoning?: string) => {
    if (reasoning) return reasoning;
    
    if (score >= 75) return `Score: ${score}% (Strong Match) - This question directly targets critical job requirements and effectively evaluates candidate competencies aligned with the role's core responsibilities.`;
    if (score >= 25) return `Score: ${score}% (Partial Match) - This question addresses some job requirements but could be more specific. Consider focusing more directly on key technical skills or role-specific competencies mentioned in the JD.`;
    if (score >= 5) return `Score: ${score}% (Weak Match) - This question has minimal connection to the job description. To improve interview effectiveness, align questions more closely with the required skills and responsibilities.`;
    return `Score: ${score}% (No Match) - This question does not align with the job description requirements. Focus on questions that directly assess the candidate's ability to perform the role's key functions and required technical/soft skills.`;
  };

  const getSentimentColor = (sentiment: string) => {
    const sentimentLower = sentiment.toLowerCase();
    if (sentimentLower.includes('positive')) return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700";
    if (sentimentLower.includes('negative')) return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700";
    if (sentimentLower.includes('neutral')) return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700";
    return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600";
  };

  const getSentimentExplanation = (sentiment: string, score?: number) => {
    const sentimentLower = sentiment.toLowerCase();
    const scoreText = score !== undefined ? ` (Confidence: ${score}%)` : '';
    
    if (sentimentLower.includes('positive')) 
      return `Positive Sentiment${scoreText} - The candidate demonstrates confidence, enthusiasm, and clear engagement. Their tone suggests genuine interest, competence, and strong communication skills. This indicates good cultural fit and motivation for the role.`;
    if (sentimentLower.includes('negative')) 
      return `Negative Sentiment${scoreText} - The response shows hesitation, uncertainty, or defensiveness. This may indicate discomfort with the question, lack of relevant experience, or communication challenges. Consider probing deeper or rephrasing to help the candidate express themselves better.`;
    return `Neutral Sentiment${scoreText} - The response is factual and straightforward without strong emotional indicators. This is typical for technical or informational answers. While professional, consider engaging the candidate more to assess their passion and cultural alignment.`;
  };

  const getAnswerMatchExplanation = (score: number, reasoning?: string) => {
    if (reasoning) return reasoning;
    
    if (score >= 75) return `Score: ${score}% (Strong Match) - The candidate's answer demonstrates comprehensive understanding and directly addresses the question with relevant examples, technical depth, and job-aligned competencies.`;
    if (score >= 25) return `Score: ${score}% (Partial Match) - The answer touches on relevant points but lacks specific examples or technical depth. The candidate shows some understanding but may benefit from more detailed follow-up questions.`;
    if (score >= 5) return `Score: ${score}% (Weak Match) - The answer provides limited relevant information. The candidate may be evading the question, lacking knowledge, or misunderstanding what was asked. Consider rephrasing or probing deeper.`;
    return `Score: ${score}% (No Match) - The answer does not address the question or job requirements. This could indicate lack of relevant experience, poor listening skills, or communication barriers. Follow up to clarify or assess if the candidate meets minimum qualifications.`;
  };

  return (
    <TooltipProvider>
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Question & Answer Analysis</h3>
          
          <div className="space-y-6">
            {qaAnalysis.map((qa, index) => (
              <div 
                key={index} 
                id={`transcript-segment-${index}`}
                className="border-l-4 border-primary pl-4 transition-all duration-300" 
                data-testid={`qa-item-${index}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      <HelpCircle className="inline text-primary mr-2 h-4 w-4" />
                      "{qa.question}"
                    </p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                      <span>Recruiter • {qa.timestamp}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant={getBadgeVariant(qa.relevance)} data-testid={`relevance-badge-${index}`} className="cursor-help">
                            JD Relevance: {getBadgeText(qa.relevance)}
                            <Info className="inline ml-1 h-3 w-3" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="font-semibold mb-2 text-primary">Question Relevance Analysis</p>
                          <p className="text-sm leading-relaxed">{getRelevanceExplanation(qa.relevance, qa.reasoning)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              
                {qa.answers.map((answer, answerIndex) => (
                <div key={answerIndex} className="mt-3 ml-6">
                  <p className="text-foreground">
                    <MessageCircle className="inline text-green-600 dark:text-green-400 mr-2 h-4 w-4" />
                    "{answer.text.length > 200 ? answer.text.substring(0, 200) + "..." : answer.text}"
                  </p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                    <span>Candidate • {answer.timestamp}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className={`${getSentimentColor(answer.sentiment)} cursor-help`} data-testid={`sentiment-badge-${index}-${answerIndex}`}>
                          {answer.sentiment}
                          <Info className="inline ml-1 h-3 w-3" />
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-2 text-primary">Sentiment Analysis</p>
                        <p className="text-sm leading-relaxed">{getSentimentExplanation(answer.sentiment)}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant={getBadgeVariant(answer.jdMatch)} data-testid={`jd-match-badge-${index}-${answerIndex}`} className="cursor-help">
                          Answer Match: {getBadgeText(answer.jdMatch)}
                          <Info className="inline ml-1 h-3 w-3" />
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-2 text-primary">Answer Relevance Analysis</p>
                        <p className="text-sm leading-relaxed">{getAnswerMatchExplanation(answer.jdMatch, answer.reasoning)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {qaAnalysis.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="mx-auto h-12 w-12 mb-4" />
              <p>No conversation analysis available yet.</p>
              <p className="text-sm">Analysis will appear here once processing is complete.</p>
            </div>
          )}
          </div>
          
          {insights.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg" data-testid="insights-container">
              <h4 className="font-medium text-foreground mb-2 flex items-center">
                <Lightbulb className="text-yellow-500 dark:text-yellow-400 mr-2 h-4 w-4" />
                Analysis Insights
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {insights.map((insight, index) => {
                  // Handle both string and object formats
                  let displayText = '';
                  if (typeof insight === 'string') {
                    displayText = insight;
                  } else if (insight && typeof insight === 'object') {
                    // Try different possible object properties
                    displayText = (insight as any).description ||
                                 (insight as any).insight || 
                                 (insight as any).text || 
                                 (insight as any).content || 
                                 JSON.stringify(insight);
                  } else {
                    displayText = 'Unable to display insight';
                  }
                  
                  return (
                    <li key={index} data-testid={`insight-${index}`}>
                      • {displayText}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
