import React, { useState } from 'react';
import { UserRole } from '../../types';

interface AddUserFormProps {
    onSave: (userData: { name: string; email: string; role: UserRole; }) => void;
    onCancel: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.USER);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password) {
            setError('Please fill out all fields.');
            return;
        }

        // In a real app, password would have more complex validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        onSave({ name, email, role });
    };

    return (
        <div className="bg-base-200 p-6 md:p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Add New User</h1>
            
            {error && <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-content-muted mb-1">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-content-muted mb-1">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" required />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-content-muted mb-1">Initial Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-content-muted mb-1">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                        >
                            {Object.values(UserRole).map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                    <button type="button" onClick={onCancel} className="bg-base-300 text-white font-bold py-2 px-6 rounded-lg hover:bg-base-100 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-secondary transition-colors">
                        Save User
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddUserForm;
