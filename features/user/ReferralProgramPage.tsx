import React, { useState, useEffect, useContext } from 'react';
import { Customer } from '../../types';
import { api } from '../../services/mockApiService';
import { AuthContext } from '../../App';

const ReferralProgramPage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [referredCustomers, setReferredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [copyButtonText, setCopyButtonText] = useState('Copy Link');

    useEffect(() => {
        const fetchReferredCustomers = async () => {
            if (!user) return;
            setLoading(true);
            const customers = await api.getReferredCustomersForUser(user.id);
            setReferredCustomers(customers);
            setLoading(false);
        };
        fetchReferredCustomers();
    }, [user]);

    const copyReferralLink = () => {
        if (user?.referralLink) {
            navigator.clipboard.writeText(user.referralLink);
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy Link'), 2000); // Reset after 2 seconds
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading referral data...</div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-8 bg-base-100 min-h-full">
            <header>
                <h1 className="text-4xl font-bold text-white">Referral Program</h1>
                <p className="text-content-muted mt-1">Earn commissions by referring new customers.</p>
            </header>

            <div className="bg-base-200 p-6 rounded-lg shadow-lg space-y-4">
                <h2 className="text-2xl font-bold text-white">How It Works</h2>
                <ul className="list-disc list-inside text-content space-y-2">
                    <li>Share your unique referral link with potential customers.</li>
                    <li>When a customer signs up using your link, they are automatically assigned to you.</li>
                    <li>You earn a <span className="font-bold text-green-400">20% commission</span> on their initial payment and every subsequent renewal payment.</li>
                    <li>Track all your referred customers and their sign-up dates right here on this page.</li>
                </ul>
            </div>

            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Your Unique Referral Link</h2>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        readOnly
                        value={user?.referralLink || 'No link available'}
                        className="w-full bg-base-300 text-content p-2 rounded-md border border-base-300"
                    />
                    <button
                        onClick={copyReferralLink}
                        className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors w-32"
                    >
                        {copyButtonText}
                    </button>
                </div>
            </div>

            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Your Referred Customers</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-content">
                        <thead className="text-xs text-content-muted uppercase bg-base-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Customer Name</th>
                                <th scope="col" className="px-6 py-3">Company</th>
                                <th scope="col" className="px-6 py-3">Sign-up Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {referredCustomers.length > 0 ? (
                                referredCustomers.map(customer => (
                                    <tr key={customer.id} className="bg-base-200 border-b border-base-300 hover:bg-base-300">
                                        <td className="px-6 py-4 font-medium text-white">{customer.name}</td>
                                        <td className="px-6 py-4">{customer.company}</td>
                                        <td className="px-6 py-4">{new Date(customer.signupDate).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center p-8 text-content-muted">You haven't referred any customers yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReferralProgramPage;