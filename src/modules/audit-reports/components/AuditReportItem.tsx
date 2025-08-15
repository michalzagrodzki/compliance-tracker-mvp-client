import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuditReport } from '../hooks/useAuditReport';
import {
  ArrowLeft,
  FileText,
  Shield,
  Download,
  CheckCircle,
  Users,
  AlertTriangle,
  Eye,
  Edit,
  Share,
  Printer,
  Building,
  FileCheck,
  UserCheck
} from 'lucide-react';
import ReportLoading from './detail/ReportLoading';
import ReportError from './detail/ReportError';
import EmptyReport from './detail/EmptyReport';
import ExecutiveSummaryCards from './detail/ExecutiveSummaryCards';
import ReportTextSection from './detail/ReportTextSection';
import DataSourcesCard from './detail/DataSourcesCard';
import ReportOverview from './detail/ReportOverview';
import AssessmentMetrics from './detail/AssessmentMetrics';
import ReportConfiguration from './detail/ReportConfiguration';
import QuickActions from './detail/QuickActions';
import ReportStatus from './detail/ReportStatus';
import ReportDetails from './detail/ReportDetails';
import ReportNotes from './detail/ReportNotes';
import AuditSessionComplianceGaps from '@/modules/audit/components/AuditSessionComplianceGaps';

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

export default function AuditReportItem() {
  const { reportId } = useParams<{ reportId: string }>();
  const { currentReport, isLoading, error, loadReport, clearError } = useAuditReport();

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

  if (isLoading) return <ReportLoading />;

  if (error) return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/audit-reports" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Reports</span>
          </Link>
        </Button>
      </div>
      <ReportError message={error} />
    </div>
  );

  if (!currentReport) return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/audit-reports" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Reports</span>
          </Link>
        </Button>
      </div>
      <EmptyReport />
    </div>
  );

  const reportTypeInfo = getReportTypeInfo(currentReport.report_type);
  const statusInfo = getStatusInfo(currentReport.report_status || 'draft');
  const StatusIcon = statusInfo.icon;

  const totalGaps = currentReport.total_gaps_identified === 0 
    ? (currentReport.compliance_gap_ids?.length || 0)
    : (currentReport.total_gaps_identified || 0);

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
            <Button variant="outline" size="sm" asChild>
              <Link to={`/audit-reports/${reportId}/edit`}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
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
      <ExecutiveSummaryCards report={currentReport} totalGaps={totalGaps} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ReportOverview report={currentReport} />
          <AssessmentMetrics report={currentReport} />

          {currentReport.executive_summary && (
            <ReportTextSection title="Executive Summary" icon={FileText} content={currentReport.executive_summary} />
          )}
          <AuditSessionComplianceGaps 
            sessionId={currentReport.audit_session_id}
            complianceDomain={currentReport.compliance_domain}
          />
          {currentReport.control_risk_prioritization && (
            <ReportTextSection title="Control Risk Prioritization" icon={Shield} content={currentReport.control_risk_prioritization} />
          )}

          {currentReport.threat_intelligence_analysis && (
            <ReportTextSection title="Threat Intelligence Analysis" icon={AlertTriangle} content={currentReport.threat_intelligence_analysis} />
          )}

          {currentReport.target_audience_summary && (
            <ReportTextSection title="Target Audience Summary" icon={Users} content={currentReport.target_audience_summary} />
          )}

          <ReportConfiguration report={currentReport} />

        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions reportId={reportId!} sessionId={currentReport.audit_session_id} />
            </CardContent>
          </Card>
          <ReportStatus report={currentReport} />
          <ReportDetails report={currentReport} />
          <DataSourcesCard report={currentReport} />
        </div>
      </div>

      <ReportNotes report={currentReport} />

    </div>
  );
}
