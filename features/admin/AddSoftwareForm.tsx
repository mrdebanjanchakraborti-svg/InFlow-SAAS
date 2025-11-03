import React, { useState } from 'react';
import { Software, SubscriptionPlan } from '../../types';

interface AddSoftwareFormProps {
    onSave: (softwareData: Omit<Software, 'id' | 'targetIndustries'>) => void;
    onCancel: () => void;
}

const AddSoftwareForm: React.FC<AddSoftwareFormProps> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [demoVideoUrl, setDemoVideoUrl] = useState('');
    const [features, setFeatures] = useState<string[]>(['']);
    const [monthlyPrice, setMonthlyPrice] = useState('');
    const [quarterlyPrice, setQuarterlyPrice] = useState('');
    const [yearlyPrice, setYearlyPrice] = useState('');
    const [setupFee, setSetupFee] = useState('');
    const [error, setError] = useState('');

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };

    const handleAddFeature = () => {
        setFeatures([...features, '']);
    };

    const handleRemoveFeature = (index: number) => {
        if (features.length > 1) {
            setFeatures(features.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !description || !category || !monthlyPrice || !quarterlyPrice || !yearlyPrice || !setupFee) {
            setError('Please fill out all fields.');
            return;
        }
        
        const softwareData = {
            name,
            description,
            category,
            demoVideoUrl,
            features: features.filter(f => f.trim() !== ''),
            pricing: {
                [SubscriptionPlan.MONTHLY]: parseFloat(monthlyPrice),
                [SubscriptionPlan.QUARTERLY]: parseFloat(quarterlyPrice),
                [SubscriptionPlan.YEARLY]: parseFloat(yearlyPrice),
            },
            setupFee: parseFloat(setupFee),
        };

        onSave(softwareData);
    };

    return (
        <div className="bg-base-200 p-6 md:p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Add New Software</h1>
            
            {error && <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-content-muted mb-1">Software Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-content-muted mb-1">Category</label>
                        <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-content-muted mb-1">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                </div>

                 <div>
                    <label className="block text-sm font-medium text-content-muted mb-1">Demo Video URL (YouTube or Vimeo)</label>
                    <input type="url" value={demoVideoUrl} onChange={e => setDemoVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-content-muted mb-1">Features</label>
                    <div className="space-y-2">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={feature}
                                    onChange={e => handleFeatureChange(index, e.target.value)}
                                    className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFeature(index)}
                                    className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
                                    disabled={features.length <= 1}
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={handleAddFeature} className="mt-2 text-sm text-brand-primary hover:underline">
                        + Add another feature
                    </button>
                </div>
                
                <div className="border-t border-base-300 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-content-muted mb-1">Monthly (₹)</label>
                            <input type="number" value={monthlyPrice} onChange={e => setMonthlyPrice(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-content-muted mb-1">Quarterly (₹)</label>
                            <input type="number" value={quarterlyPrice} onChange={e => setQuarterlyPrice(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-content-muted mb-1">Yearly (₹)</label>
                            <input type="number" value={yearlyPrice} onChange={e => setYearlyPrice(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-content-muted mb-1">Setup Fee (₹)</label>
                            <input type="number" value={setupFee} onChange={e => setSetupFee(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                    <button type="button" onClick={onCancel} className="bg-base-300 text-white font-bold py-2 px-6 rounded-lg hover:bg-base-100 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-secondary transition-colors">
                        Save Software
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddSoftwareForm;