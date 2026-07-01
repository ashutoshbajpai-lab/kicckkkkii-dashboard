import React, { useState, useMemo, useCallback } from 'react';
import {
  LayoutDashboard, School, CreditCard, Wallet, BarChart3, Users,
  Activity, HelpCircle, LogOut, Search, Bell, Database,
  Eye, EyeOff, Trash2, ArrowUpRight, ArrowDownRight,
  X, FileText, UserPlus, Download, CheckCircle, Clock,
  MapPin, Plus, MessageSquare, Phone, Mail, ExternalLink,
  ChevronDown, ChevronUp, TrendingUp, AlertTriangle, Shield,
  RefreshCw, BookOpen, Zap
} from 'lucide-react';
import {
  initialInstitutes, initialTransactions, initialSettlements,
  initialTeam, initialSystemLogs, geographicDistribution
} from './mockData';

// ─── Utilities ────────────────────────────────────────────────────────────────
const maskEmail = (email) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name.substring(0, 2)}***${name.slice(-1)}@${domain}`;
};
const maskPhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return `${digits.substring(0, 3)}****${digits.slice(-3)}`;
};
const fmtINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (s) => s ? s.split('T')[0] : '—';

const modeBadge = (mode) => {
  if (mode === 'EMI') return <span className="badge badge-emi">EMI</span>;
  if (mode === 'PG') return <span className="badge badge-pg">PG</span>;
  if (mode === 'Auto-Debit') return <span className="badge badge-ad">Auto-Debit</span>;
  return <span className="badge badge-inactive">{mode}</span>;
};

const statusBadge = (s) => {
  if (s === 'Success' || s === 'Settled') return <span className="badge badge-success">{s}</span>;
  if (s === 'Pending') return <span className="badge badge-pending">{s}</span>;
  if (s === 'Failed') return <span className="badge badge-failed">{s}</span>;
  if (s === 'Active') return <span className="badge badge-active">{s}</span>;
  return <span className="badge badge-inactive">{s}</span>;
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  // Auth state
  const [authed, setAuthed] = useState(false);
  const [emailInput, setEmailInput] = useState('admin@partner.com');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Data
  const [institutes, setInstitutes] = useState(initialInstitutes);
  const [transactions] = useState(initialTransactions);
  const [settlements] = useState(initialSettlements);
  const [team, setTeam] = useState(initialTeam);
  const [logs, setLogs] = useState(initialSystemLogs);

  // Navigation
  const [activePage, setActivePage] = useState('overview');
  const [instituteSubTab, setInstituteSubTab] = useState('oper'); // oper | tech
  const [drilldownInstId, setDrilldownInstId] = useState(null);
  const [drilldownSection, setDrilldownSection] = useState('txn'); // txn | settlement | commission

  // UI toggles
  const [showSecrets, setShowSecrets] = useState({});
  const [unmaskPII, setUnmaskPII] = useState(false);
  const [expandedSettlDate, setExpandedSettlDate] = useState(null);
  const [receiptTxn, setReceiptTxn] = useState(null);
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Accountant' });
  const [searchQ, setSearchQ] = useState('');
  const [webhookModalInst, setWebhookModalInst] = useState(null);
  const [tempEvents, setTempEvents] = useState([]);

  // Page-specific filters
  const [overviewDateStart, setOverviewDateStart] = useState('');
  const [overviewDateEnd, setOverviewDateEnd] = useState('');

  // Transactions page filters
  const [txnModeFilter, setTxnModeFilter] = useState('All');
  const [txnStatusFilter, setTxnStatusFilter] = useState('All');
  const [txnInstFilter, setTxnInstFilter] = useState('All');
  const [txnDateStart, setTxnDateStart] = useState('');
  const [txnDateEnd, setTxnDateEnd] = useState('');
  const [txnDisbStart, setTxnDisbStart] = useState('');
  const [txnDisbEnd, setTxnDisbEnd] = useState('');
  const [txnSearch, setTxnSearch] = useState('');

  // Settlements page filters
  const [settlModeFilter, setSettlModeFilter] = useState('All');
  const [settlInstFilter, setSettlInstFilter] = useState('All');
  const [settlDateStart, setSettlDateStart] = useState('');
  const [settlDateEnd, setSettlDateEnd] = useState('');
  const [settlDisbStart, setSettlDisbStart] = useState('');
  const [settlDisbEnd, setSettlDisbEnd] = useState('');
  const [settlSearch, setSettlSearch] = useState('');

  // Commissions page filters
  const [commModeFilter, setCommModeFilter] = useState('All');
  const [commInstFilter, setCommInstFilter] = useState('All');
  const [commStatusFilter, setCommStatusFilter] = useState('All');
  const [commDateStart, setCommDateStart] = useState('');
  const [commDateEnd, setCommDateEnd] = useState('');

  // Institutes page filters
  const [instGroupFilter, setInstGroupFilter] = useState('All');
  const [selectedInstIds, setSelectedInstIds] = useState([]);

  // Reports page state
  const [reportType, setReportType] = useState('settlement');         // settlement | transaction | commission | onboarding | gile-performance | reconciliation
  const [reportMode, setReportMode] = useState('All');                // All | EMI | PG | Auto-Debit
  const [reportInst, setReportInst] = useState('All');
  const [reportStatus, setReportStatus] = useState('All');            // All | Success | Pending | Failed | Paid | Pending
  const [reportDateStart, setReportDateStart] = useState('');
  const [reportDateEnd, setReportDateEnd] = useState('');
  const [reportDisbStart, setReportDisbStart] = useState('');
  const [reportDisbEnd, setReportDisbEnd] = useState('');
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportHistory, setReportHistory] = useState([
    { id: 'rpt-1', name: 'Settlement Report · All Modes', generatedBy: 'rahul@grayquest.com', generatedAt: '2026-06-30 10:15', rows: 120, type: 'settlement' },
    { id: 'rpt-2', name: 'Transaction Report · EMI', generatedBy: 'priya@grayquest.com', generatedAt: '2026-06-29 16:32', rows: 85, type: 'transaction' },
    { id: 'rpt-3', name: 'Commission Report · PG', generatedBy: 'rahul@grayquest.com', generatedAt: '2026-06-28 11:05', rows: 43, type: 'commission' }
  ]);

  // ── Auth handlers ────────────────────────────────────────────────────────────
  const handleSendOTP = (e) => {
    e.preventDefault();
    setOtpSent(true);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const role = emailInput.toLowerCase().includes('accountant') ? 'Accountant' : 'Admin';
    const user = { email: emailInput, role, name: emailInput.split('@')[0] };
    setCurrentUser(user);
    setAuthed(true);
    addLog(`User logged in via 2FA as ${role}`, 'Security');
  };

  const handleLogout = () => {
    setAuthed(false); setOtpSent(false); setOtpInput(''); setCurrentUser(null);
  };

  const addLog = useCallback((action, type) => {
    setLogs(prev => [{
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: currentUser?.email || emailInput,
      action, type
    }, ...prev]);
  }, [currentUser, emailInput]);

  // ── Data mutations ───────────────────────────────────────────────────────────
  const updateWebhookUrl = (id, url) => {
    setInstitutes(p => p.map(i => i.id === id ? { ...i, webhookUrl: url } : i));
    addLog(`Webhook URL updated for GILE ${id}`, 'Security');
  };

  const updateEvents = (id, evts) => {
    setInstitutes(p => p.map(i => i.id === id ? { ...i, events: evts } : i));
  };

  const deleteInstitute = (id) => {
    if (currentUser?.role !== 'Admin') return alert('Only Admins can delete GILE profiles.');
    if (!confirm('Delete this GILE? This is irreversible.')) return;
    setInstitutes(p => p.filter(i => i.id !== id));
    addLog(`Deleted GILE profile: ${id}`, 'Security');
  };

  const toggleInstStatus = (id) => {
    setInstitutes(p => p.map(i => i.id === id
      ? { ...i, status: i.status === 'Active' ? 'Inactive' : 'Active' } : i));
  };

  const toggleFeeStatus = (instId, feeId) => {
    setInstitutes(p => p.map(i => i.id !== instId ? i : {
      ...i, feeHeaders: i.feeHeaders.map(f =>
        f.id === feeId ? { ...f, status: f.status === 'Active' ? 'Inactive' : 'Active' } : f)
    }));
  };

  const toggleProductStatus = (instId, prodId) => {
    setInstitutes(p => p.map(i => i.id !== instId ? i : {
      ...i, enabledProducts: i.enabledProducts.map(prod =>
        prod.id === prodId ? { ...prod, status: prod.status === 'Active' ? 'Inactive' : 'Active' } : prod)
    }));
  };

  const addTeamMember = (e) => {
    e.preventDefault();
    const m = { id: `team-${Date.now()}`, ...newMember, status: 'Active' };
    setTeam(p => [...p, m]);
    setAddTeamOpen(false);
    setNewMember({ name: '', email: '', role: 'Accountant' });
    addLog(`Added team member ${m.name} as ${m.role}`, 'RBAC');
  };

  // ── CSV export ───────────────────────────────────────────────────────────────
  const exportCSV = (data, filename) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\r\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    addLog(`Exported ${filename}`, 'Export');
  };

  // ── Derived data ─────────────────────────────────────────────────────────────
  const groupsList = useMemo(() => ['All', ...new Set(institutes.map(i => i.group))], [institutes]);

  const filteredInstitutes = useMemo(() => {
    let list = institutes;
    if (instGroupFilter !== 'All') list = list.filter(i => i.group === instGroupFilter);
    if (selectedInstIds.length) list = list.filter(i => selectedInstIds.includes(i.id));
    return list;
  }, [institutes, instGroupFilter, selectedInstIds]);

  // Filtered transactions
  const filteredTxns = useMemo(() => {
    return transactions.filter(t => {
      if (txnModeFilter !== 'All' && t.paymentMode !== txnModeFilter) return false;
      if (txnStatusFilter !== 'All' && t.status !== txnStatusFilter) return false;
      if (txnInstFilter !== 'All' && t.instituteId !== txnInstFilter) return false;
      if (txnDateStart && t.createdAt < txnDateStart) return false;
      if (txnDateEnd && t.createdAt > txnDateEnd + 'T99') return false;
      // Disbursement filter — only applicable for EMI
      if (txnDisbStart && t.paymentMode === 'EMI' && t.disbursementDate && t.disbursementDate < txnDisbStart) return false;
      if (txnDisbEnd && t.paymentMode === 'EMI' && t.disbursementDate && t.disbursementDate > txnDisbEnd) return false;
      if (txnSearch) {
        const q = txnSearch.toLowerCase();
        if (!t.studentName.toLowerCase().includes(q) &&
            !t.studentId.toLowerCase().includes(q) &&
            !t.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [transactions, txnModeFilter, txnStatusFilter, txnInstFilter, txnDateStart, txnDateEnd, txnDisbStart, txnDisbEnd, txnSearch]);

  // Transactions KPIs
  const txnKPIs = useMemo(() => {
    const success = filteredTxns.filter(t => t.status === 'Success');
    const pending = filteredTxns.filter(t => t.status === 'Pending');
    const failed = filteredTxns.filter(t => t.status === 'Failed');
    return {
      successCount: success.length,
      successVal: success.reduce((a, t) => a + t.amount, 0),
      pendingVal: pending.reduce((a, t) => a + t.amount, 0),
      failedCount: failed.length,
      total: filteredTxns.length,
      rate: filteredTxns.length ? ((success.length / filteredTxns.length) * 100).toFixed(1) : 0
    };
  }, [filteredTxns]);

  // Filtered settlements
  const filteredSettlements = useMemo(() => {
    return settlements.filter(s => {
      if (settlModeFilter !== 'All' && s.paymentMode !== settlModeFilter) return false;
      if (settlInstFilter !== 'All' && s.instituteId !== settlInstFilter) return false;
      if (settlDateStart && s.settlementDate < settlDateStart) return false;
      if (settlDateEnd && s.settlementDate > settlDateEnd) return false;
      // Disbursement filter — EMI only
      if (settlDisbStart && s.paymentMode === 'EMI' && s.disbursementDate && s.disbursementDate < settlDisbStart) return false;
      if (settlDisbEnd && s.paymentMode === 'EMI' && s.disbursementDate && s.disbursementDate > settlDisbEnd) return false;
      if (settlSearch) {
        const q = settlSearch.toLowerCase();
        if (!s.studentName.toLowerCase().includes(q) &&
            !s.studentId.toLowerCase().includes(q) &&
            !s.utr.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [settlements, settlModeFilter, settlInstFilter, settlDateStart, settlDateEnd, settlDisbStart, settlDisbEnd, settlSearch]);

  // Settlement KPIs
  const settlKPIs = useMemo(() => {
    const total = filteredSettlements.reduce((a, s) => a + s.amount, 0);
    const count = filteredSettlements.length;
    const unsettled = transactions.filter(t => t.status === 'Success' && !t.settledAt).reduce((a, t) => a + t.amount, 0);
    return { total, count, unsettled };
  }, [filteredSettlements, transactions]);

  // Commission data
  const filteredCommissions = useMemo(() => {
    return transactions.filter(t => {
      if (t.status !== 'Success') return false;
      if (commModeFilter !== 'All' && t.paymentMode !== commModeFilter) return false;
      if (commInstFilter !== 'All' && t.instituteId !== commInstFilter) return false;
      if (commStatusFilter === 'Paid' && !t.commissionPaid) return false;
      if (commStatusFilter === 'Pending' && t.commissionPaid) return false;
      if (commDateStart && t.createdAt < commDateStart) return false;
      if (commDateEnd && t.createdAt > commDateEnd + 'T99') return false;
      return true;
    });
  }, [transactions, commModeFilter, commInstFilter, commStatusFilter, commDateStart, commDateEnd]);

  const commKPIs = useMemo(() => {
    const received = filteredCommissions.filter(t => t.commissionPaid).reduce((a, t) => a + t.commissionEarned, 0);
    const expected = filteredCommissions.filter(t => !t.commissionPaid).reduce((a, t) => a + t.commissionEarned, 0);
    const rates = filteredCommissions.map(t => t.commissionRate);
    const avgRate = rates.length ? (rates.reduce((a, r) => a + r, 0) / rates.length).toFixed(2) : 0;
    return { received, expected, avgRate, total: filteredCommissions.length };
  }, [filteredCommissions]);

  // Overview KPIs
  const overviewKPIs = useMemo(() => {
    let txns = transactions.filter(t => t.status === 'Success');
    if (overviewDateStart) txns = txns.filter(t => t.createdAt >= overviewDateStart);
    if (overviewDateEnd) txns = txns.filter(t => t.createdAt <= overviewDateEnd + 'T99');
    const gmv = txns.reduce((a, t) => a + t.amount, 0);
    const comm = txns.reduce((a, t) => a + t.commissionEarned, 0);
    const pendComm = transactions.filter(t => t.status === 'Pending').reduce((a, t) => a + t.commissionEarned, 0);
    const activeCount = institutes.filter(i => i.status === 'Active').length;
    const inactiveCount = institutes.filter(i => i.status === 'Inactive').length;
    const emiComm = txns.filter(t => t.paymentMode === 'EMI').reduce((a, t) => a + t.commissionEarned, 0);
    const pgComm = txns.filter(t => t.paymentMode === 'PG').reduce((a, t) => a + t.commissionEarned, 0);
    const adComm = txns.filter(t => t.paymentMode === 'Auto-Debit').reduce((a, t) => a + t.commissionEarned, 0);
    return { gmv, comm, pendComm, activeCount, inactiveCount, emiComm, pgComm, adComm, total: institutes.length };
  }, [transactions, institutes, overviewDateStart, overviewDateEnd]);

  // Drilldown derived
  const drillInst = useMemo(() => institutes.find(i => i.id === drilldownInstId), [institutes, drilldownInstId]);
  const drillTxns = useMemo(() => transactions.filter(t => t.instituteId === drilldownInstId), [transactions, drilldownInstId]);
  const drillSettlements = useMemo(() => settlements.filter(s => s.instituteId === drilldownInstId), [settlements, drilldownInstId]);
  const drillComms = useMemo(() => transactions.filter(t => t.instituteId === drilldownInstId && t.status === 'Success'), [transactions, drilldownInstId]);
  const drillGMV = useMemo(() => drillTxns.filter(t => t.status === 'Success').reduce((a, t) => a + t.amount, 0), [drillTxns]);
  const totalNetworkGMV = useMemo(() => transactions.filter(t => t.status === 'Success').reduce((a, t) => a + t.amount, 0), [transactions]);

  const navigate = (page) => {
    setActivePage(page);
    setDrilldownInstId(null);
  };

  const openDrilldown = (id) => {
    setDrilldownInstId(id);
    setDrilldownSection('txn');
    setActivePage('institutes');
  };

  // ─── Search results ──────────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!searchQ || searchQ.length < 2) return [];
    const q = searchQ.toLowerCase();
    const instMatches = institutes.filter(i =>
      i.name.toLowerCase().includes(q) || i.group.toLowerCase().includes(q) || i.location.toLowerCase().includes(q)
    ).map(i => ({ type: 'GILE', label: `${i.group} - ${i.name}`, sub: i.location, id: i.id }));
    const txnMatches = transactions.filter(t =>
      t.studentName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
    ).map(t => ({ type: 'Transaction', label: t.studentName, sub: t.id, id: t.instituteId }));
    return [...instMatches, ...txnMatches].slice(0, 6);
  }, [searchQ, institutes, transactions]);

  // ─── AUTH SCREEN ─────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo"><Database size={30} />GrayQuest Partner</div>
            <h2 className="auth-title">Secure Portal Access</h2>
            <p className="auth-subtitle">Two-step authentication required</p>
          </div>

          {!otpSent ? (
            <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Official Email Address</label>
                <input type="email" className="form-input" value={emailInput}
                  onChange={e => setEmailInput(e.target.value)} required placeholder="name@company.com" />
                <p style={{ marginTop: '0.5rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  Use <strong style={{ color: 'var(--accent-indigo)' }}>admin@partner.com</strong> for Admin or <strong style={{ color: 'var(--accent-indigo)' }}>accountant@partner.com</strong> for Accountant role
                </p>
              </div>
              <button type="submit" className="btn-primary">Send OTP →</button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">One-Time Password</label>
                <input type="text" className="form-input" value={otpInput}
                  onChange={e => setOtpInput(e.target.value)} required maxLength={6}
                  placeholder="Enter 6-digit OTP" autoFocus />
                <p style={{ marginTop: '0.5rem', fontSize: '0.775rem', color: 'var(--accent-emerald)' }}>
                  OTP sent to {emailInput} — enter any value to proceed
                </p>
              </div>
              <button type="submit" className="btn-primary">Verify & Login →</button>
              <button type="button" className="btn-secondary" onClick={() => setOtpSent(false)}>← Change Email</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ─── HELPER: Nav item ────────────────────────────────────────────────────────
  const NavItem = ({ icon: Icon, label, pageKey }) => (
    <li className={`sidebar-item ${activePage === pageKey && !drilldownInstId ? 'active' : ''}`}
      onClick={() => navigate(pageKey)}>
      <Icon size={16} className="nav-icon" />
      <span>{label}</span>
    </li>
  );

  // ─── HELPER: Page title block ────────────────────────────────────────────────
  const PageHeader = ({ title, subtitle, action }) => (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );

  // ─── SECTION: OVERVIEW ───────────────────────────────────────────────────────
  const OverviewPage = () => (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <PageHeader
        title="Overview"
        subtitle="Portfolio-level financial health and GMV performance"
        action={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div className="filter-group">
              <label className="filter-label">Date Range</label>
              <div className="filter-date-range">
                <input type="date" className="filter-input" style={{ width: 140 }} value={overviewDateStart} onChange={e => setOverviewDateStart(e.target.value)} />
                <span>to</span>
                <input type="date" className="filter-input" style={{ width: 140 }} value={overviewDateEnd} onChange={e => setOverviewDateEnd(e.target.value)} />
              </div>
            </div>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-row">
            <span className="kpi-label">Total GMV Settled</span>
            <div className="kpi-icon" style={{ background: 'rgba(37,99,235,0.15)' }}>
              <TrendingUp size={18} color="var(--accent-indigo)" />
            </div>
          </div>
          <div className="kpi-value">{fmtINR(overviewKPIs.gmv)}</div>
          <p className="kpi-sub">Tranches + settled institute receipts</p>
          <div className="kpi-divider">
            <span>EMI: {fmtINR(overviewKPIs.emiComm)}</span>
            <span>PG: {fmtINR(overviewKPIs.pgComm)}</span>
            <span>AD: {fmtINR(overviewKPIs.adComm)}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-row">
            <span className="kpi-label">Commissions Earned</span>
            <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <Wallet size={18} color="var(--accent-emerald)" />
            </div>
          </div>
          <div className="kpi-value">{fmtINR(overviewKPIs.comm)}</div>
          <div className="kpi-trend up"><ArrowUpRight size={13} />Revenue share accrued</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-row">
            <span className="kpi-label">Pending Commissions</span>
            <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <Clock size={18} color="var(--accent-amber)" />
            </div>
          </div>
          <div className="kpi-value">{fmtINR(overviewKPIs.pendComm)}</div>
          <p className="kpi-sub">In-flight accruals not yet disbursed</p>
        </div>

        <div className="kpi-card">
          <div className="kpi-row">
            <span className="kpi-label">GILE Network</span>
            <div className="kpi-icon" style={{ background: 'rgba(37,99,235,0.1)' }}>
              <School size={18} color="var(--accent-indigo)" />
            </div>
          </div>
          <div className="kpi-value">{overviewKPIs.total}</div>
          <div className="kpi-divider">
            <span style={{ color: 'var(--accent-emerald)' }}>Active: {overviewKPIs.activeCount}</span>
            <span style={{ color: 'var(--text-muted)' }}>Inactive: {overviewKPIs.inactiveCount}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-row">
            <span className="kpi-label">Avg. Onboarding Time</span>
            <div className="kpi-icon" style={{ background: 'rgba(6,182,212,0.1)' }}>
              <Zap size={18} color="var(--accent-cyan)" />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--accent-cyan)' }}>4.8 Days</div>
          <p className="kpi-sub">Signup to first transaction</p>
        </div>

      </div>

      {/* Charts row */}
      <div className="two-col">
        {/* GMV Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Month-wise GMV Trend</h3>
              <p className="card-subtitle">Academic calendar — all payment modes</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 16, background: 'var(--bg-primary)', borderRadius: 10, padding: '1rem 1.25rem' }}>
            {[
              { m: 'Jul', h: 70 }, { m: 'Aug', h: 55 }, { m: 'Sep', h: 65 },
              { m: 'Nov', h: 80 }, { m: 'Jan', h: 45 }, { m: 'Mar', h: 62 },
              { m: 'May', h: 90 }, { m: 'Jun', h: 160 }
            ].map(({ m, h }) => (
              <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{
                  width: 28, height: h,
                  background: m === 'Jun' ? 'linear-gradient(to top, var(--accent-rose), var(--accent-purple))' : 'linear-gradient(to top, var(--accent-indigo), var(--accent-blue))',
                  borderRadius: '5px 5px 0 0', transition: 'height 0.4s ease'
                }} />
                <span style={{ fontSize: '0.7rem', color: m === 'Jun' ? 'var(--accent-rose)' : 'var(--text-muted)', marginTop: 6, fontWeight: m === 'Jun' ? 700 : 400 }}>{m}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent-indigo)', display: 'inline-block' }} />Normal months</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent-rose)', display: 'inline-block' }} />June (Peak admission cycle)</span>
          </div>
        </div>

        {/* GMV Pie & Geographic */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ flex: 1 }}>
            <h3 className="card-title">GMV by Payment Mode</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <svg viewBox="0 0 100 100" width={90} height={90} style={{ flexShrink: 0 }}>
                <circle cx="50" cy="50" r="36" fill="none" stroke="var(--accent-rose)" strokeWidth="18" strokeDasharray="160 226" />
                <circle cx="50" cy="50" r="36" fill="none" stroke="var(--accent-indigo)" strokeWidth="18" strokeDasharray="64 226" strokeDashoffset="-160" />
                <circle cx="50" cy="50" r="36" fill="none" stroke="var(--accent-purple)" strokeWidth="18" strokeDasharray="28 226" strokeDashoffset="-224" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-rose)', display: 'inline-block' }} /><span>EMI (70%)</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-indigo)', display: 'inline-block' }} /><span>PG (20%)</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-purple)', display: 'inline-block' }} /><span>Auto-Debit (10%)</span></div>
              </div>
            </div>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <h3 className="card-title" style={{ fontSize: '0.9rem' }}>Geographic Spread</h3>
            {geographicDistribution.map(g => (
              <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', padding: '0.375rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} color="var(--accent-rose)" /><span>{g.region}</span></div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{g.activeInstitutes} GILE</span>
                  <span style={{ fontWeight: 600 }}>{fmtINR(g.gmv)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top GILE leaderboard */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Top Performing GILE — by GMV</h3>
          <span className="kpi-sub">Click a row to view institute profile</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>GILE Identifier</th>
                <th>Location</th>
                <th>Students</th>
                <th>Total GMV</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...institutes].sort((a, b) => b.totalGmv - a.totalGmv).map((inst, idx) => (
                <tr key={inst.id} className="clickable" onClick={() => openDrilldown(inst.id)}>
                  <td><strong style={{ color: 'var(--accent-indigo)' }}>#{idx + 1}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{inst.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inst.group}</div>
                  </td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{inst.location}</td>
                  <td>{inst.totalStudents.toLocaleString()}</td>
                  <td><strong>{fmtINR(inst.totalGmv)}</strong></td>
                  <td>{statusBadge(inst.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── SECTION: TRANSACTIONS (Top-level page) ──────────────────────────────────
  const TransactionsPage = () => (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <PageHeader
        title="Transactions"
        subtitle="All payment attempts across your GILE network"
        action={
          <button className="btn-sm" onClick={() => exportCSV(filteredTxns.map(t => ({
            'Txn ID': t.id, 'Student Name': t.studentName, 'Student ID': t.studentId,
            'Institute': t.instituteName, 'Fee Header': t.feeHeader, 'Amount (₹)': t.amount,
            'Mode': t.paymentMode, 'Created On': fmtDate(t.createdAt),
            'Disbursement Date': t.paymentMode === 'EMI' ? (t.disbursementDate || '—') : 'N/A',
            'Status': t.status
          })), 'Transactions.csv')}>
            <Download size={14} /> Export CSV
          </button>
        }
      />

      {/* Page-specific filter bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label className="filter-label">Student / TXN ID Search</label>
          <input className="filter-input" placeholder="Search name, ID…" value={txnSearch}
            onChange={e => setTxnSearch(e.target.value)} style={{ width: 200 }} />
        </div>
        <div className="filter-group">
          <label className="filter-label">Payment Mode</label>
          <select className="filter-select" value={txnModeFilter} onChange={e => setTxnModeFilter(e.target.value)}>
            <option>All</option><option>EMI</option><option>PG</option><option>Auto-Debit</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select className="filter-select" value={txnStatusFilter} onChange={e => setTxnStatusFilter(e.target.value)}>
            <option>All</option><option>Success</option><option>Pending</option><option>Failed</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Institute</label>
          <select className="filter-select" value={txnInstFilter} onChange={e => setTxnInstFilter(e.target.value)}>
            <option value="All">All Institutes</option>
            {institutes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Transaction Date</label>
          <div className="filter-date-range">
            <input type="date" className="filter-input" style={{ width: 135 }} value={txnDateStart} onChange={e => setTxnDateStart(e.target.value)} />
            <span>to</span>
            <input type="date" className="filter-input" style={{ width: 135 }} value={txnDateEnd} onChange={e => setTxnDateEnd(e.target.value)} />
          </div>
        </div>
        {/* Disbursement filter — EMI Only */}
        <div className="filter-group">
          <label className="filter-label" style={{ color: 'var(--accent-indigo)' }}>EMI Disbursement Date</label>
          <div className="filter-date-range">
            <input type="date" className="filter-input" style={{ width: 135 }} value={txnDisbStart} onChange={e => setTxnDisbStart(e.target.value)} />
            <span>to</span>
            <input type="date" className="filter-input" style={{ width: 135 }} value={txnDisbEnd} onChange={e => setTxnDisbEnd(e.target.value)} />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Successful Transactions</span>
          <div className="kpi-value">{txnKPIs.successCount}</div>
          <p className="kpi-sub">Total: {txnKPIs.total} attempts</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Successful GMV</span>
          <div className="kpi-value">{fmtINR(txnKPIs.successVal)}</div>
          <div className="kpi-trend up"><ArrowUpRight size={13} />Settled to institute</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Pending Value</span>
          <div className="kpi-value" style={{ color: 'var(--accent-amber)' }}>{fmtINR(txnKPIs.pendingVal)}</div>
          <p className="kpi-sub">In processing</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Success Rate</span>
          <div className="kpi-value" style={{ color: 'var(--accent-emerald)' }}>{txnKPIs.rate}%</div>
          <div className="kpi-trend down"><AlertTriangle size={13} />Failed: {txnKPIs.failedCount}</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Peak Hour</span>
          <div className="kpi-value" style={{ fontSize: '1.1rem' }}>11 AM – 1 PM</div>
          <p className="kpi-sub">Highest velocity window</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Peak Month</span>
          <div className="kpi-value" style={{ fontSize: '1.1rem' }}>June</div>
          <p className="kpi-sub">Admission cycle peak · Mon/Fri highest days</p>
        </div>
      </div>

      {/* Academic volume curve */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Academic Calendar Monthly Volume</h3>
          <span className="kpi-sub" style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>Bell curve — peaks at June admissions</span>
        </div>
        <svg viewBox="0 0 800 120" width="100%" height="120" style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '8px 0' }}>
          <defs>
            <linearGradient id="bell-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="55%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          <path d="M 40 105 C 100 100 160 90 220 82 T 360 50 T 430 20 T 500 50 T 620 88 T 760 105" fill="none" stroke="url(#bell-grad)" strokeWidth="3" />
          <path d="M 40 105 C 100 100 160 90 220 82 T 360 50 T 430 20 T 500 50 T 620 88 T 760 105 L 760 115 L 40 115 Z" fill="rgba(37,99,235,0.05)" />
          {['Jul','Sep','Nov','Jan','Mar','May','Jun (Peak)','Aug'].map((m, i) => (
            <text key={m} x={40 + i * 102} y={118} fill={m.includes('Peak') ? 'var(--accent-rose)' : 'var(--text-muted)'} fontSize="9" fontWeight={m.includes('Peak') ? '700' : '400'}>{m}</text>
          ))}
        </svg>
      </div>

      {/* Transaction Listing */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Transaction Ledger</h3>
          <div className="switcher">
            {['All','EMI','PG','Auto-Debit'].map(m => (
              <button key={m} className={`switch-btn ${txnModeFilter === m ? 'active' : ''}`} onClick={() => setTxnModeFilter(m)}>{m}</button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Student</th>
                <th>Institute</th>
                <th>Fee Header</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Created On</th>
                <th>Disbursement (EMI)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxns.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-indigo)' }}>{t.id}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.studentName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {t.studentId} · {unmaskPII ? t.studentPhone : maskPhone(t.studentPhone)}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.825rem' }}>{t.instituteName}</td>
                  <td style={{ fontSize: '0.825rem' }}>{t.feeHeader}</td>
                  <td><strong>{fmtINR(t.amount)}</strong></td>
                  <td>{modeBadge(t.paymentMode)}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{fmtDate(t.createdAt)}</td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {t.paymentMode === 'EMI'
                      ? (t.disbursementDate ? <span style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>{t.disbursementDate}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>)
                      : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.72rem' }}>N/A</span>
                    }
                  </td>
                  <td>{statusBadge(t.status)}</td>
                  <td>
                    {t.status === 'Success' && (
                      <button className="btn-sm" style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }} onClick={() => setReceiptTxn(t)}>
                        <FileText size={12} />Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!filteredTxns.length && (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No transactions match current filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── SECTION: SETTLEMENTS (Top-level page) ───────────────────────────────────
  const SettlementsPage = () => (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <PageHeader
        title="Settlements"
        subtitle="Settled funds transferred to institute bank accounts"
        action={
          <button className="btn-sm" onClick={() => exportCSV(filteredSettlements.map(s => ({
            'Settlement ID': s.id, 'Txn Ref': s.txnId, 'Student Name': s.studentName, 'Student ID': s.studentId,
            'Institute': s.instituteName, 'Fee Header': s.feeHeader, 'Amount (₹)': s.amount,
            'Mode': s.paymentMode, 'Settlement Date': s.settlementDate,
            'Disbursement Date': s.paymentMode === 'EMI' ? s.disbursementDate : 'N/A',
            'UTR': s.utr, 'Bank Name': s.bankName, 'Account No': s.accountNo, 'IFSC': s.ifsc, 'Status': 'Settled'
          })), 'Settlements.csv')}>
            <Download size={14} /> Export CSV
          </button>
        }
      />

      {/* Page-specific filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label className="filter-label">Student / UTR Search</label>
          <input className="filter-input" placeholder="Name, student ID, UTR…" value={settlSearch}
            onChange={e => setSettlSearch(e.target.value)} style={{ width: 200 }} />
        </div>
        <div className="filter-group">
          <label className="filter-label">Payment Mode</label>
          <select className="filter-select" value={settlModeFilter} onChange={e => setSettlModeFilter(e.target.value)}>
            <option>All</option><option>EMI</option><option>PG</option><option>Auto-Debit</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Institute</label>
          <select className="filter-select" value={settlInstFilter} onChange={e => setSettlInstFilter(e.target.value)}>
            <option value="All">All Institutes</option>
            {institutes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Settlement Date</label>
          <div className="filter-date-range">
            <input type="date" className="filter-input" style={{ width: 135 }} value={settlDateStart} onChange={e => setSettlDateStart(e.target.value)} />
            <span>to</span>
            <input type="date" className="filter-input" style={{ width: 135 }} value={settlDateEnd} onChange={e => setSettlDateEnd(e.target.value)} />
          </div>
        </div>
        {/* EMI-only disbursement filter */}
        <div className="filter-group">
          <label className="filter-label" style={{ color: 'var(--accent-indigo)' }}>EMI Disbursement Date</label>
          <div className="filter-date-range">
            <input type="date" className="filter-input" style={{ width: 135 }} value={settlDisbStart} onChange={e => setSettlDisbStart(e.target.value)} />
            <span>to</span>
            <input type="date" className="filter-input" style={{ width: 135 }} value={settlDisbEnd} onChange={e => setSettlDisbEnd(e.target.value)} />
          </div>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 600, alignSelf: 'flex-end', paddingBottom: 4 }}>
          ⚠ Disbursement filter applies to EMI only
        </p>
      </div>

      {/* Settlement KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))' }}>
        <div className="kpi-card">
          <span className="kpi-label">Total Settled Value</span>
          <div className="kpi-value">{fmtINR(settlKPIs.total)}</div>
          <p className="kpi-sub">Transferred to institutes</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Settlement Count</span>
          <div className="kpi-value">{settlKPIs.count}</div>
          <p className="kpi-sub">Individual settled records</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Unsettled Value</span>
          <div className="kpi-value" style={{ color: 'var(--accent-amber)' }}>{fmtINR(settlKPIs.unsettled)}</div>
          <p className="kpi-sub">Success txns pending settlement</p>
        </div>
        <div className="kpi-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="kpi-label">Settlement Cycles</span>
            <div style={{ fontSize: '0.775rem', color: 'var(--accent-cyan)' }}>PG: T+1</div>
            <div style={{ fontSize: '0.775rem', color: 'var(--accent-purple)' }}>Auto-Debit: T+2</div>
            <div style={{ fontSize: '0.775rem', color: 'var(--accent-indigo)' }}>EMI disbursement: T+3</div>
          </div>
        </div>
      </div>

      {/* Settlement Listing — transaction style with mode label & UTR */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Settlement Records</h3>
          <div className="switcher">
            {['All','EMI','PG','Auto-Debit'].map(m => (
              <button key={m} className={`switch-btn ${settlModeFilter === m ? 'active' : ''}`} onClick={() => setSettlModeFilter(m)}>{m}</button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Settlement ID</th>
                <th>Settled Against (TXN)</th>
                <th>Student</th>
                <th>Institute</th>
                <th>Fee Header</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Settlement Date</th>
                <th>Disbursement Date (EMI)</th>
                <th>UTR Reference</th>
                <th>Bank / IFSC</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSettlements.map(s => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--accent-emerald)' }}>{s.id}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--accent-indigo)' }}>{s.txnId}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.studentName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {s.studentId} · {unmaskPII ? s.studentPhone : maskPhone(s.studentPhone)}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.825rem' }}>{s.instituteName}</td>
                  <td style={{ fontSize: '0.825rem' }}>{s.feeHeader}</td>
                  <td><strong>{fmtINR(s.amount)}</strong></td>
                  <td>{modeBadge(s.paymentMode)}</td>
                  <td style={{ fontSize: '0.8rem' }}>{s.settlementDate}</td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {s.paymentMode === 'EMI'
                      ? <span style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>{s.disbursementDate}</span>
                      : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.72rem' }}>N/A</span>
                    }
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.utr}</td>
                  <td style={{ fontSize: '0.75rem' }}>
                    <div>{s.bankName}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{s.accountNo} · {s.ifsc}</div>
                  </td>
                  <td><span className="badge badge-success">Settled</span></td>
                </tr>
              ))}
              {!filteredSettlements.length && (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No settlements match current filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── SECTION: COMMISSIONS (Top-level page) ───────────────────────────────────
  const CommissionsPage = () => (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <PageHeader
        title="Commissions"
        subtitle="Revenue share earned from your GILE network transactions"
        action={
          <button className="btn-sm" onClick={() => exportCSV(filteredCommissions.map(t => ({
            'Txn ID': t.id, 'Student Name': t.studentName, 'Student ID': t.studentId,
            'Institute': t.instituteName, 'Processed Volume (₹)': t.amount,
            'Mode': t.paymentMode, 'Commission Rate %': t.commissionRate,
            'Commission Earned (₹)': t.commissionEarned, 'Transaction Date': fmtDate(t.createdAt),
            'Payout Status': t.commissionPaid ? 'Disbursed' : 'Pending'
          })), 'Commissions.csv')}>
            <Download size={14} /> Export CSV
          </button>
        }
      />

      {/* Commission filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label className="filter-label">Payment Mode</label>
          <select className="filter-select" value={commModeFilter} onChange={e => setCommModeFilter(e.target.value)}>
            <option>All</option><option>EMI</option><option>PG</option><option>Auto-Debit</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Institute</label>
          <select className="filter-select" value={commInstFilter} onChange={e => setCommInstFilter(e.target.value)}>
            <option value="All">All Institutes</option>
            {institutes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Payout Status</label>
          <select className="filter-select" value={commStatusFilter} onChange={e => setCommStatusFilter(e.target.value)}>
            <option>All</option><option>Paid</option><option>Pending</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Date Range</label>
          <div className="filter-date-range">
            <input type="date" className="filter-input" style={{ width: 135 }} value={commDateStart} onChange={e => setCommDateStart(e.target.value)} />
            <span>to</span>
            <input type="date" className="filter-input" style={{ width: 135 }} value={commDateEnd} onChange={e => setCommDateEnd(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Commission KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Commissions Received</span>
          <div className="kpi-value">{fmtINR(commKPIs.received)}</div>
          <p className="kpi-sub">Disbursed to partner account</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Expected Commissions</span>
          <div className="kpi-value" style={{ color: 'var(--accent-amber)' }}>{fmtINR(commKPIs.expected)}</div>
          <p className="kpi-sub">Accrued, not yet disbursed</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Avg. Commission Rate</span>
          <div className="kpi-value" style={{ color: 'var(--accent-cyan)' }}>{commKPIs.avgRate}%</div>
          <p className="kpi-sub">Weighted avg. across all modes</p>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Transactions Counted</span>
          <div className="kpi-value">{commKPIs.total}</div>
          <p className="kpi-sub">Successful, commission-eligible</p>
        </div>
      </div>

      <div className="two-col">
        {/* Settlement cycle notepad */}
        <div className="card">
          <h3 className="card-title">Settlement Cycle Rules</h3>
          <p className="card-subtitle">Active clearing agreements for each product type</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div className="notepad-item">
              <Clock size={16} className="n-icon" style={{ color: 'var(--accent-cyan)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--accent-cyan)' }}>PG Commission · T+1</div>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Credit card, UPI, NetBanking rails</p>
              </div>
            </div>
            <div className="notepad-item">
              <Clock size={16} className="n-icon" style={{ color: 'var(--accent-purple)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--accent-purple)' }}>Auto-Debit Commission · T+2</div>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>NACH mandate clearing cycles</p>
              </div>
            </div>
            <div className="notepad-item">
              <Clock size={16} className="n-icon" style={{ color: 'var(--accent-indigo)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--accent-indigo)' }}>EMI Commission · T+3 from tranche approval</div>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Disbursement tied to lender tranche release</p>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            Cycle variations locked by financial agreements, verified during reconciliation.
          </p>
        </div>

        {/* Commission by mode breakdown */}
        <div className="card">
          <h3 className="card-title">Commission by Mode</h3>
          {['EMI','PG','Auto-Debit'].map(mode => {
            const modeComm = filteredCommissions.filter(t => t.paymentMode === mode).reduce((a, t) => a + t.commissionEarned, 0);
            const total = filteredCommissions.reduce((a, t) => a + t.commissionEarned, 0) || 1;
            const pct = ((modeComm / total) * 100).toFixed(1);
            return (
              <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 500 }}>{mode}</span>
                  <span style={{ fontWeight: 700 }}>{fmtINR(modeComm)}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 3 }}>
                  <div style={{
                    height: 6, borderRadius: 3, width: `${pct}%`,
                    background: mode === 'EMI' ? 'var(--accent-indigo)' : mode === 'PG' ? 'var(--accent-cyan)' : 'var(--accent-purple)'
                  }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{pct}% of total</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Commission Ledger */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Commission Ledger</h3>
          <div className="switcher">
            {['All','EMI','PG','Auto-Debit'].map(m => (
              <button key={m} className={`switch-btn ${commModeFilter === m ? 'active' : ''}`} onClick={() => setCommModeFilter(m)}>{m}</button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Student</th>
                <th>Institute</th>
                <th>Processed Volume</th>
                <th>Mode</th>
                <th>Rate %</th>
                <th>Commission Earned</th>
                <th>Transaction Date</th>
                <th>Payout Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommissions.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--accent-indigo)' }}>{t.id}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.studentName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.studentId}</div>
                  </td>
                  <td style={{ fontSize: '0.825rem' }}>{t.instituteName}</td>
                  <td><strong>{fmtINR(t.amount)}</strong></td>
                  <td>{modeBadge(t.paymentMode)}</td>
                  <td style={{ fontWeight: 600 }}>{t.commissionRate}%</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{fmtINR(t.commissionEarned)}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{fmtDate(t.createdAt)}</td>
                  <td>
                    <span className={`badge ${t.commissionPaid ? 'badge-success' : 'badge-pending'}`}>
                      {t.commissionPaid ? 'Disbursed' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
              {!filteredCommissions.length && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No commission records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── SECTION: INSTITUTES APP ─────────────────────────────────────────────────
  const InstitutesPage = () => (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <PageHeader title="Institutes App" subtitle="Manage GILE technical configurations and operational directory" />

      {/* Institutes-specific filter (Group + Multi-select) */}
      <div className="filter-bar">
        <div className="filter-group">
          <label className="filter-label">Group Filter</label>
          <select className="filter-select" value={instGroupFilter} onChange={e => { setInstGroupFilter(e.target.value); setSelectedInstIds([]); }}>
            {groupsList.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Institute (Multi-Select)</label>
          <select className="filter-select" onChange={e => {
            const id = e.target.value;
            if (id && !selectedInstIds.includes(id)) setSelectedInstIds(p => [...p, id]);
          }} defaultValue="">
            <option value="" disabled>Add institute…</option>
            {filteredInstitutes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        {selectedInstIds.length > 0 && (
          <div className="chips-row">
            {selectedInstIds.map(id => {
              const inst = institutes.find(i => i.id === id);
              return (
                <span key={id} className="chip">
                  {inst?.name}
                  <button className="chip-x" onClick={() => setSelectedInstIds(p => p.filter(i => i !== id))}><X size={10} /></button>
                </span>
              );
            })}
            <button className="clear-chips" onClick={() => setSelectedInstIds([])}>Clear all</button>
          </div>
        )}
      </div>

      {/* Sub-tab switcher */}
      <div className="section-tabs" style={{ background: 'var(--bg-secondary)', borderRadius: '14px 14px 0 0', padding: '0 1rem', border: '1px solid var(--border-color)', borderBottom: 'none' }}>
        <button className={`section-tab ${instituteSubTab === 'oper' ? 'active' : ''}`} onClick={() => setInstituteSubTab('oper')}>
          Sub-Tab B: Operational Directory
        </button>
        <button className={`section-tab ${instituteSubTab === 'tech' ? 'active' : ''}`} onClick={() => setInstituteSubTab('tech')}>
          Sub-Tab A: API & Webhooks Config
        </button>
      </div>

      {instituteSubTab === 'oper' ? (
        <>
          {/* Cohort velocity KPIs */}
          <div className="kpi-grid">
            {[
              { label: 'Weekly Onboarded', value: '124', sub: 'Last 7 days cohort' },
              { label: 'Monthly Onboarded', value: '482', sub: 'Last 30 days cohort' },
              { label: 'Yearly Onboarded', value: '5,200', sub: 'Academic calendar' },
              { label: 'Avg. Onboarding Velocity', value: '3.5 Hrs', sub: 'Signup to approval', accent: true }
            ].map(k => (
              <div key={k.label} className={`kpi-card ${k.accent ? 'accent' : ''}`}>
                <span className="kpi-label">{k.label}</span>
                <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{k.value}</div>
                <p className="kpi-sub">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Institute directory — clicking row opens drilldown */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Campus Ledger Index Directory</h3>
              <span className="kpi-sub">Click a row to view the 360° institute profile</span>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>GILE Identifier</th>
                    <th>Group</th>
                    <th>Location</th>
                    <th>Total Students</th>
                    <th>Onboarding Date</th>
                    <th>Total GMV</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstitutes.map(inst => (
                    <tr key={inst.id} className="clickable" onClick={() => openDrilldown(inst.id)}>
                      <td><strong>{inst.name}</strong></td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{inst.group}</td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{inst.location}</td>
                      <td>{inst.totalStudents.toLocaleString()}</td>
                      <td style={{ fontSize: '0.825rem' }}>{inst.onboardingDate}</td>
                      <td><strong>{fmtINR(inst.totalGmv)}</strong></td>
                      <td>{statusBadge(inst.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* API & Webhooks Config */
        <div className="card">
          <h3 className="card-title">API Keys & Webhook Listener Config</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>GROUP NAME</th>
                  <th>INSTITUTE NAME</th>
                  <th>LOCATION</th>
                  <th>BOARD</th>
                  <th>CLIENT ID</th>
                  <th>SECRET KEY</th>
                  <th>API KEY</th>
                  <th>SLUG</th>
                  <th>WEBHOOK URL</th>
                  <th>EVENTS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstitutes.map(inst => (
                  <tr key={inst.id}>
                    <td>{inst.group}</td>
                    <td style={{ fontWeight: 600 }}>{inst.name}</td>
                    <td>{inst.location}</td>
                    <td>{inst.board || 'CBSE'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {inst.clientId}
                        <button className="icon-btn" style={{ padding: 2 }} onClick={() => navigator.clipboard.writeText(inst.clientId)}>
                          <FileText size={12} color="var(--text-muted)" />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {showSecrets[inst.id] ? inst.secretKey : '•'.repeat(16)}
                        </span>
                        <button className="icon-btn" onClick={() => setShowSecrets(p => ({ ...p, [inst.id]: !p[inst.id] }))}>
                          {showSecrets[inst.id] ? <EyeOff size={13} color="var(--text-muted)" /> : <Eye size={13} color="var(--text-muted)" />}
                        </button>
                        <button className="icon-btn" style={{ padding: 2 }} onClick={() => navigator.clipboard.writeText(inst.secretKey)}>
                          <FileText size={12} color="var(--text-muted)" />
                        </button>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {inst.apiKey}
                        <button className="icon-btn" style={{ padding: 2 }} onClick={() => navigator.clipboard.writeText(inst.apiKey)}>
                          <FileText size={12} color="var(--text-muted)" />
                        </button>
                      </div>
                    </td>
                    <td>
                      <span style={{ background: '#f0f5ff', color: '#4f46e5', padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>
                        {inst.slug}
                      </span>
                    </td>
                    <td>
                      {inst.webhookUrl ? (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{inst.webhookUrl}</div>
                      ) : (
                        <button className="btn-sm" style={{ color: 'var(--accent-indigo)', background: 'transparent', border: 'none', fontStyle: 'italic', padding: 0 }} onClick={() => {
                          const url = prompt("Enter Webhook URL:", "");
                          if (url !== null) updateWebhookUrl(inst.id, url);
                        }}>
                          + Set URL
                        </button>
                      )}
                    </td>
                    <td>
                      <button className="btn-sm" style={{ background: '#fff', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} onClick={() => {
                        setWebhookModalInst(inst);
                        setTempEvents([...(inst.events || [])]);
                      }}>
                        Events
                      </button>
                    </td>
                    <td>
                      {/* Actions intentionally left blank per design requirements */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // ─── SECTION: INSTITUTE DRILLDOWN 360° ──────────────────────────────────────
  const DrilldownPage = () => {
    const gmvShare = totalNetworkGMV ? ((drillGMV / totalNetworkGMV) * 100).toFixed(1) : 0;
    const successTxns = drillTxns.filter(t => t.status === 'Success');
    const successRate = drillTxns.length ? ((successTxns.length / drillTxns.length) * 100).toFixed(1) : 0;
    const pendingVal = drillTxns.filter(t => t.status === 'Pending').reduce((a, t) => a + t.amount, 0);

    return (
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Back + Header */}
        <div>
          <button className="btn-sm" onClick={() => setDrilldownInstId(null)} style={{ marginBottom: '0.75rem' }}>
            ← Back to Directory
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="page-title">{drillInst?.name}</h1>
              <p className="page-subtitle">{drillInst?.group} · {drillInst?.location} · Since {drillInst?.onboardingDate}</p>
            </div>
            <button
              onClick={() => toggleInstStatus(drillInst?.id)}
              className={`badge ${drillInst?.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}
              style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.825rem' }}>
              {drillInst?.status} · Toggle
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">GMV Wallet Share</span>
            <div className="kpi-value">{gmvShare}%</div>
            <p className="kpi-sub">Of total network GMV</p>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Success Rate</span>
            <div className="kpi-value" style={{ color: 'var(--accent-emerald)' }}>{successRate}%</div>
            <p className="kpi-sub">{successTxns.length} of {drillTxns.length} attempts</p>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Total Settled GMV</span>
            <div className="kpi-value">{fmtINR(drillGMV)}</div>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Pending Value</span>
            <div className="kpi-value" style={{ color: 'var(--accent-amber)' }}>{fmtINR(pendingVal)}</div>
          </div>
        </div>

        {/* Contact + Fee Headers */}
        <div className="two-col-equal">
          <div className="card">
            <h3 className="card-title">Primary Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{drillInst?.primaryContact?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>{drillInst?.primaryContact?.role}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem' }}>
                <Mail size={14} color="var(--accent-indigo)" />
                {unmaskPII ? drillInst?.primaryContact?.email : maskEmail(drillInst?.primaryContact?.email)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem' }}>
                <Phone size={14} color="var(--accent-indigo)" />
                {unmaskPII ? drillInst?.primaryContact?.phone : maskPhone(drillInst?.primaryContact?.phone)}
              </div>
              <button className="btn-sm" style={{ marginTop: 4, width: 'fit-content' }} onClick={() => setUnmaskPII(p => !p)}>
                {unmaskPII ? <EyeOff size={13} /> : <Eye size={13} />} {unmaskPII ? 'Mask' : 'Reveal'} PII
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Fee Headers Configuration</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Fee Header</th><th>Financing Mode</th><th>Status</th></tr></thead>
                <tbody>
                  {drillInst?.feeHeaders?.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 500, fontSize: '0.825rem' }}>{f.name}</td>
                      <td><span className="badge badge-inactive" style={{ fontSize: '0.7rem' }}>{f.mode}</span></td>
                      <td>
                        <button onClick={() => toggleFeeStatus(drillInst.id, f.id)}
                          className={`badge ${f.status === 'Active' ? 'badge-success' : 'badge-inactive'}`}
                          style={{ cursor: 'pointer' }}>{f.status}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Enabled Products */}
        <div className="card">
          <h3 className="card-title">Enabled Products & Variants</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {drillInst?.enabledProducts?.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.875rem', padding: '0.75rem 1rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 10, minWidth: 240, flex: 1 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.variant}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.category}</div>
                </div>
                <button onClick={() => toggleProductStatus(drillInst.id, p.id)}
                  className={`badge ${p.status === 'Active' ? 'badge-success' : 'badge-inactive'}`}
                  style={{ cursor: 'pointer' }}>{p.status}</button>
              </div>
            ))}
          </div>
        </div>

        {/* Section tabs: Transactions | Settlements | Commissions */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="section-tabs" style={{ padding: '0 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <button className={`section-tab ${drilldownSection === 'txn' ? 'active' : ''}`} onClick={() => setDrilldownSection('txn')}>Transactions</button>
            <button className={`section-tab ${drilldownSection === 'settlement' ? 'active' : ''}`} onClick={() => setDrilldownSection('settlement')}>Settlements</button>
            <button className={`section-tab ${drilldownSection === 'commission' ? 'active' : ''}`} onClick={() => setDrilldownSection('commission')}>Commissions</button>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {drilldownSection === 'txn' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 className="card-title">Transaction Ledger</h3>
                    <p className="card-subtitle">All payment attempts for this institute</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Peak hour:</span>
                        <span className="badge badge-inactive">11 AM – 1 PM</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Peak day:</span>
                        <span className="badge badge-inactive">Mon / Fri</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Peak month:</span>
                        <span className="badge badge-inactive">June</span>
                      </div>
                    </div>
                    <button className="btn-sm" onClick={() => exportCSV(drillTxns.map(t => ({
                      'Txn ID': t.id, 'Student Name': t.studentName, 'Student ID': t.studentId,
                      'Institute': t.instituteName, 'Fee Header': t.feeHeader, 'Amount (₹)': t.amount,
                      'Mode': t.paymentMode, 'Created On': fmtDate(t.createdAt),
                      'Disbursement Date': t.paymentMode === 'EMI' ? (t.disbursementDate || '—') : 'N/A',
                      'Status': t.status
                    })), `Txns_${drillInst?.slug}.csv`)}>
                      <Download size={13} />Export
                    </button>
                  </div>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Txn ID</th><th>Student</th><th>Fee Header</th><th>Amount</th>
                        <th>Mode</th><th>Created On</th><th>Disbursement (EMI)</th><th>Status</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {drillTxns.map(t => (
                        <tr key={t.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--accent-indigo)' }}>{t.id}</td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.studentName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {t.studentId} · {unmaskPII ? t.studentPhone : maskPhone(t.studentPhone)}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.825rem' }}>{t.feeHeader}</td>
                          <td><strong>{fmtINR(t.amount)}</strong></td>
                          <td>{modeBadge(t.paymentMode)}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{fmtDate(t.createdAt)}</td>
                          <td style={{ fontSize: '0.8rem' }}>
                            {t.paymentMode === 'EMI'
                              ? (t.disbursementDate
                                ? <span style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>{t.disbursementDate}</span>
                                : <span style={{ color: 'var(--text-muted)' }}>—</span>)
                              : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.72rem' }}>N/A</span>}
                          </td>
                          <td>{statusBadge(t.status)}</td>
                          <td>
                            {t.status === 'Success' && (
                              <button className="btn-sm" style={{ fontSize: '0.72rem', padding: '0.2rem 0.4rem' }} onClick={() => setReceiptTxn(t)}>
                                <FileText size={11} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {drilldownSection === 'settlement' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 className="card-title">Settlement Records</h3>
                    <p className="card-subtitle">Funds credited to institute accounts · Disbursement applicable for EMI only</p>
                  </div>
                  <button className="btn-sm" onClick={() => exportCSV(drillSettlements.map(s => ({
                    'Settlement ID': s.id, 'Txn Ref': s.txnId, 'Student Name': s.studentName, 'Student ID': s.studentId,
                    'Institute': s.instituteName, 'Fee Header': s.feeHeader, 'Amount (₹)': s.amount,
                    'Mode': s.paymentMode, 'Settlement Date': s.settlementDate,
                    'Disbursement Date': s.paymentMode === 'EMI' ? s.disbursementDate : 'N/A',
                    'UTR': s.utr, 'Bank Name': s.bankName, 'Account No': s.accountNo, 'IFSC': s.ifsc, 'Status': 'Settled'
                  })), `Settlements_${drillInst?.slug}.csv`)}>
                    <Download size={13} />Export
                  </button>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Settlement ID</th><th>Settled Against (TXN)</th><th>Student</th>
                        <th>Fee Header</th><th>Amount</th><th>Mode</th>
                        <th>Settlement Date</th><th>Disbursement Date (EMI)</th>
                        <th>UTR</th><th>Bank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drillSettlements.map(s => (
                        <tr key={s.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>{s.id}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-indigo)' }}>{s.txnId}</td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.studentName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {s.studentId} · {unmaskPII ? s.studentPhone : maskPhone(s.studentPhone)}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.825rem' }}>{s.feeHeader}</td>
                          <td><strong>{fmtINR(s.amount)}</strong></td>
                          <td>{modeBadge(s.paymentMode)}</td>
                          <td style={{ fontSize: '0.8rem' }}>{s.settlementDate}</td>
                          <td style={{ fontSize: '0.8rem' }}>
                            {s.paymentMode === 'EMI'
                              ? <span style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>{s.disbursementDate}</span>
                              : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.72rem' }}>N/A</span>}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.utr}</td>
                          <td style={{ fontSize: '0.75rem' }}>
                            <div>{s.bankName}</div>
                            <div style={{ color: 'var(--text-muted)' }}>{s.accountNo}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {drilldownSection === 'commission' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="card-title">Commission Ledger</h3>
                  <button className="btn-sm" onClick={() => exportCSV(drillComms.map(t => ({
                    'Txn ID': t.id, 'Student Name': t.studentName, 'Student ID': t.studentId,
                    'Institute': t.instituteName, 'Processed Volume (₹)': t.amount,
                    'Mode': t.paymentMode, 'Commission Rate %': t.commissionRate,
                    'Commission Earned (₹)': t.commissionEarned, 'Transaction Date': fmtDate(t.createdAt),
                    'Payout Status': t.commissionPaid ? 'Disbursed' : 'Pending'
                  })), `Commissions_${drillInst?.slug}.csv`)}>
                    <Download size={13} />Export
                  </button>
                </div>
                <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))' }}>
                  <div className="kpi-card">
                    <span className="kpi-label">Total Earned</span>
                    <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{fmtINR(drillComms.reduce((a, t) => a + t.commissionEarned, 0))}</div>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-label">Disbursed</span>
                    <div className="kpi-value" style={{ fontSize: '1.4rem', color: 'var(--accent-emerald)' }}>{fmtINR(drillComms.filter(t => t.commissionPaid).reduce((a, t) => a + t.commissionEarned, 0))}</div>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-label">Pending</span>
                    <div className="kpi-value" style={{ fontSize: '1.4rem', color: 'var(--accent-amber)' }}>{fmtINR(drillComms.filter(t => !t.commissionPaid).reduce((a, t) => a + t.commissionEarned, 0))}</div>
                  </div>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr><th>Txn ID</th><th>Student</th><th>Volume</th><th>Mode</th><th>Rate</th><th>Commission</th><th>Date</th><th>Payout</th></tr>
                    </thead>
                    <tbody>
                      {drillComms.map(t => (
                        <tr key={t.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--accent-indigo)' }}>{t.id}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{t.studentName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.studentId}</div>
                          </td>
                          <td>{fmtINR(t.amount)}</td>
                          <td>{modeBadge(t.paymentMode)}</td>
                          <td style={{ fontWeight: 600 }}>{t.commissionRate}%</td>
                          <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{fmtINR(t.commissionEarned)}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{fmtDate(t.createdAt)}</td>
                          <td>
                            <span className={`badge ${t.commissionPaid ? 'badge-success' : 'badge-pending'}`}>
                              {t.commissionPaid ? 'Disbursed' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student onboarding funnel */}
        <div className="card">
          <h3 className="card-title">Student Onboarding Lifecycle Funnel</h3>
          <p className="card-subtitle">Track drop-offs across each onboarding step</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { step: 'Step 1 · Lead Applied', count: drillInst?.funnel?.applied },
              { step: 'Step 2 · KYC Verified', count: drillInst?.funnel?.kyc },
              { step: 'Step 3 · Mandate / Auto-Debit Setup', count: drillInst?.funnel?.mandate },
              { step: 'Step 4 · Loan / Tranche Approved', count: drillInst?.funnel?.approval },
              { step: 'Step 5 · Fully Disbursed & Settled', count: drillInst?.funnel?.disbursed }
            ].map(({ step, count }) => (
              <div key={step} className="funnel-step">
                <span className="funnel-label">{step}</span>
                <span className="funnel-count">{count} students</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ─── SECTION: PRODUCT CATALOG ─────────────────────────────────────────────────
  const ProductsPage = () => (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <PageHeader title="Product Catalog" subtitle="Financial products and tenure variants configured across your GILE network" />
      <div className="kpi-grid">
        {[
          { name: 'Payment Gateway (PG)', desc: 'Credit Cards, Debit Cards, UPI, NetBanking rails — T+1 settlement.', color: 'var(--accent-cyan)', count: 3 },
          { name: 'EMI Financing', desc: 'GrayQuest-backed low-cost educational lending — disbursement T+3 from tranche.', color: 'var(--accent-indigo)', count: 3 },
          { name: 'Auto-Debit (NACH)', desc: 'Monthly recurring mandate-based collections — T+2 settlement.', color: 'var(--accent-purple)', count: 1 }
        ].map(p => (
          <div key={p.name} className="kpi-card" style={{ borderTop: `3px solid ${p.color}` }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: p.color }}>{p.name}</span>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{p.desc}</p>
            <div className="kpi-divider"><span>GILE Active:</span><span style={{ fontWeight: 700 }}>{p.count} Institutes</span></div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="card-title">Global Tenure & Rate Config</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Product Variant</th><th>Category</th><th>Merchant Rate</th><th>Settlement TAT</th><th>Status</th></tr></thead>
            <tbody>
              {[
                { v: '6-Month No-Cost EMI', c: 'EMI Financing', r: '2.2% merchant fee', t: 'Disbursement T+3', s: 'Active' },
                { v: '12-Month Low-Interest EMI', c: 'EMI Financing', r: '1.5% + student APR', t: 'Disbursement T+3', s: 'Active' },
                { v: 'Standard PG · Credit Card / UPI', c: 'Payment Gateway', r: '1.8% MDR', t: 'Settlement T+1', s: 'Active' },
                { v: 'Monthly NACH Mandate', c: 'Auto-Debit', r: '₹10 flat / txn', t: 'Settlement T+2', s: 'Active' }
              ].map(row => (
                <tr key={row.v}>
                  <td style={{ fontWeight: 600 }}>{row.v}</td>
                  <td><span className="badge badge-inactive">{row.c}</span></td>
                  <td>{row.r}</td>
                  <td style={{ color: 'var(--accent-indigo)', fontWeight: 500 }}>{row.t}</td>
                  <td>{statusBadge(row.s)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── SECTION: TEAM MANAGEMENT ────────────────────────────────────────────────
  const TeamPage = () => (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <PageHeader
        title="Team Management"
        subtitle="Configure user roles and access permissions"
        action={
          currentUser?.role === 'Admin' ? (
            <button className="btn-primary-sm" onClick={() => setAddTeamOpen(true)}>
              <UserPlus size={14} /> Add Member
            </button>
          ) : <span className="badge badge-inactive">Admin only</span>
        }
      />
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {team.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td style={{ fontSize: '0.825rem' }}>{m.email}</td>
                  <td><span className={`badge ${m.role === 'Admin' ? 'badge-success' : 'badge-inactive'}`}>{m.role}</span></td>
                  <td>{statusBadge(m.status)}</td>
                  <td>
                    <button className="btn-danger-sm" onClick={() => {
                      if (currentUser?.role !== 'Admin') return alert('Admins only.');
                      setTeam(p => p.filter(t => t.id !== m.id));
                      addLog(`Revoked access for ${m.email}`, 'RBAC');
                    }}>Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── SECTION: SUPPORT ─────────────────────────────────────────────────────────
  const SupportPage = () => (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <PageHeader title="Support" subtitle="Get help, raise tickets, and access documentation" />
      <div className="support-grid">
        {[
          { icon: MessageSquare, title: 'Raise a Ticket', desc: 'Submit a support request and track it in real-time.', btn: 'Open Ticket', color: 'var(--accent-indigo)' },
          { icon: Phone, title: 'Partner Hotline', desc: 'Call your dedicated partner success manager.', btn: '+91 1800-XXX-XXXX', color: 'var(--accent-emerald)' },
          { icon: Mail, title: 'Email Support', desc: 'Write to us and expect a response within 4 business hours.', btn: 'partner@grayquest.com', color: 'var(--accent-cyan)' },
          { icon: BookOpen, title: 'Documentation', desc: 'API references, webhook guides, and integration docs.', btn: 'View Docs', color: 'var(--accent-purple)' },
          { icon: ExternalLink, title: 'System Status', desc: 'Check real-time API health and uptime metrics.', btn: 'status.grayquest.com', color: 'var(--accent-amber)' },
          { icon: Shield, title: 'Compliance & Security', desc: 'PCI-DSS compliance docs and security disclosures.', btn: 'View Policy', color: 'var(--accent-rose)' }
        ].map(card => (
          <div key={card.title} className="support-card">
            <div className="support-icon" style={{ background: `${card.color}18`, color: card.color }}>
              <card.icon size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.375rem' }}>{card.title}</div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{card.desc}</p>
            </div>
            <button className="btn-sm" style={{ marginTop: 'auto', width: 'fit-content', borderColor: card.color, color: card.color }}>
              {card.btn}
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card-title">Frequently Asked Questions</h3>
        {[
          { q: 'When does disbursement happen for EMI transactions?', a: 'EMI disbursements are processed T+3 after lender tranche approval. This is separate from PG/Auto-Debit which follow T+1 and T+2 settlement cycles respectively.' },
          { q: 'What is GILE?', a: 'GILE stands for Group · Institute · Location · Education — the hierarchical identifier for each partner institution in the GrayQuest ecosystem.' },
          { q: 'Why is GMV different from commissions?', a: 'GMV (Gross Merchandise Value) is the total monetary volume processed/settled to the institute. Commissions are the partner\'s revenue share earned from facilitating these transactions.' },
          { q: 'How does PII masking work?', a: 'By default, all student email and phone data is masked. Admin users can toggle visibility in institute drill-down pages for compliance audits.' }
        ].map(({ q, a }) => (
          <div key={q} style={{ padding: '0.875rem 0', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>{q}</div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{a}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── SECTION: ACTIVITY LOGS ──────────────────────────────────────────────────
  const LogsPage = () => (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <PageHeader
        title="Activity Logs"
        subtitle="Security audit trail — all user actions logged"
        action={
          <button className="btn-sm" onClick={() => exportCSV(logs, 'ActivityLogs.csv')}>
            <Download size={14} /> Export CSV
          </button>
        }
      />
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Category</th></tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.timestamp}</td>
                  <td style={{ fontWeight: 600, fontSize: '0.825rem' }}>{l.user}</td>
                  <td style={{ fontSize: '0.825rem' }}>{l.action}</td>
                  <td>
                    <span className={`badge ${l.type === 'Security' ? 'badge-failed' : l.type === 'RBAC' ? 'badge-success' : l.type === 'Export' ? 'badge-pending' : 'badge-inactive'}`}>
                      {l.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── RECEIPT MODAL ────────────────────────────────────────────────────────────
  const ReceiptModal = () => receiptTxn && (
    <div className="modal-overlay" onClick={() => setReceiptTxn(null)}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="receipt-paper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '2px solid #e5e7eb' }}>
            <div>
              <div className="receipt-logo">GRAYQUEST</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Institutional Payment Receipt</div>
            </div>
            <button className="icon-btn" onClick={() => setReceiptTxn(null)} style={{ color: '#9ca3af' }}><X size={18} /></button>
          </div>
          <div className="receipt-row"><span className="r-label">Receipt No.</span><span className="r-val">REC-{receiptTxn.id.substring(4)}</span></div>
          <div className="receipt-row"><span className="r-label">Transaction ID</span><span className="r-val" style={{ fontFamily: 'monospace' }}>{receiptTxn.id}</span></div>
          <div className="receipt-row"><span className="r-label">Order Reference</span><span className="r-val">{receiptTxn.orderId}</span></div>
          <div className="receipt-row"><span className="r-label">Payment ID</span><span className="r-val">{receiptTxn.paymentId}</span></div>
          <div className="receipt-row"><span className="r-label">Date & Time</span><span className="r-val">{receiptTxn.createdAt.replace('T', ' ')}</span></div>
          <hr className="receipt-divider" />
          <div className="receipt-row"><span className="r-label">Student Name</span><span className="r-val">{receiptTxn.studentName}</span></div>
          <div className="receipt-row"><span className="r-label">Student ID</span><span className="r-val">{receiptTxn.studentId}</span></div>
          <div className="receipt-row"><span className="r-label">Institute</span><span className="r-val">{receiptTxn.instituteName}</span></div>
          <div className="receipt-row"><span className="r-label">Fee Category</span><span className="r-val">{receiptTxn.feeHeader}</span></div>
          <div className="receipt-row"><span className="r-label">Payment Mode</span><span className="r-val">{receiptTxn.paymentMode} ({receiptTxn.vendor})</span></div>
          {receiptTxn.paymentMode === 'EMI' && receiptTxn.disbursementDate && (
            <div className="receipt-row"><span className="r-label">Disbursement Date</span><span className="r-val">{receiptTxn.disbursementDate}</span></div>
          )}
          <hr className="receipt-divider" />
          <div className="receipt-total">
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Amount Paid</span>
            <span style={{ fontWeight: 800, fontSize: '1.35rem', color: '#10b981' }}>{fmtINR(receiptTxn.amount)}</span>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.68rem', color: '#9ca3af', marginTop: '1.5rem' }}>
            This is a system-generated receipt authorised by GrayQuest Technologies Pvt. Ltd.
          </p>
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', background: 'var(--bg-secondary)' }}>
          <button className="btn-primary" style={{ flex: 1 }} onClick={() => window.print()}>Print Receipt</button>
          <button className="btn-secondary" onClick={() => setReceiptTxn(null)}>Close</button>
        </div>
      </div>
    </div>
  );

  // ─── ADD TEAM MEMBER MODAL ────────────────────────────────────────────────────
  const AddTeamModal = () => addTeamOpen && (
    <div className="modal-overlay" onClick={() => setAddTeamOpen(false)}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="card-title">Add Team Member</h3>
          <button className="icon-btn" onClick={() => setAddTeamOpen(false)}><X size={18} /></button>
        </div>
        <form onSubmit={addTeamMember}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" required value={newMember.name} onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Ramesh Patil" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" required value={newMember.email} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))} placeholder="name@grayquest.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Access Role</label>
              <select className="filter-select" style={{ width: '100%', padding: '0.875rem 1rem' }} value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))}>
                <option value="Accountant">Accountant</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn-secondary" onClick={() => setAddTeamOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.625rem 1.5rem' }}>Authorize</button>
          </div>
        </form>
      </div>
    </div>
  );

  // ─── SECTION: REPORTS ────────────────────────────────────────────────────────
  const ReportsPage = () => {
    // Compute preview data based on current report config
    const reportPreviewData = useMemo(() => {
      const applyCommonFilters = (rows, dateField = 'createdAt') => {
        return rows.filter(r => {
          if (reportMode !== 'All' && r.paymentMode !== reportMode) return false;
          if (reportInst !== 'All' && r.instituteId !== reportInst) return false;
          const dateVal = r[dateField] || r.createdAt || '';
          if (reportDateStart && dateVal < reportDateStart) return false;
          if (reportDateEnd && dateVal > reportDateEnd + 'T99') return false;
          return true;
        });
      };

      if (reportType === 'settlement') {
        let rows = settlements.filter(s => {
          if (reportMode !== 'All' && s.paymentMode !== reportMode) return false;
          if (reportInst !== 'All' && s.instituteId !== reportInst) return false;
          if (reportDateStart && s.settlementDate < reportDateStart) return false;
          if (reportDateEnd && s.settlementDate > reportDateEnd) return false;
          if (reportDisbStart && s.paymentMode === 'EMI' && s.disbursementDate < reportDisbStart) return false;
          if (reportDisbEnd && s.paymentMode === 'EMI' && s.disbursementDate > reportDisbEnd) return false;
          return true;
        });
        return rows.map(s => ({
          'Settlement ID': s.id, 'Txn Ref': s.txnId, 'Student': s.studentName, 'Student ID': s.studentId,
          'Institute': s.instituteName, 'Fee Header': s.feeHeader, 'Amount (₹)': s.amount,
          'Mode': s.paymentMode, 'Settlement Date': s.settlementDate,
          'Disbursement Date': s.paymentMode === 'EMI' ? s.disbursementDate : 'N/A',
          'UTR': s.utr, 'Bank': s.bankName, 'Account': s.accountNo, 'IFSC': s.ifsc, 'Status': 'Settled'
        }));
      }

      if (reportType === 'transaction') {
        let rows = applyCommonFilters(transactions);
        if (reportStatus !== 'All') rows = rows.filter(r => r.status === reportStatus);
        if (reportDisbStart || reportDisbEnd) {
          rows = rows.filter(r => {
            if (r.paymentMode !== 'EMI') return true;
            if (reportDisbStart && r.disbursementDate && r.disbursementDate < reportDisbStart) return false;
            if (reportDisbEnd && r.disbursementDate && r.disbursementDate > reportDisbEnd) return false;
            return true;
          });
        }
        return rows.map(t => ({
          'Txn ID': t.id, 'Order ID': t.orderId, 'Payment ID': t.paymentId,
          'Student': t.studentName, 'Student ID': t.studentId, 'Student Phone': t.studentPhone,
          'Institute': t.instituteName, 'Fee Header': t.feeHeader, 'Amount (₹)': t.amount,
          'Mode': t.paymentMode, 'Vendor': t.vendor, 'Created On': fmtDate(t.createdAt),
          'Disbursement Date': t.paymentMode === 'EMI' ? (t.disbursementDate || '—') : 'N/A',
          'Status': t.status
        }));
      }

      if (reportType === 'commission') {
        let rows = applyCommonFilters(transactions.filter(t => t.status === 'Success'));
        if (reportStatus === 'Paid') rows = rows.filter(r => r.commissionPaid);
        if (reportStatus === 'Pending') rows = rows.filter(r => !r.commissionPaid);
        return rows.map(t => ({
          'Txn ID': t.id, 'Student': t.studentName, 'Student ID': t.studentId,
          'Institute': t.instituteName, 'Processed Volume (₹)': t.amount,
          'Mode': t.paymentMode, 'Commission Rate %': t.commissionRate,
          'Commission Earned (₹)': t.commissionEarned,
          'Transaction Date': fmtDate(t.createdAt),
          'Payout Status': t.commissionPaid ? 'Disbursed' : 'Pending'
        }));
      }

      if (reportType === 'onboarding') {
        let list = institutes;
        if (reportInst !== 'All') list = list.filter(i => i.id === reportInst);
        return list.map(i => ({
          'Institute': i.name, 'Group': i.group, 'Location': i.location,
          'Total Students': i.totalStudents, 'Onboarding Date': i.onboardingDate,
          'Applied': i.funnel?.applied, 'KYC Done': i.funnel?.kyc,
          'Mandate Set': i.funnel?.mandate, 'Approved': i.funnel?.approval,
          'Disbursed': i.funnel?.disbursed, 'Conversion %': ((i.funnel?.disbursed / (i.funnel?.applied || 1)) * 100).toFixed(1) + '%',
          'Status': i.status
        }));
      }

      if (reportType === 'gile-performance') {
        let list = institutes;
        if (reportInst !== 'All') list = list.filter(i => i.id === reportInst);
        return list.map(i => {
          const instTxns = transactions.filter(t => t.instituteId === i.id && t.status === 'Success');
          const gmv = instTxns.reduce((a, t) => a + t.amount, 0);
          const comm = instTxns.reduce((a, t) => a + t.commissionEarned, 0);
          const allTxns = transactions.filter(t => t.instituteId === i.id);
          const successRate = allTxns.length ? ((instTxns.length / allTxns.length) * 100).toFixed(1) + '%' : '—';
          return {
            'GILE': i.name, 'Group': i.group, 'Location': i.location, 'Status': i.status,
            'Total Students': i.totalStudents, 'Total Txns': allTxns.length,
            'Successful Txns': instTxns.length, 'Success Rate': successRate,
            'Total GMV (₹)': gmv, 'Commissions Earned (₹)': comm,
            'Onboarded': i.onboardingDate
          };
        });
      }

      if (reportType === 'reconciliation') {
        // Cross-reference: all success txns vs their settlement
        const successTxns = transactions.filter(t => t.status === 'Success');
        return successTxns.map(t => {
          const s = settlements.find(st => st.txnId === t.id);
          if (reportMode !== 'All' && t.paymentMode !== reportMode) return null;
          if (reportInst !== 'All' && t.instituteId !== reportInst) return null;
          return {
            'Txn ID': t.id, 'Student': t.studentName, 'Institute': t.instituteName,
            'Amount (₹)': t.amount, 'Mode': t.paymentMode, 'Txn Date': fmtDate(t.createdAt),
            'Settlement ID': s?.id || '—', 'UTR': s?.utr || '—',
            'Settlement Date': s?.settlementDate || '—',
            'Disbursement Date': t.paymentMode === 'EMI' ? (t.disbursementDate || '—') : 'N/A',
            'Reconciliation Status': s ? '✓ Matched' : '⚠ Unmatched'
          };
        }).filter(Boolean);
      }

      return [];
    }, [reportType, reportMode, reportInst, reportStatus, reportDateStart, reportDateEnd, reportDisbStart, reportDisbEnd]);

    const REPORT_TYPES = [
      { key: 'settlement',       label: 'Settlement Report',      desc: 'All settled fund transfers to institutes',        icon: Wallet,      color: 'var(--accent-emerald)' },
      { key: 'transaction',      label: 'Transaction Report',     desc: 'All payment attempts across all modes',           icon: CreditCard,  color: 'var(--accent-indigo)' },
      { key: 'commission',       label: 'Commission Report',      desc: 'Partner revenue share by mode and institute',     icon: BarChart3,   color: 'var(--accent-cyan)' },
      { key: 'onboarding',       label: 'Student Onboarding',     desc: 'Funnel conversion rates per GILE',                icon: School,      color: 'var(--accent-purple)' },
      { key: 'gile-performance', label: 'GILE Performance',       desc: 'GMV, success rate & commissions per institute',   icon: TrendingUp,  color: 'var(--accent-amber)' },
      { key: 'reconciliation',   label: 'Reconciliation Report',  desc: 'Cross-match transactions vs settlements',          icon: CheckCircle, color: 'var(--accent-rose)' },
    ];

    const totalAmt = reportPreviewData.reduce((a, r) => a + (Number(r['Amount (₹)']) || Number(r['Processed Volume (₹)']) || Number(r['Total GMV (₹)']) || 0), 0);
    const totalComm = reportPreviewData.reduce((a, r) => a + (Number(r['Commission Earned (₹)']) || Number(r['Commissions Earned (₹)']) || 0), 0);

    const handleGenerate = () => {
      setReportGenerated(true);
      const selectedReport = REPORT_TYPES.find(r => r.key === reportType);
      const modeSuffix = reportMode !== 'All' ? ` · ${reportMode}` : ' · All Modes';
      setReportHistory(prev => [{
        id: `rpt-${Date.now()}`,
        name: `${selectedReport.label}${modeSuffix}`,
        generatedBy: currentUser?.email,
        generatedAt: new Date().toLocaleString('en-IN', { hour12: false }).substring(0, 16),
        rows: reportPreviewData.length,
        type: reportType
      }, ...prev]);
      addLog(`Generated ${selectedReport.label} (${reportMode}, ${reportPreviewData.length} rows)`, 'Export');
    };

    const handleDownload = () => {
      if (!reportPreviewData.length) return;
      exportCSV(reportPreviewData, `GQ_Report_${reportType}_${reportMode}_${Date.now()}.csv`);
    };

    const previewCols = reportPreviewData.length ? Object.keys(reportPreviewData[0]) : [];

    return (
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <PageHeader
          title="Reports"
          subtitle="Generate, preview, and export filtered financial reports across your GILE network"
        />

        {/* Report Type Selector */}
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Step 1 — Select Report Type</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.875rem' }}>
            {REPORT_TYPES.map(rt => (
              <div key={rt.key}
                onClick={() => { setReportType(rt.key); setReportGenerated(false); }}
                style={{
                  background: reportType === rt.key ? `${rt.color}12` : 'var(--bg-secondary)',
                  border: `1px solid ${reportType === rt.key ? rt.color : 'var(--border-color)'}`,
                  borderRadius: 14, padding: '1rem 1.125rem', cursor: 'pointer',
                  transition: 'all 0.2s ease', display: 'flex', alignItems: 'flex-start', gap: '0.875rem'
                }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${rt.color}18`, flexShrink: 0 }}>
                  <rt.icon size={18} color={rt.color} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem', color: reportType === rt.key ? rt.color : 'var(--text-primary)' }}>{rt.label}</div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{rt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Step 2 — Configure Filters</p>
          <div className="filter-bar">
            <div className="filter-group">
              <label className="filter-label">Payment Mode</label>
              <select className="filter-select" value={reportMode} onChange={e => { setReportMode(e.target.value); setReportGenerated(false); }}>
                <option>All</option><option>EMI</option><option>PG</option><option>Auto-Debit</option>
              </select>
            </div>

            {(reportType === 'settlement' || reportType === 'transaction' || reportType === 'gile-performance' || reportType === 'reconciliation') && (
              <div className="filter-group">
                <label className="filter-label">Institute</label>
                <select className="filter-select" value={reportInst} onChange={e => { setReportInst(e.target.value); setReportGenerated(false); }}>
                  <option value="All">All Institutes</option>
                  {institutes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
            )}

            {(reportType === 'transaction' || reportType === 'commission') && (
              <div className="filter-group">
                <label className="filter-label">Status / Payout</label>
                <select className="filter-select" value={reportStatus} onChange={e => { setReportStatus(e.target.value); setReportGenerated(false); }}>
                  {reportType === 'transaction' ? (
                    <><option>All</option><option>Success</option><option>Pending</option><option>Failed</option></>
                  ) : (
                    <><option>All</option><option>Paid</option><option>Pending</option></>
                  )}
                </select>
              </div>
            )}

            {reportType !== 'onboarding' && reportType !== 'gile-performance' && (
              <div className="filter-group">
                <label className="filter-label">{reportType === 'settlement' ? 'Settlement Date' : 'Transaction Date'}</label>
                <div className="filter-date-range">
                  <input type="date" className="filter-input" style={{ width: 135 }} value={reportDateStart} onChange={e => { setReportDateStart(e.target.value); setReportGenerated(false); }} />
                  <span>to</span>
                  <input type="date" className="filter-input" style={{ width: 135 }} value={reportDateEnd} onChange={e => { setReportDateEnd(e.target.value); setReportGenerated(false); }} />
                </div>
              </div>
            )}

            {/* EMI Disbursement filter — only for settlement, transaction, reconciliation */}
            {(reportType === 'settlement' || reportType === 'transaction' || reportType === 'reconciliation') && (
              <div className="filter-group">
                <label className="filter-label" style={{ color: 'var(--accent-indigo)' }}>EMI Disbursement Date</label>
                <div className="filter-date-range">
                  <input type="date" className="filter-input" style={{ width: 135 }} value={reportDisbStart} onChange={e => { setReportDisbStart(e.target.value); setReportGenerated(false); }} />
                  <span>to</span>
                  <input type="date" className="filter-input" style={{ width: 135 }} value={reportDisbEnd} onChange={e => { setReportDisbEnd(e.target.value); setReportGenerated(false); }} />
                </div>
                <p style={{ fontSize: '0.68rem', color: 'var(--accent-amber)', fontWeight: 600, marginTop: 3 }}>⚠ Applies to EMI only</p>
              </div>
            )}

            <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary-sm" onClick={handleGenerate}>
                <RefreshCw size={14} /> Generate Report
              </button>
              <button className="btn-sm" onClick={() => {
                setReportMode('All'); setReportInst('All'); setReportStatus('All');
                setReportDateStart(''); setReportDateEnd('');
                setReportDisbStart(''); setReportDisbEnd('');
                setReportGenerated(false);
              }}>
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Step 3 — Preview & Download</p>
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  {REPORT_TYPES.find(r => r.key === reportType)?.label}
                  {reportMode !== 'All' && <span style={{ color: 'var(--accent-indigo)', marginLeft: 8 }}>· {reportMode}</span>}
                </h3>
                <p className="card-subtitle">
                  {reportGenerated
                    ? <span style={{ color: 'var(--accent-emerald)' }}>✓ {reportPreviewData.length} records ready to export</span>
                    : <span style={{ color: 'var(--text-muted)' }}>Click "Generate Report" to compute {reportPreviewData.length} matching records</span>
                  }
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {totalAmt > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Value</div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{fmtINR(totalAmt)}</div>
                  </div>
                )}
                {totalComm > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Commission</div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{fmtINR(totalComm)}</div>
                  </div>
                )}
                {reportGenerated && reportPreviewData.length > 0 && (
                  <button className="btn-primary-sm" onClick={handleDownload}>
                    <Download size={14} /> Download CSV
                  </button>
                )}
              </div>
            </div>

            {reportPreviewData.length > 0 ? (
              <div className="table-wrap" style={{ maxHeight: 420, overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>{previewCols.map(col => <th key={col}>{col}</th>)}</tr>
                  </thead>
                  <tbody>
                    {reportPreviewData.slice(0, 50).map((row, i) => (
                      <tr key={i}>
                        {previewCols.map(col => (
                          <td key={col} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {String(col).includes('₹') ? <strong>{typeof row[col] === 'number' ? fmtINR(row[col]) : row[col]}</strong> :
                              String(row[col]).includes('✓') ? <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{row[col]}</span> :
                              String(row[col]).includes('⚠') ? <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>{row[col]}</span> :
                              String(col) === 'Mode' ? modeBadge(row[col]) :
                              String(col) === 'Status' ? statusBadge(row[col]) :
                              row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportPreviewData.length > 50 && (
                  <div style={{ textAlign: 'center', padding: '0.875rem', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
                    Showing first 50 of {reportPreviewData.length} rows — download CSV to get the full dataset
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={40} style={{ opacity: 0.3 }} />
                <div style={{ fontWeight: 600 }}>No data matches the selected filters</div>
                <p style={{ fontSize: '0.825rem' }}>Adjust the filters above or select a different report type</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Exports History */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Report Exports</h3>
            <span className="kpi-sub">Last 10 generated reports in this session</span>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Report Name</th><th>Type</th><th>Generated By</th><th>Generated At</th><th>Rows</th><th>Action</th></tr>
              </thead>
              <tbody>
                {reportHistory.map(r => {
                  const rt = REPORT_TYPES.find(t => t.key === r.type);
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.name}</td>
                      <td>
                        <span className="badge badge-inactive" style={{ color: rt?.color }}>
                          <rt.icon size={11} style={{ marginRight: 4 }} />{rt?.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.825rem' }}>{r.generatedBy}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.generatedAt}</td>
                      <td><span className="badge badge-active">{r.rows} rows</span></td>
                      <td>
                        <button className="btn-sm" style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => {
                            setReportType(r.type);
                            handleGenerate();
                          }}>
                          <RefreshCw size={11} /> Re-run
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  const renderPage = () => {
    if (drilldownInstId) return <DrilldownPage />;
    switch (activePage) {
      case 'overview': return <OverviewPage />;
      case 'transactions': return <TransactionsPage />;
      case 'settlements': return <SettlementsPage />;
      case 'commissions': return <CommissionsPage />;
      case 'reports': return <ReportsPage />;
      case 'institutes': return <InstitutesPage />;
      case 'products': return <ProductsPage />;
      case 'team': return <TeamPage />;
      case 'support': return <SupportPage />;
      case 'logs': return <LogsPage />;
      default: return <OverviewPage />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <Database size={22} /><span>GrayQuest</span>
        </div>

        <ul className="sidebar-menu">
          <li className="sidebar-section-label">Analytics</li>
          <NavItem icon={LayoutDashboard} label="Overview" pageKey="overview" />

          <li className="sidebar-section-label">Finance</li>
          <NavItem icon={CreditCard} label="Transactions" pageKey="transactions" />
          <NavItem icon={Wallet} label="Settlements" pageKey="settlements" />
          <NavItem icon={BarChart3} label="Commissions" pageKey="commissions" />
          <NavItem icon={FileText} label="Reports" pageKey="reports" />

          <li className="sidebar-section-label">Operations</li>
          <NavItem icon={School} label="Institutes App" pageKey="institutes" />
          <NavItem icon={Database} label="Product Catalog" pageKey="products" />

          <li className="sidebar-section-label">Admin</li>
          <NavItem icon={Users} label="Team Management" pageKey="team" />
          <NavItem icon={Activity} label="Activity Logs" pageKey="logs" />
          <NavItem icon={HelpCircle} label="Support" pageKey="support" />
        </ul>

        <div className="sidebar-footer">
          <div className="session-badge">
            <span><span className="session-dot" />2FA Active</span>
            <span style={{ fontSize: '0.68rem' }}>{currentUser?.role}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={15} /><span>Exit Portal</span>
          </button>
        </div>
      </div>

      {/* Main panel */}
      <div className="main-content">
        {/* Top header */}
        <div className="top-header">
          <div className="header-search">
            <Search size={15} className="search-icon" />
            <input className="search-input" placeholder="Search GILE, student, transaction ID…"
              value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            {searchQ && searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-xl)', zIndex: 200 }}>
                {searchResults.map((r, i) => (
                  <div key={i} style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)' }}
                    onClick={() => { openDrilldown(r.id); setSearchQ(''); }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.sub}</div>
                    </div>
                    <span className="badge badge-inactive">{r.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="user-cluster">
            <button className="notif-btn"><Bell size={18} /><span className="notif-dot" /></button>
            <div className="profile-card">
              <div className="profile-avatar">{currentUser?.name?.substring(0, 2).toUpperCase()}</div>
              <div>
                <div className="profile-name">{currentUser?.email}</div>
                <div className="profile-role">{currentUser?.role}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="page-scroll-region">
          <div className="page-content">
            {renderPage()}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReceiptModal />
      <AddTeamModal />

      {webhookModalInst && (
        <div className="modal-backdrop" onClick={() => setWebhookModalInst(null)}>
          <div className="modal-content" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Configure Webhook Events</h3>
                <p className="modal-subtitle">Select the events you want to receive webhook notifications for.</p>
              </div>
              <button className="modal-close" onClick={() => setWebhookModalInst(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
              <select 
                multiple 
                className="filter-select" 
                style={{ height: 120, width: '100%', fontSize: '0.875rem' }}
                value={tempEvents}
                onChange={e => setTempEvents(Array.from(e.target.selectedOptions, o => o.value))}
              >
                <option value="payment.success">payment.success</option>
                <option value="payment.failed">payment.failed</option>
                <option value="student.onboarded">student.onboarded</option>
                <option value="payout.settled">payout.settled</option>
                <option value="payout.failed">payout.failed</option>
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button className="btn-sm" style={{ background: '#fff', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} onClick={() => setWebhookModalInst(null)}>
                  Cancel
                </button>
                <button className="btn-sm" style={{ background: '#111827', color: '#fff' }} onClick={() => {
                  updateEvents(webhookModalInst.id, tempEvents);
                  setWebhookModalInst(null);
                }}>
                  Save Events
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
