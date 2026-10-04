import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Hash,
  Boxes,
  XCircle,
  RefreshCw,
  Shield,
} from 'lucide-react';
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import apiService from '../../services/api';

// ── Greeting based on time ─────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function Dashboard() {
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const res = await apiService.getDashboardStats();
      if (res?.success && res?.stats) {
        setStats(res);
      } else {
        setError('Could not load dashboard stats. Make sure the backend is running.');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Derived stats cards
  const statCards = stats
    ? [
        {
          label: 'Total Certificates',
          value: stats.stats.totalCertificates,
          trend: `${stats.stats.totalCertificates} issued`,
          trendUp: true,
          icon: FileText,
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
        },
        {
          label: 'Valid Certificates',
          value: stats.stats.validCertificates,
          trend: stats.stats.verificationRate + '% valid',
          trendUp: true,
          icon: CheckCircle,
          iconBg: 'bg-green-50',
          iconColor: 'text-green-600',
        },
        {
          label: 'Revoked',
          value: stats.stats.revokedCertificates,
          trend: stats.stats.revokedCertificates > 0 ? 'Review needed' : 'All good',
          trendUp: stats.stats.revokedCertificates === 0,
          icon: XCircle,
          iconBg: 'bg-red-50',
          iconColor: 'text-red-600',
        },
        {
          label: 'Blockchain Blocks',
          value: stats.stats.totalBlocks,
          trend: stats.stats.isChainValid ? 'Chain intact ✓' : 'Chain warning!',
          trendUp: stats.stats.isChainValid,
          icon: stats.stats.isChainValid ? Shield : AlertTriangle,
          iconBg: stats.stats.isChainValid ? 'bg-emerald-50' : 'bg-amber-50',
          iconColor: stats.stats.isChainValid ? 'text-emerald-600' : 'text-amber-600',
        },
      ]
    : [];

  // Chart data from recent certificates
  const recentCerts = stats?.recentCertificates || [];
  const pieData = stats
    ? [
        { name: 'Valid', value: stats.stats.validCertificates || 0, color: '#16a34a' },
        { name: 'Revoked', value: stats.stats.revokedCertificates || 0, color: '#dc2626' },
      ]
    : [];

  // Activity feed from recent certs
  const activityFeed = recentCerts.slice(0, 5).map((cert, i) => ({
    icon: cert.status === 'Invalid' ? XCircle : cert.blockNumber ? Boxes : FileText,
    iconBg: cert.status === 'Invalid' ? 'bg-red-50' : 'bg-green-50',
    iconColor: cert.status === 'Invalid' ? 'text-red-600' : 'text-green-600',
    text: cert.status === 'Invalid'
      ? `Certificate ${cert.id} Revoked`
      : `Certificate ${cert.id} anchored to blockchain`,
    sub: cert.studentName + ' — ' + cert.course,
    time: cert.issueDate || cert.createdAt || '—',
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#1F3D2B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-[#1A1A1A]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {getGreeting()}, Admin 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here's a live overview of your BlockVault system.
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown;
          const trendColor = stat.trendUp ? 'text-green-600' : 'text-red-600';
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.iconBg} rounded-full flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                  <TrendIcon className="w-3 h-3" />
                  <span className="truncate max-w-[90px]">{stat.trend}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-[#1A1A1A] mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Pie Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Certificate Status</h2>
          <div className="h-52 flex items-center justify-center">
            {stats && (stats.stats.totalCertificates > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No certificates yet</p>
                <Link to="/admin/certificates" className="text-xs text-[#1F3D2B] font-semibold hover:underline">
                  Issue the first one →
                </Link>
              </div>
            )}
          </div>
          {stats && stats.stats.totalCertificates > 0 && (
            <div className="flex justify-center gap-5 mt-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-gray-500">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Recent Activity</h2>
            <Link to="/admin/notifications" className="text-xs text-[#1F3D2B] font-semibold hover:underline">
              View all →
            </Link>
          </div>

          {activityFeed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Hash className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">No activity yet. Issue a certificate to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activityFeed.map((tx, idx) => {
                const Icon = tx.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-9 h-9 ${tx.iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${tx.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">{tx.text}</p>
                      <p className="text-xs text-gray-400 truncate">{tx.sub}</p>
                      <p className="text-xs text-gray-300">{tx.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chain Integrity Banner */}
      {stats && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          stats.stats.isChainValid
            ? 'bg-emerald-50 border border-emerald-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <Shield className={`w-6 h-6 flex-shrink-0 ${stats.stats.isChainValid ? 'text-emerald-600' : 'text-red-600'}`} />
          <div>
            <p className={`font-semibold text-sm ${stats.stats.isChainValid ? 'text-emerald-800' : 'text-red-800'}`}>
              {stats.stats.isChainValid
                ? `Blockchain Integrity: All ${stats.stats.totalBlocks} blocks verified ✓`
                : 'Blockchain Integrity Warning — chain may be compromised!'}
            </p>
            <p className={`text-xs mt-0.5 ${stats.stats.isChainValid ? 'text-emerald-600' : 'text-red-600'}`}>
              {stats.stats.isChainValid
                ? 'Every SHA-256 cryptographic anchor is intact and authenticated.'
                : 'Please review the blockchain ledger immediately.'}
            </p>
          </div>
          <Link to="/admin/blockchain" className="ml-auto text-xs font-semibold text-[#1F3D2B] hover:underline whitespace-nowrap">
            View Ledger →
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/certificates" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F3D2B] text-white rounded-full font-medium text-sm hover:bg-[#16281C] transition-colors">
            <Plus className="w-4 h-4" /> Issue Certificate
          </Link>
          <Link to="/admin/blockchain" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#1F3D2B] text-[#1F3D2B] rounded-full font-medium text-sm hover:bg-[#1F3D2B] hover:text-white transition-colors">
            <Boxes className="w-4 h-4" /> View Blockchain
          </Link>
          <Link to="/verify" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-600 rounded-full font-medium text-sm hover:bg-gray-50 transition-colors">
            <Hash className="w-4 h-4" /> Verify Certificate
          </Link>
        </div>
      </div>
    </div>
  );
}
