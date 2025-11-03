
import React, { useState } from 'react';
import { api } from '../../services/mockApiService';

interface ResetPasswordPageProps {
    onSwitchToLogin: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // In a real app, a token would be read from the URL to identify the user.
    // For this simulation, we'll ask for the email again.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const result = await api.resetPassword({ email, newPassword: password });

        if (result.success) {
            setMessage(result.message);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
            <div className="w-full max-w-md bg-base-200 p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-white mb-6">Set New Password</h2>

                {error && <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-4 text-sm">{error}</div>}
                {message && <div className="bg-blue-900 border border-blue-700 text-blue-300 px-4 py-3 rounded-md mb-4 text-sm">{message}</div>}
                
                {!message && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-content-muted mb-1">Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-content-muted mb-1">New Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-content-muted mb-1">Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" required />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-brand-secondary transition-colors mt-2 disabled:opacity-50">
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <p className="text-center mt-6 text-sm text-content-muted">
                    <button onClick={onSwitchToLogin} className="font-semibold text-brand-primary hover:underline">
                        &larr; Back to Login
                    </button>
                </p>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
