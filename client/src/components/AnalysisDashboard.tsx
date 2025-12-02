import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Plus, FileDown, Loader2, Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MetricsCards from "./MetricsCards";
import SentimentChart from "./SentimentChart";
import RelevanceChart from "./RelevanceChart";
import ConversationAnalysis from "./ConversationAnalysis";
import TrainingRecommendations from "./TrainingRecommendations";
import type { AnalysisReport, Interview } from "@/lib/types";

interface AnalysisDashboardProps {
  interview: Interview;
  report: AnalysisReport;
  onDownloadReport: () => void;
  onNewAnalysis: () => void;
}

export default function AnalysisDashboard({ interview, report, onDownloadReport, onNewAnalysis }: AnalysisDashboardProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingCandidate, setIsDownloadingCandidate] = useState(false);
  const [isDownloadingRecruiter, setIsDownloadingRecruiter] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);
  
  // Check for enhanced analysis data
  const hasEnhancedData = !!(interview.multiModalSentiment || interview.graphFlowModel || interview.explainabilityData);

  // Handle click on sentiment chart to scroll to specific transcript segment
  const handleSentimentPointClick = (timestamp: string) => {
    // Find the matching sentiment data point to get the segment index
    const dataPoint = sentimentData.find(d => d.time === timestamp);
    
    if (dataPoint && 'segmentIndex' in dataPoint) {
      // Try to find the specific segment element by ID
      const segmentId = `transcript-segment-${dataPoint.segmentIndex}`;
      const segmentElement = document.getElementById(segmentId);
      
      if (segmentElement) {
        segmentElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        
        // Highlight the segment briefly
        segmentElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => {
          segmentElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        }, 2000);
        
        toast({
          title: "Viewing Transcript Segment",
          description: `Showing conversation at ${timestamp}`,
        });
      } else {
        // Fallback to scrolling to conversation container
        conversationRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        
        toast({
          title: "Scrolling to Transcript",
          description: `Viewing conversation around ${timestamp}`,
        });
      }
    }
  };
  
  const metrics = {
    recruiterSentiment: report.recruiterSentiment || 0,
    candidateEngagement: report.candidateEngagement || 0,
    jdMatchScore: report.jdMatchScore || interview.embeddingAnalysis?.overallSimilarity || 0,
    embeddingMatchScore: interview.embeddingAnalysis?.overallSimilarity,
    flowContinuityScore: interview.graphFlowModel?.enhancedScore || report.flowContinuityScore || 0,
    voiceToneScore: interview.multiModalSentiment?.overallScore
  };

  // Generate sentiment data from Q&A analysis - use actual per-answer sentiment scores
  const sentimentData = report.qaAnalysis && report.qaAnalysis.length > 0
    ? report.qaAnalysis
        .slice(0, 10) // Limit to 10 data points for chart readability
        .map((qa, index) => {
          // Use actual sentiment from the Q&A answer if available
          const candidateSentiment = qa.answers && qa.answers[0]?.sentiment || 'Neutral';
          
          // Map sentiment text to numeric score
          let candidateScore = (report.candidateEngagement || 50) / 10; // Default to overall score
          if (candidateSentiment.toLowerCase().includes('positive')) {
            candidateScore = 7; // Positive sentiment
          } else if (candidateSentiment.toLowerCase().includes('negative')) {
            candidateScore = 3; // Negative sentiment
          } else if (candidateSentiment.toLowerCase().includes('neutral')) {
            candidateScore = 5; // Neutral sentiment
          }
          
          // For recruiter, use overall score (questions don't have individual sentiment analysis)
          const recruiterScore = report.recruiterSentiment || 5;
          
          return {
            time: qa.timestamp || `Q${index + 1}`,
            recruiter: recruiterScore,
            candidate: candidateScore,
            segmentIndex: index // Maps directly to qaAnalysis array index
          };
        })
    : [];

  // Generate separate relevance datasets for core categories and other skills
  const getRelevanceData = () => {
    if (interview.jdAnalysis?.categoryBreakdown) {
      // Core categories: Technical Skills, Cultural Fit, Experience Level
      const coreCategories = [
        { key: 'technicalSkills', name: 'Technical Skills', color: '#3b82f6', icon: '💻' },
        { key: 'culturalFit', name: 'Cultural Fit', color: '#f59e0b', icon: '🤝' },
        { key: 'experienceLevel', name: 'Experience Level', color: '#10b981', icon: '📈' }
      ];

      // Other skills categories
      const otherCategories = [
        { key: 'communication', name: 'Communication', color: '#ef4444', icon: '💬' },
        { key: 'problemSolving', name: 'Problem Solving', color: '#8b5cf6', icon: '🧩' },
        { key: 'leadership', name: 'Leadership', color: '#06b6d4', icon: '👑' },
        { key: 'industryKnowledge', name: 'Industry Knowledge', color: '#f97316', icon: '🏢' },
        { key: 'educationQualifications', name: 'Education', color: '#84cc16', icon: '🎓' },
        { key: 'softSkills', name: 'Soft Skills', color: '#ec4899', icon: '✨' },
        { key: 'motivationFit', name: 'Motivation Fit', color: '#14b8a6', icon: '🎯' }
      ];

      const mapCategoryData = (categories: any[]) => 
        categories.map((category) => {
          const categoryData = interview.jdAnalysis!.categoryBreakdown[category.key as keyof typeof interview.jdAnalysis.categoryBreakdown];
          return {
            name: category.name,
            value: Math.round(categoryData?.score || 0),
            color: category.color,
            icon: category.icon,
            details: categoryData?.details || 'No details available',
            // Add additional data for enhanced tooltips
            ...(category.key === 'technicalSkills' && categoryData && 'matchedSkills' in categoryData ? {
              matchedSkills: categoryData.matchedSkills,
              missingSkills: categoryData.missingSkills
            } : {}),
            ...(category.key === 'experienceLevel' && categoryData && 'yearsRequired' in categoryData ? {
              yearsRequired: categoryData.yearsRequired,
              yearsCandidate: categoryData.yearsCandidate
            } : {})
          };
        });

      return {
        coreData: mapCategoryData(coreCategories),
        otherData: mapCategoryData(otherCategories)
      };
    } else if (interview.jdAnalysis && interview.jdAnalysis.questionRelevance && interview.jdAnalysis.questionRelevance.length > 0) {
      // Fallback to questionRelevance if categoryBreakdown not available
      const categories = interview.jdAnalysis.questionRelevance.reduce((acc: Record<string, {score: number, count: number}>, q: any) => {
        const category = q.category || 'Other';
        if (!acc[category]) {
          acc[category] = { score: 0, count: 0 };
        }
        acc[category].score += q.relevanceScore || 0;
        acc[category].count += 1;
        return acc;
      }, {});

      const allData = Object.entries(categories).map(([name, data], index) => {
        const colors = [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
        ];
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: Math.round(data.score / data.count),
          color: colors[index % colors.length]
        };
      });

      // Split into core and other categories
      const coreData = allData.slice(0, 3);
      const otherData = allData.slice(3);
      
      return { coreData, otherData };
    } else if (interview.jdAnalysis?.overallScore) {
      // Final fallback to overall score
      const fallbackData = [
        { name: 'Overall Match', value: interview.jdAnalysis.overallScore, color: '#3b82f6' }
      ];
      return { coreData: fallbackData, otherData: [] };
    } else {
      return { coreData: [], otherData: [] };
    }
  };

  const { coreData, otherData } = getRelevanceData();

  const handleShareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Interview Analysis Report',
          text: `Analysis results for ${interview.fileName}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const handleDownloadPDFReport = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await fetch(`/api/interviews/${interview.id}/pdf`);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to generate PDF report: ${response.status} ${errorText}`);
      }

      // Extract filename from Content-Disposition header or create a clean one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `interview-analysis-${interview.fileName.replace(/\.[^/.]+$/, "")}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      
      // Check if blob has content
      if (blob.size === 0) {
        throw new Error('PDF file is empty');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PDF Report Downloaded",
        description: "Your interview analysis report has been downloaded successfully.",
      });

    } catch (error) {
      console.error('Error downloading PDF report:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadCandidateReport = async () => {
    if (isDownloadingCandidate) return;

    setIsDownloadingCandidate(true);
    try {
      const response = await fetch(`/api/interviews/${interview.id}/candidate-report`);
      
      if (!response.ok) {
        throw new Error('Failed to download candidate report');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `candidate-report-${interview.id}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Candidate Report Downloaded",
        description: "Candidate-specific report has been downloaded successfully.",
      });

    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download candidate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingCandidate(false);
    }
  };

  const handleDownloadRecruiterReport = async () => {
    if (isDownloadingRecruiter) return;

    setIsDownloadingRecruiter(true);
    try {
      const response = await fetch(`/api/interviews/${interview.id}/recruiter-report`);
      
      if (!response.ok) {
        throw new Error('Failed to download recruiter report');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `recruiter-report-${interview.id}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Recruiter Report Downloaded",
        description: "Recruiter-specific report has been downloaded successfully.",
      });

    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download recruiter report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingRecruiter(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="analysis-dashboard">
      {/* Privacy & Security Notice */}
      {(interview.piiRedacted || interview.encryptedTranscript) && (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-sm text-foreground flex items-center gap-4">
            <span>
              <Lock className="h-4 w-4 inline mr-1" />
              {interview.piiRedacted && "PII has been detected and redacted for privacy. "}
              {interview.encryptedTranscript && "Transcript is encrypted and stored securely."}
            </span>
            {hasEnhancedData && (
              <span className="text-primary font-medium">
                Enhanced Analysis Enabled
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Overview */}
      <MetricsCards metrics={metrics} />


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentChart data={sentimentData} onPointClick={handleSentimentPointClick} />
        <RelevanceChart 
          data={coreData} 
          title="Core Skills Match" 
        />
      </div>

      {/* Additional Skills Chart */}
      {otherData.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <RelevanceChart 
            data={otherData} 
            title="Other Skills & Qualifications" 
          />
        </div>
      )}

      {/* Conversation Analysis */}
      <div ref={conversationRef}>
        <ConversationAnalysis 
          qaAnalysis={report.qaAnalysis || []}
          insights={report.insights || []}
        />
      </div>

      {/* Training Recommendations */}
      {report.trainingRecommendations && (
        <TrainingRecommendations
          recommendations={report.trainingRecommendations.recommendations}
          performanceGaps={report.trainingRecommendations.performanceGaps}
          strengthAreas={report.trainingRecommendations.strengthAreas}
          overallRating={report.trainingRecommendations.overallRating}
        />
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Button 
            onClick={handleDownloadPDFReport}
            variant="default"
            disabled={isDownloading}
            className="w-full sm:w-auto"
            data-testid="button-download-pdf-report"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Download Full Report
              </>
            )}
          </Button>
          <Button 
            onClick={handleDownloadCandidateReport}
            variant="outline"
            disabled={isDownloadingCandidate}
            className="w-full sm:w-auto bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20"
            data-testid="button-download-candidate-report"
          >
            {isDownloadingCandidate ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Candidate Report
              </>
            )}
          </Button>
          <Button 
            onClick={handleDownloadRecruiterReport}
            variant="outline"
            disabled={isDownloadingRecruiter}
            className="w-full sm:w-auto bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20"
            data-testid="button-download-recruiter-report"
          >
            {isDownloadingRecruiter ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Recruiter Report
              </>
            )}
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleShareResults}
            className="w-full sm:w-auto"
            data-testid="button-share-results"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Results
          </Button>
        </div>
        
      </div>
    </div>
  );
}
