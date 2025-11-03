import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Subscription, Commission, Customer, Software, ProjectStatus } from '../../types';
import { api, mockSubscriptions } from '../../services/mockApiService';
import { AuthContext } from '../../App';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

const UserReportsPage: React.FC = () => {
    const { user } = useContext(AuthContext);

    // Data state
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [software, setSoftware] = useState<Software[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters for Subscriptions
    const [subSearch, setSubSearch] = useState('');
    const [subStatus, setSubStatus] = useState<ProjectStatus | 'ALL'>('ALL');
    const [subStartDate, setSubStartDate] = useState('');
    const [subEndDate, setSubEndDate] = useState('');

    // Filters for Commissions
    const [comSearch, setComSearch] = useState('');
    const [comStartDate, setComStartDate] = useState('');
    const [comEndDate, setComEndDate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);

            const assignedCustomers = await api.getCustomersForUser(user.id);
            const allSoftware = await api.getAllSoftware();
            const userCommissions = await api.getCommissionsForUser(user.id);
            
            const assignedCustomerIds = assignedCustomers.map(c => c.id);
            const userSubscriptions = mockSubscriptions.filter(sub => assignedCustomerIds.includes(sub.customerId));

            setSubscriptions(userSubscriptions);
            setCommissions(userCommissions);
            setCustomers(assignedCustomers);
            setSoftware(allSoftware);
            setLoading(false);
        };
        fetchData();
    }, [user]);

    const filteredSubscriptions = useMemo(() => {
        return subscriptions.filter(sub => {
            const customer = customers.find(c => c.id === sub.customerId);
            const sw = software.find(s => s.id === sub.softwareId);
            const searchLower = subSearch.toLowerCase();

            const matchesSearch = !subSearch ||
                customer?.name.toLowerCase().includes(searchLower) ||
                sw?.name.toLowerCase().includes(searchLower);

            const matchesStatus = subStatus === 'ALL' || sub.status === subStatus;

            const subDate = new Date(sub.startDate);
            const matchesStartDate = !subStartDate || subDate >= new Date(subStartDate);
            const matchesEndDate = !subEndDate || subDate <= new Date(subEndDate);
            
            return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
        });
    }, [subscriptions, customers, software, subSearch, subStatus, subStartDate, subEndDate]);

    const filteredCommissions = useMemo(() => {
        return commissions.filter(com => {
            const customer = customers.find(c => c.id === com.customerId);
            const searchLower = comSearch.toLowerCase();

            const matchesSearch = !comSearch || customer?.name.toLowerCase().includes(searchLower);
            
            const comDate = new Date(com.date);
            const matchesStartDate = !comStartDate || comDate >= new Date(comStartDate);
            const matchesEndDate = !comEndDate || comDate <= new Date(comEndDate);

            return matchesSearch && matchesStartDate && matchesEndDate;
        });
    }, [commissions, customers, comSearch, comStartDate, comEndDate]);

    if (loading) {
        return <div className="p-8 text-center">Loading reports...</div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-4xl font-bold text-white">My Reports</h1>
            
            {/* Subscriptions Report */}
            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">My Customers' Subscriptions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-base-300 rounded-lg">
                    <input
                        type="text"
                        placeholder="Search by customer or software..."
                        value={subSearch}
                        onChange={e => setSubSearch(e.target.value)}
                        className="bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    />
                    <select
                        value={subStatus}
                        onChange={e => setSubStatus(e.target.value as ProjectStatus | 'ALL')}
                        className="bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    >
                        <option value="ALL">All Statuses</option>
                        {Object.values(ProjectStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={subStartDate}
                        onChange={e => setSubStartDate(e.target.value)}
                         className="bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    />
                     <input
                        type="date"
                        value={subEndDate}
                        onChange={e => setSubEndDate(e.target.value)}
                         className="bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-content">
                        <thead className="text-xs text-content-muted uppercase bg-base-300">
                            <tr>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Software</th>
                                <th className="px-6 py-3">Plan</th>
                                <th className="px-6 py-3">Start Date</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Renewal Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubscriptions.map(sub => {
                                const customer = customers.find(c => c.id === sub.customerId);
                                const sw = software.find(s => s.id === sub.softwareId);
                                return (
                                <tr key={sub.id} className="bg-base-200 border-b border-base-300 hover:bg-base-300">
                                    <td className="px-6 py-4 font-medium text-white">{customer?.name}</td>
                                    <td className="px-6 py-4">{sw?.name}</td>
                                    <td className="px-6 py-4">{sub.plan}</td>
                                    <td className="px-6 py-4">{new Date(sub.startDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{sub.status}</td>
                                    <td className="px-6 py-4">{formatCurrency(sub.renewalAmount)}</td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Commissions Report */}
            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">My Commissions Report</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 p-4 bg-base-300 rounded-lg">
                     <input
                        type="text"
                        placeholder="Search by customer..."
                        value={comSearch}
                        onChange={e => setComSearch(e.target.value)}
                        className="bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    />
                    <input
                        type="date"
                        value={comStartDate}
                        onChange={e => setComStartDate(e.target.value)}
                        className="bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    />
                     <input
                        type="date"
                        value={comEndDate}
                        onChange={e => setComEndDate(e.target.value)}
                        className="bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-content">
                        <thead className="text-xs text-content-muted uppercase bg-base-300">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Amount</th>
                            </tr>
                        </thead>
                         <tbody>
                            {filteredCommissions.map(com => {
                                const customer = customers.find(c => c.id === com.customerId);
                                return (
                                <tr key={com.id} className="bg-base-200 border-b border-base-300 hover:bg-base-300">
                                    <td className="px-6 py-4">{new Date(com.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-white">{customer?.name}</td>
                                    <td className="px-6 py-4 font-semibold text-green-400">{formatCurrency(com.amount)}</td>
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

export default UserReportsPage;
