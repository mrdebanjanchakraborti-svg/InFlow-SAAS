import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { User, UserRole } from '../../types';
import { api } from '../../services/mockApiService';
import { AuthContext } from '../../App';
import AddUserForm from './AddUserForm';

const UserManagementList: React.FC<{onAddUserClick: () => void}> = ({onAddUserClick}) => {
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');


    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const userData = await api.getAllUsers();
        setUsers(userData);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        if (userId === currentUser?.id) {
            alert("For security reasons, you cannot change your own role.");
            return;
        }

        if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            const updatedUser = await api.updateUserRole(userId, newRole);
            if (updatedUser) {
                // Refresh the list to show the change
                fetchUsers();
            } else {
                alert("Failed to update user role.");
            }
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (roleFilter === 'ALL' || user.role === roleFilter)
        );
    }, [users, searchTerm, roleFilter]);

    if (loading) {
        return <div className="p-8 text-center">Loading user data...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-white">User Management</h1>
                 <button
                    onClick={onAddUserClick}
                    className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors"
                >
                    + Add New User
                </button>
            </div>
            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <div className="mb-4 flex flex-wrap gap-4">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-grow md:flex-grow-0 md:w-1/3 bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    />
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value as 'ALL' | UserRole)}
                        className="bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    >
                        <option value="ALL">All Roles</option>
                        {Object.values(UserRole).map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-content">
                        <thead className="text-xs text-content-muted uppercase bg-base-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">User</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Current Role</th>
                                <th scope="col" className="px-6 py-3">Change Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="bg-base-200 border-b border-base-300 hover:bg-base-300">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <img className="h-10 w-10 rounded-full" src={user.avatar} alt={`${user.name}'s avatar`} />
                                            <div>
                                                <p className="font-medium text-white">{user.name}</p>
                                                <p className="text-xs text-content-muted">ID: {user.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-base-300 text-content">{user.role}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                            disabled={user.id === currentUser?.id}
                                            className="bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {Object.values(UserRole).map(role => (
                                                <option key={role} value={role}>{role}</option>
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

const UserManagement: React.FC = () => {
    const [view, setView] = useState<'list' | 'add'>('list');

    const handleSaveUser = async (userData: { name: string; email: string; role: UserRole; }) => {
        const result = await api.addUser(userData);
        if (result.success) {
            setView('list'); // Re-fetches will happen automatically in the list component
        } else {
            alert(`Error: ${result.message}`);
        }
    };
    
    return (
        <div className="p-4 md:p-8">
            {view === 'list' ? (
                <UserManagementList onAddUserClick={() => setView('add')} />
            ) : (
                <AddUserForm onSave={handleSaveUser} onCancel={() => setView('list')} />
            )}
        </div>
    );
};


export default UserManagement;