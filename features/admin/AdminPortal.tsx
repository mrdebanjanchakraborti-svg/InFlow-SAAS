
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { api, mockCustomers, mockSubscriptions, mockCommissions, mockSoftware, mockInvoices } from '../../services/mockApiService';
import { Customer, Subscription, Commission, Software } from '../../types';
import SoftwareManagement from './SoftwareManagement';
import CouponManagement from './CouponManagement';
import SupportPortal from '../support/SupportPortal';
import ReportsPage from './ReportsPage';
import CustomerManagement from './CustomerManagement';
import UserManagement from './UserManagement';

// Helper for currency formatting
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
};

// Reusable Stat Card
const StatCard: React.FC<{ title: string; value: string; icon: string }> = ({ title, value, icon }) => (
    <div className="bg-base-200 p-6 rounded-lg shadow-lg flex items-center space-x-4">
        <div className="bg-base-300 p-3 rounded-full">
            <span className="text-2xl">{icon}</span>
        </div>
        <div>
            <p className="text-content-muted text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC = () => {
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalInvoiced, setTotalInvoiced] = useState(0);
    const [activeUsers, setActiveUsers] = useState(0);
    const [upcomingRenewals, setUpcomingRenewals] = useState(0);
    const [totalCommissions, setTotalCommissions] = useState(0);
    const [revenueData, setRevenueData] = useState<any[]>([]);

    useEffect(() => {
        // Total Revenue based on completed payments from all invoices
        const revenue = mockInvoices
            .filter(inv => inv.paymentDate)
            .reduce((acc, inv) => acc + inv.amount, 0);
        setTotalRevenue(revenue);

        // Total Invoiced amount from all invoices, paid or not
        const invoiced = mockInvoices.reduce((acc, inv) => acc + inv.amount, 0);
        setTotalInvoiced(invoiced);

        // Active Users is the total number of customers
        setActiveUsers(mockCustomers.length);
        
        // Upcoming Renewals are subscriptions with a renewal date in the future
        const upcoming = mockSubscriptions.filter(sub => new Date(sub.nextRenewalDate) > new Date()).length;
        setUpcomingRenewals(upcoming);

        // Total commissions paid out
        const commissions = mockCommissions.reduce((acc, com) => acc + com.amount, 0);
        setTotalCommissions(commissions);

        // Generate revenue data for chart based on payments in the last 6 months for a dynamic view
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = mockInvoices
            .filter(inv => inv.paymentDate && new Date(inv.paymentDate) >= sixMonthsAgo)
            .reduce((acc, inv) => {
                const date = new Date(inv.paymentDate as string);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`; // YYYY-MM (0-indexed for sorting)
                if (!acc[monthKey]) {
                    acc[monthKey] = {
                        name: date.toLocaleString('default', { month: 'short' }),
                        revenue: 0
                    };
                }
                acc[monthKey].revenue += inv.amount;
                return acc;
            }, {} as Record<string, {name: string, revenue: number}>);
        
        const chartData = Object.keys(monthlyRevenue)
            .sort()
            .map(key => monthlyRevenue[key]);

        setRevenueData(chartData);
    }, []);

    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon="💰" />
                <StatCard title="Total Invoiced" value={formatCurrency(totalInvoiced)} icon="🧾" />
                <StatCard title="Active Customers" value={String(activeUsers)} icon="👥" />
                <StatCard title="Upcoming Renewals" value={String(upcomingRenewals)} icon="📅" />
                <StatCard title="Commissions Paid" value={formatCurrency(totalCommissions)} icon="💸" />
            </div>

            {/* Charts */}
            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Revenue Analytics (Last 6 Months)</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(Number(value))} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                            labelStyle={{ color: '#d1d5db' }}
                            itemStyle={{ color: '#4f46e5' }}
                            formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
                 <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-content">
                        <thead className="text-xs text-content-muted uppercase bg-base-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Software</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Renewal Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockSubscriptions.slice(0, 5).map(sub => {
                                const customer = mockCustomers.find(c => c.id === sub.customerId);
                                const software = mockSoftware.find(s => s.id === sub.softwareId);
                                return (
                                <tr key={sub.id} className="bg-base-200 border-b border-base-300 hover:bg-base-300">
                                    <td className="px-6 py-4">{customer?.name}</td>
                                    <td className="px-6 py-4">{software?.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900 text-blue-300">{sub.status}</span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(sub.nextRenewalDate).toLocaleDateString()}</td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

interface AdminPortalProps {
    deepLink: { target: string; ticketId: string; } | null;
    clearDeepLink: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ deepLink, clearDeepLink }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'software' | 'customers' | 'users' | 'coupons' | 'support' | 'reports'>('support');
    const [initialTicketId, setInitialTicketId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (deepLink?.target === 'support' && deepLink.ticketId) {
            setActiveTab('support');
            setInitialTicketId(deepLink.ticketId);
            clearDeepLink();
        }
    }, [deepLink, clearDeepLink]);

    return (
        <div>
            <div className="px-4 md:px-8 border-b border-base-300">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'dashboard'
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-content-muted hover:text-white hover:border-gray-500'
                        }`}
                    >
                        Dashboard
                    </button>
                     <button
                        onClick={() => setActiveTab('customers')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'customers'
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-content-muted hover:text-white hover:border-gray-500'
                        }`}
                    >
                        Customers
                    </button>
                     <button
                        onClick={() => setActiveTab('users')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'users'
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-content-muted hover:text-white hover:border-gray-500'
                        }`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('software')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'software'
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-content-muted hover:text-white hover:border-gray-500'
                        }`}
                    >
                        Software
                    </button>
                    <button
                        onClick={() => setActiveTab('coupons')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'coupons'
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-content-muted hover:text-white hover:border-gray-500'
                        }`}
                    >
                        Coupons
                    </button>
                    <button
                        onClick={() => setActiveTab('support')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'support'
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-content-muted hover:text-white hover:border-gray-500'
                        }`}
                    >
                        Support Tickets
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'reports'
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-content-muted hover:text-white hover:border-gray-500'
                        }`}
                    >
                        Reports
                    </button>
                </nav>
            </div>
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'customers' && <CustomerManagement />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'software' && <SoftwareManagement />}
            {activeTab === 'coupons' && <CouponManagement />}
            {activeTab === 'support' && <SupportPortal initialTicketId={initialTicketId} />}
            {activeTab === 'reports' && <ReportsPage />}
        </div>
    );
};

export default AdminPortal;