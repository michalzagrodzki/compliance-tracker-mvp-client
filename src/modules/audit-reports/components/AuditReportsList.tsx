import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Shield, 
  Filter,
  Search,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { useAuditReport } from '../hooks/useAuditReport';
import Loading from '@/components/Loading';
import type { 
  ReportType, 
  TargetAudience, 
  ConfidentialityLevel
} from '../types';

import { 
  REPORT_TYPE_OPTIONS,
  TARGET_AUDIENCE_OPTIONS,
  CONFIDENTIALITY_LEVEL_OPTIONS 
} from '../types';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getReportTypeInfo = (reportType: ReportType) => {
  return REPORT_TYPE_OPTIONS.find(option => option.value === reportType) || {
    value: reportType,
    label: reportType,
    description: ''
  };
};

const getTargetAudienceInfo = (audience: TargetAudience) => {
  return TARGET_AUDIENCE_OPTIONS.find(option => option.value === audience) || {
    value: audience,
    label: audience,
    description: ''
  };
};

const getConfidentialityInfo = (level: ConfidentialityLevel) => {
  return CONFIDENTIALITY_LEVEL_OPTIONS.find(option => option.value === level) || {
    value: level,
    label: level,
    description: '',
    color: 'bg-gray-100 text-gray-800'
  };
};

export default function AuditReportsList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    reports,
    isLoading,
    error,
    loadReports,
    clearError
  } = useAuditReport();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    reportType: '',
    targetAudience: '',
    confidentialityLevel: '',
    dateRange: ''
  });

  useEffect(() => {
    if (user?.id) {
      loadReports();
    }
  }, [user?.id, loadReports]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      reportType: '',
      targetAudience: '',
      confidentialityLevel: '',
      dateRange: ''
    });
    setSearchTerm('');
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchTerm || 
      report.report_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.compliance_domain.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesReportType = !filters.reportType || report.report_type === filters.reportType;
    const matchesAudience = !filters.targetAudience || report.target_audience === filters.targetAudience;
    const matchesConfidentiality = !filters.confidentialityLevel || report.confidentiality_level === filters.confidentialityLevel;

    return matchesSearch && matchesReportType && matchesAudience && matchesConfidentiality;
  });

  const handleRefresh = () => {
    clearError();
    if (user?.id) {
      loadReports();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Reports</h1>
          <p className="text-muted-foreground">
            View and manage your audit reports and compliance documentation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={() => navigate('/audit-reports/new')}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Audit Report</span>
          </Button>
        </div>
      </div>
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center space-x-2 pt-6">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-700">{error}</span>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports by title or compliance domain..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
              {(searchTerm || Object.values(filters).some(f => f)) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  Clear
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <select
                    value={filters.reportType}
                    onChange={(e) => handleFilterChange('reportType', e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Types</option>
                    {REPORT_TYPE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <select
                    value={filters.targetAudience}
                    onChange={(e) => handleFilterChange('targetAudience', e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Audiences</option>
                    {TARGET_AUDIENCE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confidentiality</label>
                  <select
                    value={filters.confidentialityLevel}
                    onChange={(e) => handleFilterChange('confidentialityLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Levels</option>
                    {CONFIDENTIALITY_LEVEL_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">
              {reports.length === 0 ? 'No audit reports found' : 'No reports match your filters'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {reports.length === 0 
                ? 'Create your first audit report from an audit session.'
                : 'Try adjusting your search criteria or filters.'
              }
            </p>
            {reports.length === 0 && (
              <Button
                onClick={() => navigate('/audit-sessions')}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Report</span>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => {
            const reportTypeInfo = getReportTypeInfo(report.report_type);
            const audienceInfo = getTargetAudienceInfo(report.target_audience);
            const confidentialityInfo = getConfidentialityInfo(report.confidentiality_level);

            return (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {report.report_title}
                      </CardTitle>
                      <CardDescription>
                        {report.compliance_domain} • {reportTypeInfo.label}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${confidentialityInfo.color}`}>
                        {confidentialityInfo.label}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Audience:</span>
                      <span>{audienceInfo.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span>{formatDate(report.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">External Access:</span>
                    {report.external_auditor_access ? (
                      <span className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Enabled</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Disabled</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Includes:</span>
                    <div className="flex flex-wrap gap-1">
                      {report.include_source_citations && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          Citations
                        </span>
                      )}
                      {report.include_technical_details && (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                          Technical
                        </span>
                      )}
                      {report.include_confidence_scores && (
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                          Confidence
                        </span>
                      )}
                    </div>
                  </div>

                  {report.template_used && (
                    <div className="text-sm text-muted-foreground">
                      Template: {report.template_used}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Report ID: {report.id.slice(0, 8)}...
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex items-center space-x-1"
                      >
                        <Link to={`/audit-reports/${report.id}`}>
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </Link>
                      </Button>
                      {report.download_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                          onClick={() => window.open(report.download_url, '_blank')}
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {filteredReports.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredReports.length} of {reports.length} audit reports
        </div>
      )}
    </div>
  );
}