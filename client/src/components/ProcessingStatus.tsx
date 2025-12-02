import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, Settings, AlertCircle, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcessingStep } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface ProcessingStatusProps {
  steps: ProcessingStep[];
  isVisible: boolean;
}

export default function ProcessingStatus({ steps, isVisible }: ProcessingStatusProps) {
  if (!isVisible || steps.length === 0) return null;

  const getAIService = (message: string, name: string): { service: 'Gemini' | 'OpenAI' | null, color: string, savings?: string | undefined } => {
    const msg = message.toLowerCase();
    const stepName = name.toLowerCase();
    
    // Check for explicit service mentions in messages
    if (msg.includes('gemini') || msg.includes('saved') || msg.includes('no openai')) {
      return { 
        service: 'Gemini', 
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        savings: msg.match(/saved (\d+)/)?.[1] || undefined
      };
    }
    
    if (msg.includes('openai') && !msg.includes('no openai')) {
      return { 
        service: 'OpenAI', 
        color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      };
    }
    
    // Infer from step name
    if (stepName.includes('transcription') || stepName.includes('sentiment') || 
        stepName.includes('jd relevance') || stepName.includes('flow') || 
        stepName.includes('pii') || stepName.includes('explainability')) {
      return { service: 'Gemini', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
    }
    
    if (stepName.includes('embedding')) {
      return { service: 'OpenAI', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
    }
    
    return { service: null, color: '' };
  };

  const getStatusIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-chart-2" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <span className="text-muted-foreground text-sm">○</span>;
    }
  };

  const getStatusColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'complete':
        return 'text-chart-2';
      case 'processing':
        return 'text-primary';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const completedSteps = steps.filter(s => s.status === 'complete').length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Card className="mb-8 transition-all duration-300 hover:shadow-lg" data-testid="processing-status-container">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="text-primary mr-2 h-5 w-5" />
              Processing Interview
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              {completedSteps} / {totalSteps} steps
            </span>
          </h2>
          <div className="mt-3 w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          {steps.map((step, index) => {
            const aiService = getAIService(step.message, step.name);
            return (
              <div 
                key={index} 
                className={cn(
                  "flex items-start space-x-4 p-3 rounded-lg transition-all duration-300",
                  step.status === 'processing' && 'bg-primary/5 ring-2 ring-primary/20',
                  step.status === 'complete' && 'bg-chart-2/5',
                  step.status === 'error' && 'bg-destructive/5'
                )}
                data-testid={`processing-step-${index}`}
              >
                <div className="w-8 h-8 bg-background border-2 border-border rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground" data-testid={`step-name-${index}`}>
                      {step.name}
                    </p>
                    {aiService.service && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs flex items-center gap-1 transition-all duration-200",
                          aiService.color
                        )}
                        data-testid={`ai-service-badge-${index}`}
                      >
                        {aiService.service === 'Gemini' ? (
                          <Sparkles className="h-3 w-3" />
                        ) : (
                          <Zap className="h-3 w-3" />
                        )}
                        {aiService.service}
                        {aiService.savings && step.status === 'complete' && (
                          <span className="ml-1 text-[10px] opacity-70">
                            (-{aiService.savings} calls)
                          </span>
                        )}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1" data-testid={`step-message-${index}`}>
                    {step.message}
                  </p>
                  {step.duration !== undefined && step.status === 'complete' && (
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Completed in {(step.duration / 1000).toFixed(1)}s
                    </p>
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium capitalize flex-shrink-0",
                  getStatusColor(step.status)
                )}>
                  {step.status === 'processing' && 'Processing...'}
                  {step.status === 'complete' && '✓'}
                  {step.status === 'error' && 'Error'}
                  {step.status === 'pending' && '○'}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
