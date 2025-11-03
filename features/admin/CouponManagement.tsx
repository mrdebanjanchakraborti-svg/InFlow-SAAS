import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DiscountCoupon, Software, DiscountType } from '../../types';
import { api } from '../../services/mockApiService';
import AddCouponForm from './AddCouponForm';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const CouponManagement: React.FC = () => {
    const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
    const [softwareList, setSoftwareList] = useState<Software[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
    const [selectedCoupon, setSelectedCoupon] = useState<DiscountCoupon | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        const [couponsData, softwareData] = await Promise.all([
            api.getAllCoupons(),
            api.getAllSoftware()
        ]);
        setCoupons(couponsData);
        setSoftwareList(softwareData);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);
    
    const filteredCoupons = useMemo(() => {
        return coupons.filter(coupon => {
            const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && coupon.isActive) || (statusFilter === 'INACTIVE' && !coupon.isActive);
            return matchesSearch && matchesStatus;
        });
    }, [coupons, searchTerm, statusFilter]);

    const handleToggleStatus = async (coupon: DiscountCoupon) => {
        await api.updateCoupon(coupon.id, { isActive: !coupon.isActive });
        fetchCoupons(); // Re-fetch to update the list
    };

    const handleDelete = async (couponId: string) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            await api.deleteCoupon(couponId);
            fetchCoupons();
        }
    };
    
    const handleSave = async (couponData: Omit<DiscountCoupon, 'id'> | DiscountCoupon) => {
        if ('id' in couponData) {
            await api.updateCoupon(couponData.id, couponData);
        } else {
            await api.addCoupon(couponData);
        }
        setView('list');
        setSelectedCoupon(null);
        fetchCoupons();
    };

    const handleEditClick = (coupon: DiscountCoupon) => {
        setSelectedCoupon(coupon);
        setView('edit');
    };

    if (loading) {
        return <div className="p-8 text-center">Loading coupons...</div>;
    }
    
    if (view === 'add' || view === 'edit') {
        return (
            <div className="p-4 md:p-8">
                <AddCouponForm 
                    onSave={handleSave} 
                    onCancel={() => { setView('list'); setSelectedCoupon(null); }} 
                    initialData={selectedCoupon}
                    softwareList={softwareList}
                />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
             <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-white">Coupon Management</h1>
                <button
                    onClick={() => setView('add')}
                    className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors"
                >
                    + Add New Coupon
                </button>
            </div>

            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <div className="mb-4 flex flex-wrap gap-4">
                     <input
                        type="text"
                        placeholder="Search by coupon code..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-grow md:flex-grow-0 md:w-1/3 bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    />
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
                        className="bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-content">
                        <thead className="text-xs text-content-muted uppercase bg-base-300">
                             <tr>
                                <th scope="col" className="px-6 py-3">Code</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">Value</th>
                                <th scope="col" className="px-6 py-3">Validity</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                           {filteredCoupons.map(coupon => (
                                <tr key={coupon.id} className="bg-base-200 border-b border-base-300 hover:bg-base-300">
                                    <td className="px-6 py-4 font-medium text-white">{coupon.code}</td>
                                    <td className="px-6 py-4">{coupon.discountType}</td>
                                    <td className="px-6 py-4">
                                        {coupon.discountType === DiscountType.PERCENTAGE ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)}
                                    </td>
                                    <td className="px-6 py-4">{new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                         <span className={`px-2 py-1 text-xs font-medium rounded-full ${coupon.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-4">
                                        <button onClick={() => handleEditClick(coupon)} className="text-blue-400 hover:underline">Edit</button>
                                        <button onClick={() => handleToggleStatus(coupon)} className="text-yellow-400 hover:underline">
                                            {coupon.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button onClick={() => handleDelete(coupon.id)} className="text-red-400 hover:underline">Delete</button>
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

export default CouponManagement;