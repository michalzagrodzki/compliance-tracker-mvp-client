import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { useAuditReport } from '../hooks/useAuditReport';
import AuditReportsLoading from './AuditReportsLoading';
import AuditReportsError from './list/AuditReportsError';
import AuditReportsFilters, { type ReportFilters } from './list/AuditReportsFilters';
import AuditReportsGrid from './list/AuditReportsGrid';

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
  const [filters, setFilters] = useState<ReportFilters>({
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

  const handleFilterChange = (filterKey: keyof ReportFilters, value: string) => {
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
    return <AuditReportsLoading />;
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
      {error && <AuditReportsError message={error} />}
      <AuditReportsFilters
        searchTerm={searchTerm}
        onSearch={handleSearch}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(v => !v)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={clearFilters}
      />
      <AuditReportsGrid
        reports={reports}
        filteredReports={filteredReports}
        onCreateFirstReport={() => navigate('/audit-sessions')}
      />
    </div>
  );
}
