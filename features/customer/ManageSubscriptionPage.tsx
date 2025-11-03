import React, { useState, useEffect, useCallback } from 'react';
import { Subscription, Software, SubscriptionPlan } from '../../types';
import { api } from '../../services/mockApiService';

interface SubscriptionWithSoftware extends Subscription {
    software: Software;
}

interface ManageSubscriptionPageProps {
    subscriptionId: string;
    onBack: () => void;
    onPlanChanged: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const ManageSubscriptionPage: React.FC<ManageSubscriptionPageProps> = ({ subscriptionId, onBack, onPlanChanged }) => {
    const [subscription, setSubscription] = useState<SubscriptionWithSoftware | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const sub = await api.getSubscriptionById(subscriptionId);
        if (sub) {
            const software = await api.getSoftware(sub.softwareId);
            if (software) {
                setSubscription({ ...sub, software });
                setSelectedPlan(sub.plan);
            }
        }
        setLoading(false);
    }, [subscriptionId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePlanChange = async () => {
        if (!selectedPlan || !subscription || selectedPlan === subscription.plan) return;
        
        if (window.confirm(`Are you sure you want to change your plan to ${selectedPlan}? The new price of ${formatCurrency(subscription.software.pricing[selectedPlan])} will be effective on your next renewal.`)) {
            setIsUpdating(true);
            const result = await api.changeSubscriptionPlan(subscriptionId, selectedPlan);
            if (result.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    onPlanChanged();
                }, 2000); // Show success message for 2 seconds then navigate back
            } else {
                alert(`Error: ${result.message}`);
            }
            setIsUpdating(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading subscription details...</div>;
    }

    if (!subscription) {
        return <div className="p-8 text-center text-red-400">Could not find subscription. <button onClick={onBack} className="underline">Go back</button></div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            {/* Success Animation Overlay */}
            {showSuccess && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
                    <div className="bg-base-200 p-8 rounded-full mb-4">
                        <svg className="w-24 h-24" viewBox="0 0 52 52">
                            <circle className="stroke-current text-green-600" cx="26" cy="26" r="25" fill="none" strokeWidth="4" style={{ strokeDasharray: 157, strokeDashoffset: 157, animation: 'draw-circle 0.5s ease-out forwards' }} />
                            <path className="stroke-current text-green-500" fill="none" strokeWidth="5" d="M14.1 27.2l7.1 7.2 16.7-16.8" style={{ strokeDasharray: 48, strokeDashoffset: 48, animation: 'draw-check 0.4s 0.5s ease-out forwards' }} />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Plan Updated Successfully!</h2>
                     <style>{`
                        @keyframes draw-circle { to { stroke-dashoffset: 0; } }
                        @keyframes draw-check { to { stroke-dashoffset: 0; } }
                    `}</style>
                 </div>
            )}
            <div>
                 <button onClick={onBack} className="text-sm text-brand-primary hover:underline mb-6">&larr; Back to Dashboard</button>
                 <h1 className="text-4xl font-bold text-white">Manage Subscription</h1>
                 <p className="text-content-muted mt-1">Software: {subscription.software.name}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-base-200 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-white mb-4">Current Plan</h2>
                    <div className="space-y-3 text-content">
                        <div className="flex justify-between items-center">
                            <span>Plan:</span>
                            <span className="font-bold text-white bg-brand-primary/50 px-2 py-1 rounded">{subscription.plan}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Next Renewal:</span>
                            <span className="font-bold text-white">{new Date(subscription.nextRenewalDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Renewal Amount:</span>
                            <span className="font-bold text-white">{formatCurrency(subscription.renewalAmount)}</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-base-200 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-white mb-4">Change Plan</h2>
                    <p className="text-sm text-content-muted mb-6">Your new plan will take effect on your next renewal date. You will not be charged today.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.values(SubscriptionPlan).map(plan => (
                            <button 
                                key={plan}
                                onClick={() => setSelectedPlan(plan)}
                                className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                                    selectedPlan === plan 
                                    ? 'bg-brand-primary border-brand-primary text-white scale-105 shadow-lg' 
                                    : 'bg-base-300 border-base-300 hover:border-brand-secondary'
                                }`}
                            >
                                <p className="font-bold text-lg">{plan}</p>
                                <p className="text-2xl font-extrabold mt-2">{formatCurrency(subscription.software.pricing[plan])}</p>
                                <p className="text-xs text-content-muted">per {plan.toLowerCase().replace('ly', '')}</p>
                                {subscription.plan === plan && <div className="mt-3 text-xs font-semibold bg-gray-500 text-white py-1 px-2 rounded-full">CURRENT PLAN</div>}
                            </button>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button 
                            onClick={handlePlanChange}
                            disabled={isUpdating || selectedPlan === subscription.plan}
                            className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? 'Updating...' : 'Confirm Plan Change'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageSubscriptionPage;
