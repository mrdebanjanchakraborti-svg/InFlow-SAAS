import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Software, Subscription, Customer, ProjectStatus, SubscriptionPlan } from '../../types';
import { api } from '../../services/mockApiService';
import AddSoftwareForm from './AddSoftwareForm';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
};


const SoftwareList: React.FC<{ onAddSoftwareClick: () => void, onViewSoftwareClick: (softwareId: string) => void }> = ({ onAddSoftwareClick, onViewSoftwareClick }) => {
    const [softwareList, setSoftwareList] = useState<Software[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [featureFilter, setFeatureFilter] = useState<string[]>([]);

    const fetchSoftware = useCallback(async () => {
        setLoading(true);
        const list = await api.getAllSoftware();
        setSoftwareList(list);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSoftware();
    }, [fetchSoftware]);

    const allFeatures = useMemo(() => {
        const featureSet = new Set<string>();
        softwareList.forEach(sw => sw.features.forEach(f => featureSet.add(f)));
        return Array.from(featureSet).sort();
    }, [softwareList]);

    const filteredAndGroupedSoftware = useMemo(() => {
        const filtered = softwareList.filter(sw => {
            const matchesSearch = sw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sw.category.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesFeatures = featureFilter.length === 0 || featureFilter.every(feature => sw.features.includes(feature));

            return matchesSearch && matchesFeatures;
        });

        return filtered.reduce((acc, sw) => {
            (acc[sw.category] = acc[sw.category] || []).push(sw);
            return acc;
        }, {} as { [key: string]: Software[] });

    }, [softwareList, searchTerm, featureFilter]);
    
    const handleFeatureFilterChange = (feature: string) => {
        setFeatureFilter(prev => 
            prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
        );
    };


    const handleDelete = async (softwareId: string) => {
        if (window.confirm('Are you sure you want to delete this software product?')) {
            const success = await api.deleteSoftware(softwareId);
            if (success) {
                await fetchSoftware(); // Re-fetch data to update UI
            } else {
                alert('Failed to delete the software.');
            }
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading software list...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-white">Software Management</h1>
                <button
                    onClick={onAddSoftwareClick}
                    className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors"
                >
                    + Add New Software
                </button>
            </div>
            
            <div className="bg-base-200 p-4 rounded-lg shadow-lg flex flex-wrap gap-4 items-center">
                 <input
                    type="text"
                    placeholder="Search by name or category..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-grow md:flex-grow-0 md:w-1/3 bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                />
                 <div className="relative">
                    <button
                        onClick={(e) => { e.currentTarget.nextElementSibling?.classList.toggle('hidden'); }}
                        className="bg-base-300 text-white p-2 rounded-md border border-base-300 hover:border-brand-primary"
                    >
                        Filter by Feature {featureFilter.length > 0 ? `(${featureFilter.length})` : ''}
                    </button>
                    <div className="absolute z-10 mt-2 w-72 bg-base-300 rounded-lg shadow-xl p-4 hidden border border-content-muted/20">
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                            {allFeatures.map(feature => (
                                <label key={feature} className="flex items-center space-x-2 text-sm cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={featureFilter.includes(feature)}
                                        onChange={() => handleFeatureFilterChange(feature)}
                                        className="w-4 h-4 text-brand-primary bg-base-100 border-base-100 rounded focus:ring-brand-secondary"
                                    />
                                    <span>{feature}</span>
                                </label>
                            ))}
                        </div>
                         {featureFilter.length > 0 && (
                            <button 
                                onClick={() => setFeatureFilter([])}
                                className="w-full mt-4 text-sm text-brand-primary hover:underline"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>


            {Object.entries(filteredAndGroupedSoftware).map(([category, softwareItems]) => (
                <div key={category} className="bg-base-200 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-white mb-4 border-b border-base-300 pb-2">{category}</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-content">
                            <thead className="text-xs text-content-muted uppercase bg-base-300">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Description</th>
                                    <th scope="col" className="px-6 py-3">Monthly Price</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* FIX: Add Array.isArray check to ensure softwareList is an array and help TypeScript with type inference. */}
                                {Array.isArray(softwareItems) && softwareItems.map(sw => (
                                    <tr key={sw.id} className="bg-base-200 border-b border-base-300 hover:bg-base-300">
                                        <td className="px-6 py-4 font-medium text-white">{sw.name}</td>
                                        <td className="px-6 py-4 max-w-sm">{sw.description}</td>
                                        <td className="px-6 py-4">{formatCurrency(sw.pricing.MONTHLY)}</td>
                                        <td className="px-6 py-4 space-x-4">
                                            <button onClick={() => onViewSoftwareClick(sw.id)} className="text-brand-primary hover:underline">View/Edit</button>
                                            <button onClick={() => handleDelete(sw.id)} className="text-red-500 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    )
}


const getVideoEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    let videoId: string | null = null;
    let embedUrl: string | null = null;

    // YouTube
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
        videoId = youtubeMatch[1];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    // Vimeo
    if (!embedUrl) {
        const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)/;
        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch && vimeoMatch[1]) {
            videoId = vimeoMatch[1];
            embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }
    }
    
    return embedUrl;
};

const SoftwareDetail: React.FC<{ softwareId: string; onBack: () => void }> = ({ softwareId, onBack }) => {
    const [software, setSoftware] = useState<Software | null>(null);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [swData, subsData, custData] = await Promise.all([
            api.getSoftware(softwareId),
            api.getSubscriptionsForSoftware(softwareId),
            api.getAllCustomers()
        ]);
        setSoftware(swData || null);
        setSubscriptions(subsData.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
        setCustomers(custData);
        setLoading(false);
    }, [softwareId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusChange = async (subscriptionId: string, newStatus: ProjectStatus) => {
        const originalSubscriptions = [...subscriptions];
        // Optimistic UI update
        setSubscriptions(prevSubs => prevSubs.map(s => s.id === subscriptionId ? { ...s, status: newStatus } : s));
        try {
            await api.updateSubscriptionDetails(subscriptionId, { status: newStatus });
            // Optionally re-fetch to confirm, but optimistic is often enough
            // await fetchData(); 
        } catch (error) {
            console.error("Failed to update status", error);
            setSubscriptions(originalSubscriptions); // Revert on failure
            alert("Failed to update status. Please try again.");
        }
    };

    const handleDateChange = async (subscriptionId: string, newDate: string) => {
        const updateValue = newDate || undefined;
        await api.updateSubscriptionDetails(subscriptionId, { nextActionDate: updateValue });
        // Optimistic update to avoid full re-fetch lag
        setSubscriptions(prevSubs => prevSubs.map(s => s.id === subscriptionId ? {...s, nextActionDate: updateValue} : s));
    };

    if (loading) {
        return <div className="p-8 text-center">Loading software details...</div>
    }

    if (!software) {
        return <div className="p-8 text-center text-red-400">Software not found. <button onClick={onBack} className="underline">Go back</button></div>
    }
    
    const embedUrl = getVideoEmbedUrl(software.demoVideoUrl);

    return (
        <div className="space-y-8">
            <div>
                 <button onClick={onBack} className="text-sm text-brand-primary hover:underline mb-6">&larr; Back to all software</button>
                 <h1 className="text-4xl font-bold text-white">{software.name}</h1>
                 <p className="text-lg text-content-muted mt-1">Category: {software.category}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="md:col-span-2 space-y-8">
                     <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-base-300 pb-2">Product Details</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-content-muted mb-2">Description</h3>
                                <p className="text-content">{software.description}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-content-muted mb-2">Key Features</h3>
                                <div className="flex flex-wrap gap-2">
                                    {software.features.map(feature => (
                                        <span key={feature} className="bg-base-300 text-content text-sm font-medium px-3 py-1 rounded-full">{feature}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-content-muted mb-2">Target Industries</h3>
                                <div className="flex flex-wrap gap-2">
                                    {software.targetIndustries.map(industry => (
                                        <span key={industry} className="bg-blue-900/50 text-blue-300 text-sm font-medium px-3 py-1 rounded-full">{industry}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {software.demoVideoUrl && (
                        <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-white mb-4">Demo Video</h2>
                            {embedUrl ? (
                                <div className="aspect-w-16 aspect-h-9">
                                    <iframe
                                        src={embedUrl}
                                        title={`${software.name} Demo Video`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="rounded-lg w-full h-full"
                                    ></iframe>
                                </div>
                            ) : (
                                <p className="text-content">
                                    <a href={software.demoVideoUrl} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">{software.demoVideoUrl}</a>
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Pricing */}
                <div className="md:col-span-1">
                    <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-base-300 pb-2">Pricing</h2>
                        <div className="space-y-4">
                            <div className="bg-base-300 p-4 rounded-lg">
                                <p className="text-content-muted">One-time Setup Fee</p>
                                <p className="text-2xl font-bold text-white">{formatCurrency(software.setupFee)}</p>
                            </div>
                             {Object.entries(software.pricing).map(([plan, price]) => (
                                <div key={plan} className="flex justify-between items-center bg-base-300 p-4 rounded-lg">
                                    <p className="font-semibold text-content capitalize">{plan.toLowerCase()}</p>
                                    {/* FIX: Cast price to number as Object.entries infers its type as 'unknown'. */}
                                    <p className="text-xl font-bold text-white">{formatCurrency(Number(price))}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
             <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Customer Subscriptions</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-content">
                        <thead className="text-xs text-content-muted uppercase bg-base-300">
                             <tr>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Plan</th>
                                <th className="px-6 py-3">Start Date</th>
                                <th className="px-6 py-3">Next Billing Date</th>
                                <th className="px-6 py-3">Project Status</th>
                                <th className="px-6 py-3">Next Action Date</th>
                            </tr>
                        </thead>
                        <tbody>
                           {subscriptions.map(sub => {
                                const customer = customers.find(c => c.id === sub.customerId);
                                return (
                                <tr key={sub.id} className="bg-base-200 border-b border-base-300 hover:bg-base-300">
                                    <td className="px-6 py-4 font-medium text-white">{customer?.name || 'Unknown Customer'}</td>
                                    <td className="px-6 py-4">{sub.plan}</td>
                                    <td className="px-6 py-4">{new Date(sub.startDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{new Date(sub.nextBillingDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={sub.status}
                                            onChange={(e) => handleStatusChange(sub.id, e.target.value as ProjectStatus)}
                                            className="bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                        >
                                            {Object.values(ProjectStatus).map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="date"
                                            value={sub.nextActionDate || ''}
                                            onChange={(e) => handleDateChange(sub.id, e.target.value)}
                                            className="bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                        />
                                    </td>
                                </tr>
                                )
                           })}
                        </tbody>
                    </table>
                     {subscriptions.length === 0 && <p className="text-center p-8 text-content-muted">No customers have subscribed to this software yet.</p>}
                </div>
            </div>
        </div>
    )
}


const SoftwareManagement: React.FC = () => {
    const [view, setView] = useState<'list' | 'add' | 'detail'>('list');
    const [selectedSoftwareId, setSelectedSoftwareId] = useState<string | null>(null);

    const handleSaveSoftware = async (softwareData: Omit<Software, 'id' | 'targetIndustries'>) => {
        await api.addSoftware(softwareData);
        setView('list'); // Switch back to the list, which will re-fetch
    };

    const handleViewSoftware = (softwareId: string) => {
        setSelectedSoftwareId(softwareId);
        setView('detail');
    };

    const handleBackToList = () => {
        setSelectedSoftwareId(null);
        setView('list');
    };

    return (
        <div className="p-4 md:p-8">
            {view === 'list' && (
                <SoftwareList onAddSoftwareClick={() => setView('add')} onViewSoftwareClick={handleViewSoftware} />
            )}
            {view === 'add' && (
                <AddSoftwareForm onSave={handleSaveSoftware} onCancel={handleBackToList} />
            )}
            {view === 'detail' && selectedSoftwareId && (
                <SoftwareDetail softwareId={selectedSoftwareId} onBack={handleBackToList} />
            )}
        </div>
    );
};

export default SoftwareManagement;