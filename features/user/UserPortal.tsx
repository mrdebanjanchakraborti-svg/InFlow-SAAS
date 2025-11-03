import React, { useState, useEffect, useContext } from 'react';
import { Customer, Subscription, Commission, Software, ProjectStatus } from '../../types';
import { api, mockSubscriptions, mockSoftware } from '../../services/mockApiService';
import { AuthContext } from '../../App';
import SupportPortal from '../support/SupportPortal';
import UserReportsPage from './UserReportsPage';
import ReferralProgramPage from './ReferralProgramPage';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.REVIEW: return 'bg-yellow-900 text-yellow-300';
        case ProjectStatus.PENDING: return 'bg-orange-900 text-orange-300';
        case ProjectStatus.TRAINING: return 'bg-blue-900 text-blue-300';
        case ProjectStatus.COMPLETE: return 'bg-green-900 text-green-300';
        default: return 'bg-gray-700 text-gray-300';
    }
};

const StatCard: React.FC<{ title: string; value: string; icon: string }> = ({ title, value, icon }) => (
    <div className="bg-base-300 p-6 rounded-lg shadow-lg flex items-center space-x-4">
        <div className="bg-base-200 p-3 rounded-full">
            <span className="text-2xl">{icon}</span>
        </div>
        <div>
            <p className="text-content-muted text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const UserDashboard: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [assignedCustomers, setAssignedCustomers] = useState<Customer[]>([]);
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            const [customers, comms] = await Promise.all([
                api.getCustomersForUser(user.id),
                api.getCommissionsForUser(user.id)
            ]);
            setAssignedCustomers(customers);
            setCommissions(comms);
            setLoading(false);
        };
        fetchData();
    }, [user]);

    const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0);

    const copyReferralLink = () => {
        if (user?.referralLink) {
            navigator.clipboard.writeText(user.referralLink);
            alert('Referral link copied to clipboard!');
        }
    };
    
    // In a real app we would get this data from the API
    const getCustomerDetails = (customerId: string) => {
        const sub = mockSubscriptions.find(s => s.customerId === customerId);
        return {
            nextRenewalDate: sub?.nextRenewalDate || 'N/A',
            renewalAmount: sub?.renewalAmount || 0,
            status: sub?.status || 'N/A'
        };
    };

    if (loading) {
        return <div className="p-8 text-center">Loading your dashboard...</div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-8 bg-base-100 min-h-full">
            <header>
                <h1 className="text-4xl font-bold text-white">Sales Dashboard</h1>
                <p className="text-content-muted mt-1">Welcome, {user?.name}!</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Assigned Customers" value={String(assignedCustomers.length)} icon="👥" />
                <StatCard title="Total Commission Earned" value={formatCurrency(totalCommission)} icon="💰" />
                <div className="bg-base-300 p-6 rounded-lg shadow-lg">
                    <p className="text-content-muted text-sm">Your Referral Link</p>
                    <div className="flex items-center space-x-2 mt-2">
                        <input type="text" readOnly value={user?.referralLink || ''} className="w-full bg-base-200 text-content p-2 rounded-md text-sm" />
                        <button onClick={copyReferralLink} className="bg-brand-primary p-2 rounded-md hover:bg-brand-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-base-300 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Assigned Customer Details</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-content">
                        <thead className="text-xs text-content-muted uppercase bg-base-200">
                            <tr>
                                <th scope="col" className="px-6 py-3">Customer Name</th>
                                <th scope="col" className="px-6 py-3">Sign-up Date</th>
                                <th scope="col" className="px-6 py-3">Next Renewal</th>
                                <th scope="col" className="px-6 py-3">Renewal Amount</th>
                                <th scope="col" className="px-6 py-3">Project Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedCustomers.map(customer => {
                                const details = getCustomerDetails(customer.id);
                                return (
                                <tr key={customer.id} className="bg-base-300 border-b border-base-200 hover:bg-base-100">
                                    <td className="px-6 py-4 font-medium text-white">{customer.name}</td>
                                    <td className="px-6 py-4">{new Date(customer.signupDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{new Date(details.nextRenewalDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{formatCurrency(details.renewalAmount)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(details.status as ProjectStatus)}`}>{details.status}</span>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
            
             <div className="bg-base-300 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Commission Report</h2>
                 <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-content">
                        <thead className="text-xs text-content-muted uppercase bg-base-200">
                             <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Customer Name</th>
                                <th scope="col" className="px-6 py-3">Commission Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                           {commissions.map(commission => {
                               const customer = assignedCustomers.find(c => c.id === commission.customerId);
                               return (
                                <tr key={commission.id} className="bg-base-300 border-b border-base-200 hover:bg-base-100">
                                    <td className="px-6 py-4">{new Date(commission.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-white">{customer?.name}</td>
                                    <td className="px-6 py-4 font-semibold text-green-400">{formatCurrency(commission.amount)}</td>
                                </tr>
                           )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

interface UserPortalProps {
    deepLink: { target: string; ticketId: string; } | null;
    clearDeepLink: () => void;
}

const UserPortal: React.FC<UserPortalProps> = ({ deepLink, clearDeepLink }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'support' | 'reports' | 'referral'>('dashboard');
    const [initialTicketId, setInitialTicketId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (deepLink?.target === 'support' && deepLink.ticketId) {
            setActiveTab('support');
            setInitialTicketId(deepLink.ticketId);
            clearDeepLink();
        }
    }, [deepLink, clearDeepLink]);

    return (
        <div className="bg-base-200 min-h-full">
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
                        onClick={() => setActiveTab('referral')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'referral'
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-content-muted hover:text-white hover:border-gray-500'
                        }`}
                    >
                        Referral Program
                    </button>
                    <button
                        onClick={() => setActiveTab('support')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'support'
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-content-muted hover:text-white hover:border-gray-500'
                        }`}
                    >
                        Support
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

            {activeTab === 'dashboard' && <UserDashboard />}
            {activeTab === 'referral' && <ReferralProgramPage />}
            {activeTab === 'support' && <SupportPortal initialTicketId={initialTicketId} />}
            {activeTab === 'reports' && <UserReportsPage />}
        </div>
    );
};

export default UserPortal;