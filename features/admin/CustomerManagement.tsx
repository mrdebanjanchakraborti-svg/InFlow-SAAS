import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Customer, User, UserRole } from '../../types';
import { api } from '../../services/mockApiService';

const CustomerManagement: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [customerData, userData] = await Promise.all([
            api.getAllCustomers(),
            api.getAllUsers()
        ]);
        setCustomers(customerData);
        setUsers(userData);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleReassignCustomer = async (customerId: string, newUserId: string) => {
        const customer = customers.find(c => c.id === customerId);
        if (!customer) return;

        const originalUserId = customer.assignedToUserId;
        if (newUserId === (originalUserId || '')) return; // No actual change

        // Temporarily hold the original state to revert to, in case of failure or cancellation.
        const originalCustomers = customers;

        // Optimistically update the UI
        setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, assignedToUserId: newUserId || undefined } : c));

        const customerName = customer.name;
        const newUserName = users.find(u => u.id === newUserId)?.name || '"Unassigned"';

        if (window.confirm(`Are you sure you want to assign customer "${customerName}" to ${newUserName}?`)) {
            const result = await api.reassignCustomer(customerId, newUserId || undefined);
            if (!result.success) {
                alert(result.message);
                // Revert on failure
                setCustomers(originalCustomers);
            }
            // On success, the optimistic update is now confirmed.
        } else {
            // Revert on cancel
            setCustomers(originalCustomers);
        }
    };
    
    const handleContactChange = (customerId: string, field: 'mobile' | 'whatsapp', value: string) => {
        setCustomers(prev => prev.map(c => 
            c.id === customerId ? { ...c, [field]: value } : c
        ));
    };

    const handleContactSave = async (customerId: string, field: 'mobile' | 'whatsapp', value: string) => {
        await api.updateCustomerDetails(customerId, { [field]: value });
        // Could add success/error feedback, but for now optimistic update is sufficient.
    };

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.company.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm]);

    if (loading) {
        return <div className="p-8 text-center">Loading customer data...</div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-4xl font-bold text-white">Customer Management</h1>
            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by customer name or company..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/3 bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-content">
                        <thead className="text-xs text-content-muted uppercase bg-base-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Mobile</th>
                                <th scope="col" className="px-6 py-3">WhatsApp</th>
                                <th scope="col" className="px-6 py-3">Location</th>
                                <th scope="col" className="px-6 py-3">Assigned User</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id} className="bg-base-200 border-b border-base-300 hover:bg-base-300">
                                    <td className="px-6 py-4 align-top">
                                        <p className="font-medium text-white">{customer.name}</p>
                                        <p className="text-xs text-content-muted">{customer.company}</p>
                                         <p className="text-xs text-content-muted">ID: {customer.id}</p>
                                    </td>
                                     <td className="px-6 py-4 align-top">
                                        <p>{customer.email}</p>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <input
                                            type="text"
                                            value={customer.mobile || ''}
                                            onChange={(e) => handleContactChange(customer.id, 'mobile', e.target.value)}
                                            onBlur={(e) => handleContactSave(customer.id, 'mobile', e.target.value)}
                                            className="bg-base-300 text-white p-1 rounded-md border border-base-300 focus:ring-1 focus:ring-brand-primary focus:outline-none w-full"
                                            placeholder="N/A"
                                        />
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <input
                                            type="text"
                                            value={customer.whatsapp || ''}
                                            onChange={(e) => handleContactChange(customer.id, 'whatsapp', e.target.value)}
                                            onBlur={(e) => handleContactSave(customer.id, 'whatsapp', e.target.value)}
                                            className="bg-base-300 text-white p-1 rounded-md border border-base-300 focus:ring-1 focus:ring-brand-primary focus:outline-none w-full"
                                            placeholder="N/A"
                                        />
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <p>{customer.city || 'N/A'}, {customer.state || 'N/A'}</p>
                                        <p>PIN: {customer.pin || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                       <select
                                            value={customer.assignedToUserId || ''}
                                            onChange={(e) => handleReassignCustomer(customer.id, e.target.value)}
                                            className="bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none w-full max-w-xs"
                                        >
                                            <option value="">-- Unassigned --</option>
                                            {users.filter(u => u.role === UserRole.USER).map(user => (
                                                <option key={user.id} value={user.id}>{user.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerManagement;