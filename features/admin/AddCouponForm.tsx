import React, { useState, useEffect } from 'react';
import { DiscountCoupon, DiscountType, Software } from '../../types';

interface AddCouponFormProps {
    onSave: (couponData: Omit<DiscountCoupon, 'id'> | DiscountCoupon) => void;
    onCancel: () => void;
    initialData?: DiscountCoupon | null;
    softwareList: Software[];
}

const AddCouponForm: React.FC<AddCouponFormProps> = ({ onSave, onCancel, initialData, softwareList }) => {
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState<DiscountType>(DiscountType.PERCENTAGE);
    const [discountValue, setDiscountValue] = useState('');
    const [validFrom, setValidFrom] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [applicableSoftwareIds, setApplicableSoftwareIds] = useState<string[]>([]);
    const [appliesToAll, setAppliesToAll] = useState(true);

    useEffect(() => {
        if (initialData) {
            setCode(initialData.code);
            setDiscountType(initialData.discountType);
            setDiscountValue(String(initialData.discountValue));
            setValidFrom(initialData.validFrom);
            setValidUntil(initialData.validUntil);
            setIsActive(initialData.isActive);
            if (initialData.applicableSoftwareIds.length > 0) {
                setAppliesToAll(false);
                setApplicableSoftwareIds(initialData.applicableSoftwareIds);
            } else {
                setAppliesToAll(true);
                setApplicableSoftwareIds([]);
            }
        }
    }, [initialData]);
    
     useEffect(() => {
        if (appliesToAll) {
            setApplicableSoftwareIds([]);
        }
    }, [appliesToAll]);

    const handleSoftwareCheckboxChange = (softwareId: string) => {
        setApplicableSoftwareIds(prev =>
            prev.includes(softwareId)
                ? prev.filter(id => id !== softwareId)
                : [...prev, softwareId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple validation
        if (!code || !discountValue || !validFrom || !validUntil) {
            alert('Please fill all required fields');
            return;
        }

        const couponData = {
            code,
            discountType,
            discountValue: parseFloat(discountValue),
            validFrom,
            validUntil,
            isActive,
            applicableSoftwareIds: appliesToAll ? [] : applicableSoftwareIds,
        };

        if (initialData) {
            onSave({ ...couponData, id: initialData.id });
        } else {
            onSave(couponData);
        }
    };

    return (
        <div className="bg-base-200 p-6 md:p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">{initialData ? 'Edit' : 'Add New'} Coupon</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-content-muted mb-1">Coupon Code</label>
                        <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-content-muted mb-1">Status</label>
                        <label className="relative inline-flex items-center cursor-pointer mt-2">
                          <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-base-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                          <span className="ml-3 text-sm font-medium text-content">{isActive ? 'Active' : 'Inactive'}</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-content-muted mb-1">Discount Type</label>
                    <div className="flex bg-base-300 p-1 rounded-lg mt-1">
                        <button type="button" onClick={() => setDiscountType(DiscountType.PERCENTAGE)} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${discountType === DiscountType.PERCENTAGE ? 'bg-brand-primary text-white' : 'text-content-muted'}`}>Percentage (%)</button>
                        <button type="button" onClick={() => setDiscountType(DiscountType.FIXED_AMOUNT)} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${discountType === DiscountType.FIXED_AMOUNT ? 'bg-brand-primary text-white' : 'text-content-muted'}`}>Fixed Amount (₹)</button>
                    </div>
                </div>
                
                 <div>
                    <label className="block text-sm font-medium text-content-muted mb-1">Discount Value</label>
                    <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-content-muted mb-1">Valid From</label>
                        <input type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-content-muted mb-1">Valid Until</label>
                        <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                    </div>
                </div>

                <div className="border-t border-base-300 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Applicable Software</h3>
                    <div className="flex items-center mb-4">
                         <input id="all-software" type="checkbox" checked={appliesToAll} onChange={(e) => setAppliesToAll(e.target.checked)} className="w-4 h-4 text-brand-primary bg-gray-100 border-gray-300 rounded focus:ring-brand-secondary" />
                        <label htmlFor="all-software" className="ml-2 text-sm font-medium text-content">Apply to all software</label>
                    </div>

                    {!appliesToAll && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-base-300 rounded-md">
                            {softwareList.map(sw => (
                                <div key={sw.id} className="flex items-center">
                                    <input 
                                        id={`sw-${sw.id}`} 
                                        type="checkbox" 
                                        checked={applicableSoftwareIds.includes(sw.id)} 
                                        onChange={() => handleSoftwareCheckboxChange(sw.id)}
                                        className="w-4 h-4 text-brand-primary bg-gray-100 border-gray-300 rounded focus:ring-brand-secondary" 
                                    />
                                    <label htmlFor={`sw-${sw.id}`} className="ml-2 text-sm text-content">{sw.name}</label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                    <button type="button" onClick={onCancel} className="bg-base-300 text-white font-bold py-2 px-6 rounded-lg hover:bg-base-100 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-secondary transition-colors">
                        Save Coupon
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCouponForm;