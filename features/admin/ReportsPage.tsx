import React, { useState, useEffect, useMemo } from 'react';
import { Subscription, Commission, Customer, Software, User, ProjectStatus, UserRole } from '../../types';
import { mockUsers, mockSoftware, mockCustomers, mockSubscriptions, mockCommissions } from '../../services/mockApiService';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

// --- Calendar Component for Subscriptions ---
const SubscriptionCalendar: React.FC<{
    subscriptions: Subscription[];
    customers: Customer[];
    software: Software[];
}> = ({ subscriptions, customers, software }) => {
    const [viewDate, setViewDate] = useState(new Date());

    const eventsByDate = useMemo(() => {
        const events = new Map<string, { type: 'start' | 'renewal', customerName: string, softwareName: string, id: string }[]>();
        subscriptions.forEach(sub => {
            const customer = customers.find(c => c.id === sub.customerId);
            const sw = software.find(s => s.id === sub.softwareId);

            if (customer && sw) {
                // Helper to add event to map
                const addEvent = (dateStr: string, type: 'start' | 'renewal') => {
                    const date = new Date(dateStr);
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    
                    if (!events.has(key)) events.set(key, []);
                    events.get(key)!.push({
                        type,
                        customerName: customer.name,
                        softwareName: sw.name,
                        id: `${sub.id}-${type}`
                    });
                };
                
                addEvent(sub.startDate, 'start');
                addEvent(sub.nextRenewalDate, 'renewal');
            }
        });
        return events;
    }, [subscriptions, customers, software]);

    const { monthDays, startingDayIndex } = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        const daysInMonth = lastDayOfMonth.getDate();
        const startingDayIndex = firstDayOfMonth.getDay(); // 0 for Sunday

        const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
        
        return { monthDays: days, startingDayIndex };
    }, [viewDate]);

    const goToPrevMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const goToNextMonth = () => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-base-300 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <button onClick={goToPrevMonth} className="p-2 rounded-full hover:bg-base-100 transition-colors">&larr;</button>
                <h3 className="text-xl font-bold text-white">
                    {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-base-100 transition-colors">&rarr;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-content-muted">
                {weekdays.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array(startingDayIndex).fill(null).map((_, i) => <div key={`empty-${i}`} className="h-24"></div>)}
                {monthDays.map(day => {
                    const dayKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                    const dayEvents = eventsByDate.get(dayKey) || [];
                    const isToday = new Date().toDateString() === day.toDateString();
                    return (
                        <div key={day.toISOString()} className={`h-24 p-1 border border-base-100 rounded-md overflow-y-auto ${isToday ? 'bg-brand-primary/20' : ''}`}>
                            <span className={`font-semibold ${isToday ? 'text-brand-primary' : 'text-white'}`}>{day.getDate()}</span>
                             <div className="mt-1 space-y-1">
                                {dayEvents.map(event => (
                                    <div 
                                        key={event.id}
                                        title={`Customer: ${event.customerName}\nSoftware: ${event.softwareName}`}
                                        className={`p-1 rounded text-xs flex items-center cursor-pointer ${event.type === 'start' ? 'bg-green-900/50' : 'bg-blue-900/50'}`}
                                    >
                                        <span className="mr-1">{event.type === 'start' ? '🚀' : '🔄'}</span>
                                        <span className="truncate">{event.customerName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};


const ReportsPage: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [software, setSoftware] = useState<Software[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // View state for subscriptions report
    const [subscriptionView, setSubscriptionView] = useState<'table' | 'calendar'>('table');

    // Filters for Subscriptions
    const [subSearch, setSubSearch] = useState('');
    const [subStatus, setSubStatus] = useState<ProjectStatus | 'ALL'>('ALL');
    const [subStartDate, setSubStartDate] = useState('');
    const [subEndDate, setSubEndDate] = useState('');

    // Filters for Commissions
    const [comSearch, setComSearch] = useState('');
    const [comUser, setComUser] = useState<string>('ALL');
    const [comStartDate, setComStartDate] = useState('');
    const [comEndDate, setComEndDate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // In a real app, these would be separate API calls.
            // Using mocks directly for simplicity.
            setSubscriptions(mockSubscriptions);
            setCommissions(mockCommissions);
            setCustomers(mockCustomers);
            setSoftware(mockSoftware);
            setUsers(mockUsers);
            setLoading(false);
        };
        fetchData();
    }, []);

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
            const user = users.find(u => u.id === com.userId);
            const customer = customers.find(c => c.id === com.customerId);
            const searchLower = comSearch.toLowerCase();

            const matchesSearch = !comSearch ||
                user?.name.toLowerCase().includes(searchLower) ||
                customer?.name.toLowerCase().includes(searchLower);
            
            const comDate = new Date(com.date);
            const matchesStartDate = !comStartDate || comDate >= new Date(comStartDate);
            const matchesEndDate = !comEndDate || comDate <= new Date(comEndDate);
            
            const matchesUser = comUser === 'ALL' || com.userId === comUser;

            return matchesSearch && matchesUser && matchesStartDate && matchesEndDate;
        });
    }, [commissions, users, customers, comSearch, comUser, comStartDate, comEndDate]);

    if (loading) {
        return <div className="p-8 text-center">Loading reports...</div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-4xl font-bold text-white">Reports</h1>
            
            {/* Subscriptions Report */}
            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Subscriptions Report</h2>
                    <div className="flex bg-base-300 p-1 rounded-lg">
                        <button 
                            onClick={() => setSubscriptionView('table')}
                            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${subscriptionView === 'table' ? 'bg-brand-primary text-white' : 'text-content-muted'}`}
                        >
                            Table View
                        </button>
                         <button 
                            onClick={() => setSubscriptionView('calendar')}
                            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${subscriptionView === 'calendar' ? 'bg-brand-primary text-white' : 'text-content-muted'}`}
                        >
                            Calendar View
                        </button>
                    </div>
                </div>

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
                 {subscriptionView === 'table' ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-content">
                            {/* table header */}
                            <thead className="text-xs text-content-muted uppercase bg-base-300">
                                <tr>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Software</th>
                                    <th className="px-6 py-3">Plan</th>
                                    <th className="px-6 py-3">Start Date</th>
                                    <th className="px-6 py-3">Next Billing Date</th>
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
                                        <td className="px-6 py-4">{new Date(sub.nextBillingDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{sub.status}</td>
                                        <td className="px-6 py-4">{formatCurrency(sub.renewalAmount)}</td>
                                    </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                     <SubscriptionCalendar
                        subscriptions={filteredSubscriptions}
                        customers={customers}
                        software={software}
                    />
                )}
            </div>

            {/* Commissions Report */}
            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Commissions Report</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-base-300 rounded-lg">
                     <input
                        type="text"
                        placeholder="Search by user or customer..."
                        value={comSearch}
                        onChange={e => setComSearch(e.target.value)}
                        className="bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    />
                    <select
                        value={comUser}
                        onChange={e => setComUser(e.target.value)}
                        className="bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    >
                        <option value="ALL">All Sales Users</option>
                        {users.filter(u => u.role === UserRole.USER).map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
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
                                <th className="px-6 py-3">Sales User</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Amount</th>
                            </tr>
                        </thead>
                         <tbody>
                            {filteredCommissions.map(com => {
                                const user = users.find(u => u.id === com.userId);
                                const customer = customers.find(c => c.id === com.customerId);
                                return (
                                <tr key={com.id} className="bg-base-200 border-b border-base-300 hover:bg-base-300">
                                    <td className="px-6 py-4">{new Date(com.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-white">{user?.name}</td>
                                    <td className="px-6 py-4">{customer?.name}</td>
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

export default ReportsPage;