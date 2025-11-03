import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Subscription, Software, ProjectStatus, Invoice } from '../../types';
import { api } from '../../services/mockApiService';
import { AuthContext } from '../../App';
import SupportPortal from '../support/SupportPortal';
import ManageSubscriptionPage from './ManageSubscriptionPage';


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

interface SubscriptionWithSoftware extends Subscription {
    software: Software;
}

const CustomerDashboard: React.FC<{ onManageClick: (subscriptionId: string) => void }> = ({ onManageClick }) => {
    const { user } = useContext(AuthContext);
    const [subscriptions, setSubscriptions] = useState<SubscriptionWithSoftware[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const customer = (await api.getAllCustomers()).find(c => c.email === user.email);
        if (!customer) {
            setLoading(false);
            return;
        }
        
        const subs = await api.getSubscriptionsForCustomer(customer.id);
        const subsWithSoftware: SubscriptionWithSoftware[] = [];
        for (const sub of subs) {
            const software = await api.getSoftware(sub.softwareId);
            if (software) {
                subsWithSoftware.push({ ...sub, software });
            }
        }
        setSubscriptions(subsWithSoftware.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePayNow = async (subscriptionId: string) => {
        const result = await api.makeRenewalPayment(subscriptionId);
        if (result.success) {
            setShowPaymentSuccess(true);
            setTimeout(() => setShowPaymentSuccess(false), 2000);
            fetchData(); // Refresh all data
        } else {
            alert(`Payment Failed: ${result.message}`);
        }
    };


    if (loading) {
        return <div className="p-8 text-center">Loading your dashboard...</div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
             {/* Payment Success Animation Overlay */}
            {showPaymentSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
                    <div className="bg-base-200 p-8 rounded-full mb-4">
                        <svg className="w-24 h-24" viewBox="0 0 52 52">
                            <circle className="stroke-current text-green-600" cx="26" cy="26" r="25" fill="none" strokeWidth="4" style={{ strokeDasharray: 157, strokeDashoffset: 157, animation: 'draw-circle 0.5s ease-out forwards' }} />
                            <path className="stroke-current text-green-500" fill="none" strokeWidth="5" d="M14.1 27.2l7.1 7.2 16.7-16.8" style={{ strokeDasharray: 48, strokeDashoffset: 48, animation: 'draw-check 0.4s 0.5s ease-out forwards' }} />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                    <style>{`
                        @keyframes draw-circle { to { stroke-dashoffset: 0; } }
                        @keyframes draw-check { to { stroke-dashoffset: 0; } }
                    `}</style>
                </div>
            )}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white">My Dashboard</h1>
                    <p className="text-content-muted mt-1">Welcome back, {user?.name}!</p>
                </div>
            </header>

            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">My Subscriptions</h2>
                {subscriptions.length > 0 ? (
                    <div className="space-y-4">
                        {subscriptions.map(sub => (
                            <div key={sub.id} className="bg-base-300 p-4 rounded-lg md:flex justify-between items-center space-y-4 md:space-y-0">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white">{sub.software.name} ({sub.plan})</h3>
                                    <p className="text-sm text-content-muted">{sub.software.description}</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="bg-base-200 p-3 rounded-lg text-center">
                                        <p className="text-content-muted">Renewal Date</p>
                                        <p className="font-semibold text-white mt-1">{new Date(sub.nextRenewalDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="bg-base-200 p-3 rounded-lg text-center">
                                        <p className="text-content-muted">Next Billing Date</p>
                                        <p className="font-semibold text-white mt-1">{new Date(sub.nextBillingDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="bg-base-200 p-3 rounded-lg text-center">
                                        <p className="text-content-muted">Renewal Amount</p>
                                        <p className="font-semibold text-white mt-1">{formatCurrency(sub.renewalAmount)}</p>
                                    </div>
                                    <div className="bg-base-200 p-3 rounded-lg text-center">
                                        <p className="text-content-muted">Status</p>
                                        <div className="flex justify-center items-center mt-1">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sub.status)}`}>{sub.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-2 md:pt-0 md:pl-4 flex items-center space-x-2">
                                     <button 
                                        onClick={() => handlePayNow(sub.id)}
                                        className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Pay Now
                                    </button>
                                     <button onClick={() => onManageClick(sub.id)} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors">Manage</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-content-muted">You have no active subscriptions.</p>
                )}
            </div>

             <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Key Dates</h2>
                 <div className="space-y-4">
                    {subscriptions.map(sub => (
                         <div key={sub.id} className="bg-base-300 p-4 rounded-lg flex items-center justify-between">
                             <p className="font-bold text-white">{sub.software.name}</p>
                             <div className="flex space-x-6 text-sm">
                                 <p><span className="text-content-muted">Onboarding:</span> {new Date(sub.onboardingDate).toLocaleDateString()}</p>
                                 <p><span className="text-content-muted">Training:</span> {new Date(sub.trainingDate).toLocaleDateString()}</p>
                             </div>
                         </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

const TransactionHistory: React.FC<{ refreshTrigger: any }> = ({ refreshTrigger }) => {
    const { user } = useContext(AuthContext);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInvoices = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const customer = (await api.getAllCustomers()).find(c => c.email === user.email);
        if (customer) {
            const customerInvoices = await api.getInvoicesForCustomer(customer.id);
            setInvoices(customerInvoices.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()));
        }
        setLoading(false);
    }, [user]);
    
    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices, refreshTrigger]);


    if (loading) {
        return <div className="p-8 text-center">Loading transaction history...</div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-4xl font-bold text-white">Transaction History</h1>
            <p className="text-content-muted mt-1">A record of all your past invoices and payments.</p>
            
            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-content">
                        <thead className="text-xs text-content-muted uppercase bg-base-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Invoice ID</th>
                                <th scope="col" className="px-6 py-3">Issue Date</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Payment Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length > 0 ? invoices.map(invoice => (
                                <tr key={invoice.id} className="bg-base-200 border-b border-base-300 hover:bg-base-300">
                                    <td className="px-6 py-4 font-medium text-white">{invoice.id.toUpperCase()}</td>
                                    <td className="px-6 py-4">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{formatCurrency(invoice.amount)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${invoice.paymentDate ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                            {invoice.paymentDate ? 'Paid' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-content-muted">No transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const CustomerPortal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'support' | 'transactions'>('dashboard');
    const [managingSubId, setManagingSubId] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to force-refresh transaction history

     const handlePlanChanged = () => {
        setManagingSubId(null);
        setActiveTab('dashboard'); // Go back to the dashboard
        setRefreshTrigger(t => t + 1); // Trigger a refresh
    };

    const renderContent = () => {
        if (managingSubId) {
            return <ManageSubscriptionPage subscriptionId={managingSubId} onBack={() => setManagingSubId(null)} onPlanChanged={handlePlanChanged} />;
        }

        switch (activeTab) {
            case 'dashboard':
                return <CustomerDashboard onManageClick={(id) => setManagingSubId(id)} />;
            case 'transactions':
                return <TransactionHistory refreshTrigger={refreshTrigger} />;
            case 'support':
                return <SupportPortal />;
            default:
                return <CustomerDashboard onManageClick={(id) => setManagingSubId(id)} />;
        }
    };
    
    return (
        <div>
            <div className="px-4 md:px-8 border-b border-base-300">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => { setActiveTab('dashboard'); setManagingSubId(null); }}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'dashboard' && !managingSubId
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-content-muted hover:text-white hover:border-gray-500'
                        }`}
                    >
                        Dashboard
                    </button>
                     <button
                        onClick={() => { setActiveTab('transactions'); setManagingSubId(null); }}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'transactions' && !managingSubId
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-content-muted hover:text-white hover:border-gray-500'
                        }`}
                    >
                        Transaction History
                    </button>
                    <button
                        onClick={() => { setActiveTab('support'); setManagingSubId(null); }}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'support' && !managingSubId
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-content-muted hover:text-white hover:border-gray-500'
                        }`}
                    >
                        Support Center
                    </button>
                </nav>
            </div>
            {renderContent()}
        </div>
    );
};

export default CustomerPortal;