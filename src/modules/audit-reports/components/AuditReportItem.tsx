import { useEffect, useState, type Key } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuditReport } from '../hooks/useAuditReport';
import { 
  ArrowLeft,
  FileText,
  Calendar,
  Shield,
  User,
  Download,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Users,
  AlertTriangle,
  Activity,
  Eye,
  Edit,
  Share,
  Printer,
  Mail,
  Building,
  Target,
  ChevronRight,
  FileCheck,
  UserCheck,
  Loader2,
  Globe,
  Lock,
  Settings,
  Database,
  Key as KeyIcon,
} from 'lucide-react';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};

const getReportTypeInfo = (reportType: string) => {
  const types = {
    'compliance_audit': {
      label: 'Compliance Audit',
      icon: Shield,
      description: 'Comprehensive compliance assessment',
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    'gap_analysis': {
      label: 'Gap Analysis',
      icon: AlertTriangle,
      description: 'Analysis of compliance gaps',
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    },
    'regulatory_review': {
      label: 'Regulatory Review',
      icon: FileCheck,
      description: 'Review of regulatory requirements',
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    'external_audit': {
      label: 'External Audit',
      icon: Building,
      description: 'External auditor review report',
      color: 'text-red-600 bg-red-50 border-red-200'
    },
    'internal_review': {
      label: 'Internal Review',
      icon: Users,
      description: 'Internal assessment report',
      color: 'text-green-600 bg-green-50 border-green-200'
    }
  };
  
  return types[reportType as keyof typeof types] || types.compliance_audit;
};

const getStatusInfo = (status: string) => {
  const statuses = {
    'draft': {
      icon: Edit,
      label: 'Draft',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      description: 'Report is in draft status'
    },
    'completed': {
      icon: CheckCircle,
      label: 'Completed',
      color: 'text-green-600 bg-green-50 border-green-200',
      description: 'Report has been finalized'
    },
    'in_review': {
      icon: Eye,
      label: 'Under Review',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      description: 'Report is being reviewed'
    },
    'approved': {
      icon: UserCheck,
      label: 'Approved',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      description: 'Report has been approved'
    }
  };
  
  return statuses[status as keyof typeof statuses] || statuses.draft;
};

const getConfidentialityInfo = (level: string) => {
  const levels = {
    'public': {
      icon: Globe,
      label: 'Public',
      color: 'text-green-600 bg-green-50 border-green-200',
      description: 'Can be shared publicly'
    },
    'internal': {
      icon: Building,
      label: 'Internal',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      description: 'Internal use only'
    },
    'confidential': {
      icon: Lock,
      label: 'Confidential',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      description: 'Restricted access'
    },
    'restricted': {
      icon: KeyIcon,
      label: 'Restricted',
      color: 'text-red-600 bg-red-50 border-red-200',
      description: 'Highest confidentiality'
    }
  };
  
  return levels[level as keyof typeof levels] || levels.internal;
};

const getAudienceInfo = (audience: string) => {
  const audiences = {
    'executives': {
      label: 'Executive Leadership',
      icon: Users,
      description: 'C-suite and senior management'
    },
    'compliance_team': {
      label: 'Compliance Team',
      icon: Shield,
      description: 'Compliance officers and risk teams'
    },
    'auditors': {
      label: 'Auditors',
      icon: FileCheck,
      description: 'Internal and external auditors'
    },
    'regulators': {
      label: 'Regulatory Bodies',
      icon: Building,
      description: 'Government and regulatory authorities'
    }
  };
  
  return audiences[audience as keyof typeof audiences] || audiences.compliance_team;
};

export default function AuditReportItem() {
  const { reportId } = useParams<{ reportId: string }>();
  const { currentReport, isLoading, error, loadReport, clearError } = useAuditReport();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  useEffect(() => {
    if (reportId) {
      clearError();
      loadReport(reportId).catch((err) => {
        console.error('Error fetching audit report:', err);
      });
    } else {
      console.warn('No report ID provided');
    }
  }, [reportId, loadReport, clearError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading audit report...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/audit-reports" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Reports</span>
            </Link>
          </Button>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center space-x-2 pt-6">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive">{error}</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/audit-reports" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Reports</span>
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Report not found</h3>
            <p className="text-muted-foreground">The audit report you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reportTypeInfo = getReportTypeInfo(currentReport.report_type);
  const statusInfo = getStatusInfo(currentReport.report_status || 'draft');
  const confidentialityInfo = getConfidentialityInfo(currentReport.confidentiality_level);
  const audienceInfo = getAudienceInfo(currentReport.target_audience);
  const ReportTypeIcon = reportTypeInfo.icon;
  const StatusIcon = statusInfo.icon;
  const ConfidentialityIcon = confidentialityInfo.icon;
  const AudienceIcon = audienceInfo.icon;

  const totalGaps = currentReport.total_gaps_identified;

  const hasMetrics = totalGaps > 0 || currentReport.total_questions_asked > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/audit-reports" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Reports</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <span>{currentReport.report_title}</span>
            </h1>
            <p className="text-muted-foreground">
              {reportTypeInfo.label} • {currentReport.compliance_domain}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusInfo.color}`}>
            <StatusIcon className="h-3 w-3 inline mr-1" />
            {statusInfo.label}
          </span>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalGaps}</p>
                <p className="text-sm text-muted-foreground">Total Gaps</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {currentReport.critical_gaps_count + currentReport.high_risk_gaps_count}
                </p>
                <p className="text-sm text-muted-foreground">Critical & High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {currentReport.questions_answered_satisfactorily || 0}
                </p>
                <p className="text-sm text-muted-foreground">Satisfactory Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {currentReport.document_ids.length + currentReport.compliance_gap_ids.length}
                </p>
                <p className="text-sm text-muted-foreground">Data Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ReportTypeIcon className="h-5 w-5" />
                <span>Report Overview</span>
              </CardTitle>
              <CardDescription>
                {reportTypeInfo.description} for {currentReport.compliance_domain}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Report Type</h4>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${reportTypeInfo.color}`}>
                    <ReportTypeIcon className="h-3 w-3 mr-1" />
                    {reportTypeInfo.label}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Compliance Domain</h4>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{currentReport.compliance_domain}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Target Audience</h4>
                  <div className="flex items-center space-x-2">
                    <AudienceIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{audienceInfo.label}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Confidentiality Level</h4>
                  <div className={`inline-flex items-center px-2 py-1 rounded border text-sm font-medium ${confidentialityInfo.color}`}>
                    <ConfidentialityIcon className="h-3 w-3 mr-1" />
                    {confidentialityInfo.label}
                  </div>
                </div>
              </div>

              {currentReport.external_auditor_access && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-amber-600" />
                    <p className="text-sm font-medium text-amber-800">
                      External Auditor Access Enabled
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {hasMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Risk Analysis</span>
                </CardTitle>
                <CardDescription>
                  Breakdown of compliance gaps by risk level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border border-red-200 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {currentReport.critical_gaps_count}
                    </p>
                    <p className="text-sm font-medium text-red-800">Critical</p>
                  </div>
                  <div className="text-center p-3 border border-orange-200 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {currentReport.high_risk_gaps_count}
                    </p>
                    <p className="text-sm font-medium text-orange-800">High Risk</p>
                  </div>
                  <div className="text-center p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {currentReport.medium_risk_gaps_count}
                    </p>
                    <p className="text-sm font-medium text-yellow-800">Medium Risk</p>
                  </div>
                  <div className="text-center p-3 border border-green-200 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {currentReport.low_risk_gaps_count}
                    </p>
                    <p className="text-sm font-medium text-green-800">Low Risk</p>
                  </div>
                </div>

                {(currentReport.critical_gaps_count > 0 || currentReport.high_risk_gaps_count > 0) && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800">Immediate Action Required</h4>
                        <p className="text-sm text-red-700 mt-1">
                          {currentReport.critical_gaps_count + currentReport.high_risk_gaps_count} high-priority 
                          compliance gaps require immediate executive attention and resource allocation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Assessment Metrics</span>
              </CardTitle>
              <CardDescription>
                Key performance indicators from the audit process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Questions Asked</h4>
                  <p className="text-xl font-bold">{currentReport.total_questions_asked}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Satisfactory Answers</h4>
                  <p className="text-xl font-bold text-green-600">
                    {currentReport.questions_answered_satisfactorily}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Success Rate</h4>
                  <p className="text-xl font-bold">
                    {currentReport.total_questions_asked > 0 
                      ? Math.round((currentReport.questions_answered_satisfactorily / currentReport.total_questions_asked) * 100)
                      : 0}%
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Documents Analyzed</h4>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{currentReport.document_ids.length} documents</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Compliance Gaps</h4>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>{currentReport.compliance_gap_ids.length} gaps identified</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Report Configuration</span>
              </CardTitle>
              <CardDescription>
                Content settings and generation options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${currentReport.include_technical_details ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Technical Details</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${currentReport.include_source_citations ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Source Citations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${currentReport.include_confidence_scores ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Confidence Scores</span>
                </div>
              </div>

              {currentReport.template_used && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Template Used</h4>
                  <p className="text-sm">{currentReport.template_used}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link to={`/audit-sessions/${currentReport.audit_session_id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Audit Session
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Email Report
              </Button>
              
              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Current Status</h4>
                <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${statusInfo.color}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </div>
                <p className="text-xs text-muted-foreground">{statusInfo.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Generated</h4>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDate(currentReport.report_generated_at)}
                  </span>
                </div>
              </div>

              {currentReport.report_finalized_at && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Finalized</h4>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDate(currentReport.report_finalized_at)}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Last Modified</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(currentReport.last_modified_at)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Report ID</h4>
                <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                  {currentReport.id}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">User ID</h4>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-mono">{currentReport.user_id}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Export Formats</h4>
                <div className="flex flex-wrap gap-1">
                  {currentReport.export_formats.map((format: string, index: Key | null | undefined) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded border"
                    >
                      {format.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Auto Generated</h4>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${currentReport.auto_generated ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">{currentReport.auto_generated ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-muted-foreground" 
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
                <ChevronRight className={`h-4 w-4 ml-auto transform transition-transform ${showTechnicalDetails ? 'rotate-90' : ''}`} />
              </Button>

              {showTechnicalDetails && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs text-muted-foreground">Session ID</h4>
                    <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                      {currentReport.audit_session_id}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-xs text-muted-foreground">Created</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(currentReport.created_at)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-xs text-muted-foreground">Updated</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(currentReport.updated_at)}
                    </p>
                  </div>

                  {currentReport.generated_by && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-xs text-muted-foreground">Generated By</h4>
                      <p className="text-xs font-mono">{currentReport.generated_by}</p>
                    </div>
                  )}

                  {currentReport.reviewed_by && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-xs text-muted-foreground">Reviewed By</h4>
                      <p className="text-xs font-mono">{currentReport.reviewed_by}</p>
                    </div>
                  )}

                  {currentReport.approved_by && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-xs text-muted-foreground">Approved By</h4>
                      <p className="text-xs font-mono">{currentReport.approved_by}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Documents</span>
                  </div>
                  <span className="text-sm font-bold">{currentReport.document_ids.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Compliance Gaps</span>
                  </div>
                  <span className="text-sm font-bold">{currentReport.compliance_gap_ids.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Chat History</span>
                  </div>
                  <span className="text-sm font-bold">{currentReport.chat_history_ids.length}</span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to={`/audit-sessions/${currentReport.audit_session_id}`}>
                  <Database className="h-4 w-4 mr-2" />
                  View Source Data
                </Link>
              </Button>
            </CardContent>
          </Card>

          {totalGaps > 0 && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-blue-800">Key Findings</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{totalGaps} compliance gaps identified across {currentReport.compliance_domain}</span>
                    </li>
                    {(currentReport.critical_gaps_count > 0 || currentReport.high_risk_gaps_count > 0) && (
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          {currentReport.critical_gaps_count + currentReport.high_risk_gaps_count} high-priority gaps require immediate action
                        </span>
                      </li>
                    )}
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span>
                        {currentReport.questions_answered_satisfactorily} of {currentReport.total_questions_asked} questions answered satisfactorily
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-blue-200">
                  <h4 className="font-medium text-sm text-blue-800 mb-2">Recommended Actions</h4>
                  <div className="space-y-2">
                    {currentReport.critical_gaps_count > 0 && (
                      <div className="p-2 bg-red-100 border border-red-200 rounded text-xs">
                        <span className="font-medium text-red-800">Immediate:</span>
                        <span className="text-red-700 ml-1">Address {currentReport.critical_gaps_count} critical gaps</span>
                      </div>
                    )}
                    {currentReport.high_risk_gaps_count > 0 && (
                      <div className="p-2 bg-orange-100 border border-orange-200 rounded text-xs">
                        <span className="font-medium text-orange-800">Priority:</span>
                        <span className="text-orange-700 ml-1">Plan for {currentReport.high_risk_gaps_count} high-risk items</span>
                      </div>
                    )}
                    <div className="p-2 bg-blue-100 border border-blue-200 rounded text-xs">
                      <span className="font-medium text-blue-800">Strategic:</span>
                      <span className="text-blue-700 ml-1">Review and enhance {currentReport.compliance_domain} framework</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm">
            <h4 className="font-medium">Report Notes</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>This report was generated using automated analysis of compliance data</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Review findings with subject matter experts before making strategic decisions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Regular monitoring and follow-up assessments are recommended</span>
              </li>
              {currentReport.confidentiality_level === 'restricted' && (
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-red-600 font-medium">This report contains sensitive information - handle according to confidentiality protocols</span>
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}