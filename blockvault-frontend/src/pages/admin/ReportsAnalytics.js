import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import apiService from '../../services/api';

const defaultStats = [
  {
    label: 'Total Certificates',
    value: '2',
    trend: '+100%',
    trendUp: true,
    icon: FileText,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Verified & Anchored',
    value: '2',
    trend: '+100%',
    trendUp: true,
    icon: CheckCircle,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    label: 'Blockchain Blocks',
    value: '3',
    trend: 'Synchronized',
    trendUp: true,
    icon: ShieldCheck,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    label: 'Revoked',
    value: '0',
    trend: '0%',
    trendUp: false,
    icon: AlertTriangle,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
];

const chartData = [
  { month: 'Jan', valid: 1, pending: 0, invalid: 0 },
  { month: 'Feb', valid: 2, pending: 0, invalid: 0 },
  { month: 'Mar', valid: 3, pending: 0, invalid: 0 },
  { month: 'Apr', valid: 4, pending: 0, invalid: 0 },
  { month: 'May', valid: 5, pending: 0, invalid: 0 },
  { month: 'Oct', valid: 6, pending: 0, invalid: 0 },
];

export default function ReportsAnalytics() {
  const [stats, setStats] = useState(defaultStats);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const summaryRes = await apiService.getDashboardStats();
      if (summaryRes && summaryRes.success && summaryRes.stats) {
        const s = summaryRes.stats;
        setStats([
          {
            label: 'Total Certificates',
            value: String(s.totalCertificates),
            trend: `${s.totalCertificates} issued`,
            trendUp: true,
            icon: FileText,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
          },
          {
            label: 'Verified & Anchored',
            value: String(s.validCertificates),
            trend: `${s.verificationRate}% validity`,
            trendUp: true,
            icon: CheckCircle,
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600',
          },
          {
            label: 'Blockchain Blocks',
            value: String(s.totalBlocks),
            trend: s.isChainValid ? 'Integrity 100%' : 'Audit needed',
            trendUp: s.isChainValid,
            icon: ShieldCheck,
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600',
          },
          {
            label: 'Revoked',
            value: String(s.revokedCertificates),
            trend: `${s.revokedCertificates} revoked`,
            trendUp: s.revokedCertificates === 0,
            icon: AlertTriangle,
            iconBg: 'bg-red-50',
            iconColor: 'text-red-600',
          },
        ]);
      }

      const notifRes = await apiService.getNotifications();
      if (notifRes && notifRes.success && notifRes.data) {
        setNotifications(notifRes.data.map(n => ({
          text: n.title,
          time: n.time,
          unread: n.unread,
          type: n.type === 'alert' ? 'warning' : 'success'
        })));
      }
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-[#1A1A1A]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Reports & Analytics
          </h1>
          <p className="text-gray-500 mt-1">
            Real-time cryptographic audit and credential distribution metrics
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold cursor-pointer transition-colors"
        >
          Refresh Stats
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown;
          const trendColor = stat.trendUp ? 'text-green-600' : 'text-red-600';
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 ${stat.iconBg} rounded-full flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${trendColor} bg-opacity-10 px-2 py-0.5 rounded-full`}
                >
                  <TrendIcon className="w-3 h-3" />
                  {stat.trend}
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-[#1A1A1A] mt-1">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Certificate Status Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Certificate Issuance Growth & Verification
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
              />
              <Bar dataKey="valid" fill="#1F3D2B" name="Valid" radius={[4, 4, 0, 0]} />
              <Bar dataKey="invalid" fill="#DC2626" name="Invalid" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">
              Recent Audit Log
            </h2>
            <Link
              to="/admin/notifications"
              className="text-sm font-medium text-[#1F3D2B] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {notifications.slice(0, 4).map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.type === 'warning' ? 'bg-red-500' : 'bg-green-500'}`} />
                  <span className="text-sm text-gray-800 font-medium">{item.text}</span>
                </div>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
