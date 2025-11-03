import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { SupportTicket, TicketReply, User, Customer, TicketStatus, UserRole, TicketPriority } from '../../types';
import { api, mockCustomers, mockUsers } from '../../services/mockApiService';
import { AuthContext } from '../../App';

const getStatusColor = (status: TicketStatus) => {
    switch (status) {
        case TicketStatus.OPEN: return 'bg-blue-900 text-blue-300';
        case TicketStatus.IN_PROGRESS: return 'bg-yellow-900 text-yellow-300';
        case TicketStatus.CLOSED: return 'bg-gray-700 text-content-muted';
        default: return 'bg-gray-800 text-gray-400';
    }
};

const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
        case TicketPriority.HIGH: return 'bg-red-900 text-red-300';
        case TicketPriority.MEDIUM: return 'bg-yellow-900 text-yellow-300';
        case TicketPriority.LOW: return 'bg-sky-900 text-sky-300';
        default: return 'bg-gray-800 text-gray-400';
    }
};

interface SupportPortalProps {
    initialTicketId?: string;
}

const SupportPortal: React.FC<SupportPortalProps> = ({ initialTicketId }) => {
    const { user } = useContext(AuthContext);
    const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [replies, setReplies] = useState<TicketReply[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [assignedCustomers, setAssignedCustomers] = useState<Customer[]>([]);
    
    // Filtering and sorting state
    const [sortBy, setSortBy] = useState<'updatedAt' | 'priority' | 'dueDate' | 'createdAt'>('updatedAt');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | TicketStatus>('ALL');

    // Completion dialog state
    const [closingTicket, setClosingTicket] = useState<SupportTicket | null>(null);
    const [showCompletion, setShowCompletion] = useState(false);


    // Form state
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
    const [dueDate, setDueDate] = useState('');
    const [replyMessage, setReplyMessage] = useState('');
    const [relatedCustomer, setRelatedCustomer] = useState('');

    const viewTicketDetails = useCallback(async (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        const ticketReplies = await api.getRepliesForTicket(ticket.id);
        setReplies(ticketReplies);
        setView('detail');
    }, []);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        
        let fetchedTickets: SupportTicket[] = [];
        const allUsers = await Promise.resolve(mockUsers); // Get all users for name lookups
        setUsers(allUsers);
        
        if (user.role === UserRole.ADMIN) {
            fetchedTickets = await api.getAllTickets();
            const customerData = await api.getAllCustomers();
            setCustomers(customerData);
        } else if (user.role === UserRole.USER) {
            fetchedTickets = await api.getTicketsForUser(user.id);
            const [customerData, assignedCustomerData] = await Promise.all([
                api.getAllCustomers(),
                api.getCustomersForUser(user.id)
            ]);
            setCustomers(customerData);
            setAssignedCustomers(assignedCustomerData);
        } else if (user.role === UserRole.CUSTOMER) {
            const customer = mockCustomers.find(c => c.email === user.email);
            if(customer) {
                fetchedTickets = await api.getTicketsForCustomer(customer.id);
            }
        }
        setTickets(fetchedTickets);
        setLoading(false);

        // Handle deep link
        if(initialTicketId) {
            const ticketToOpen = fetchedTickets.find(t => t.id === initialTicketId);
            if (ticketToOpen) {
                viewTicketDetails(ticketToOpen);
            }
        }

    }, [user, initialTicketId, viewTicketDetails]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !description || !user) return;
        
        const ticketData: {
            creatorId: string;
            subject: string;
            description: string;
            priority: TicketPriority;
            dueDate?: string;
            relatedCustomerId?: string;
        } = {
            creatorId: user.id,
            subject,
            description,
            priority,
            dueDate: dueDate || undefined,
        };

        if (user.role === UserRole.USER && relatedCustomer) {
            ticketData.relatedCustomerId = relatedCustomer;
        }

        await api.createTicket(ticketData);

        // Reset form
        setSubject('');
        setDescription('');
        setPriority(TicketPriority.MEDIUM);
        setDueDate('');
        setRelatedCustomer('');
        setView('list');
        fetchData();
    };
    
    const handleAddReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() || !user || !selectedTicket) return;
        await api.addReplyToTicket({ ticketId: selectedTicket.id, userId: user.id, message: replyMessage });
        setReplyMessage('');
        viewTicketDetails(selectedTicket); // Refresh replies
    };
    
    const handleChangeStatus = async (newStatus: TicketStatus) => {
        if(!selectedTicket) return;
        if (newStatus === TicketStatus.CLOSED) {
            setClosingTicket(selectedTicket);
        } else {
            const updatedTicket = await api.updateTicket(selectedTicket.id, { status: newStatus });
            if(updatedTicket) {
                 setSelectedTicket(updatedTicket);
                 fetchData(); // to update the list view as well
            }
        }
    };
    
    const handleConfirmClose = async () => {
        if (!closingTicket) return;

        const updatedTicket = await api.updateTicket(closingTicket.id, { status: TicketStatus.CLOSED });
        if (updatedTicket) {
            setSelectedTicket(updatedTicket);
            setShowCompletion(true);
            setTimeout(() => setShowCompletion(false), 2000);
            fetchData();
        }
        setClosingTicket(null);
    };

    const handleCancelClose = () => {
        // Reset the status dropdown in the UI without saving
        const originalStatus = tickets.find(t => t.id === closingTicket?.id)?.status;
        if (selectedTicket && originalStatus) {
            setSelectedTicket({...selectedTicket, status: originalStatus});
        }
        setClosingTicket(null);
    };
    
    const handleChangePriority = async (newPriority: TicketPriority) => {
        if (!selectedTicket) return;
        const updatedTicket = await api.updateTicket(selectedTicket.id, { priority: newPriority });
        if (updatedTicket) {
            setSelectedTicket(updatedTicket);
            fetchData(); // to update the list view as well
        }
    };
    
    const handleAssignTicket = async (newUserId: string) => {
        if (!selectedTicket) return;
        const assignedToId = newUserId === 'unassigned' ? undefined : newUserId;
        const updatedTicket = await api.updateTicket(selectedTicket.id, { assignedToId });
        if (updatedTicket) {
            setSelectedTicket(updatedTicket);
            fetchData(); // Refresh list data
        }
    };

    const handleChangeDueDate = async (newDueDate: string) => {
        if (!selectedTicket) return;
        const updatedTicket = await api.updateTicket(selectedTicket.id, { dueDate: newDueDate || undefined });
        if (updatedTicket) {
            setSelectedTicket(updatedTicket);
            fetchData(); // to update the list view as well
        }
    };


    const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';
    
    const processedTickets = useMemo(() => {
        let filteredTickets = [...tickets];

        // Apply filters
        if (statusFilter !== 'ALL') {
            filteredTickets = filteredTickets.filter(t => t.status === statusFilter);
        }
        if (searchTerm) {
            filteredTickets = filteredTickets.filter(t => t.subject.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Apply sorting
        filteredTickets.sort((a, b) => {
            if (sortBy === 'priority') {
                const priorityOrder = { [TicketPriority.HIGH]: 3, [TicketPriority.MEDIUM]: 2, [TicketPriority.LOW]: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
             if (sortBy === 'dueDate') {
                const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                return dateA - dateB;
            }
            if (sortBy === 'createdAt') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            // Default sort by updatedAt
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        return filteredTickets;
    }, [tickets, sortBy, searchTerm, statusFilter]);
    
    if (loading) return <div className="p-8 text-center">Loading Support Center...</div>;
    
    if (view === 'create') {
        return (
             <div className="p-4 md:p-8">
                <button onClick={() => setView('list')} className="text-sm text-brand-primary hover:underline mb-6">&larr; Back to all tickets</button>
                <div className="bg-base-200 p-6 md:p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-6">Create a New Support Ticket</h1>
                    <form onSubmit={handleCreateTicket} className="space-y-6">
                        {user?.role === UserRole.USER && (
                            <div>
                                <label className="block text-sm font-medium text-content-muted mb-1">Regarding</label>
                                <select value={relatedCustomer} onChange={e => setRelatedCustomer(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none">
                                    <option value="">My own account (Commission, etc.)</option>
                                    {assignedCustomers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                         <div>
                            <label className="block text-sm font-medium text-content-muted mb-1">Subject</label>
                            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-content-muted mb-1">Priority</label>
                                <select value={priority} onChange={e => setPriority(e.target.value as TicketPriority)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none">
                                    {Object.values(TicketPriority).map(p => (
                                        <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                                    ))}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-content-muted mb-1">Due Date (Optional)</label>
                                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-content-muted mb-1">Describe your issue</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" required />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-secondary transition-colors">Submit Ticket</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
    
    if(view === 'detail' && selectedTicket) {
        const ticketCreator = users.find(u => u.id === selectedTicket.creatorId);
        const relatedCustomer = selectedTicket.relatedCustomerId ? customers.find(c => c.id === selectedTicket.relatedCustomerId) : null;
        
        let creatorDisplayName = ticketCreator?.name;
        if (ticketCreator?.role === UserRole.CUSTOMER) {
             const customerRecord = customers.find(c => c.email === ticketCreator.email);
             if (customerRecord) creatorDisplayName = customerRecord.name;
        }

        return (
            <div className="p-4 md:p-8">
                <button onClick={() => setView('list')} className="text-sm text-brand-primary hover:underline mb-6">&larr; Back to all tickets</button>
                <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                    <header className="border-b border-base-300 pb-4 mb-6 space-y-4">
                        <div className="flex justify-between items-start">
                             <div>
                                <h1 className="text-3xl font-bold text-white">{selectedTicket.subject}</h1>
                                <p className="text-sm text-content-muted mt-1">
                                    Ticket #{selectedTicket.id.split('-')[1]} opened by <span className="font-semibold text-white">{creatorDisplayName || '...'}</span>
                                    {relatedCustomer && ` (regarding ${relatedCustomer.name})`}
                                    {' on '} {new Date(selectedTicket.createdAt).toLocaleString()}
                                </p>
                            </div>
                             <div className="flex items-center space-x-2 flex-shrink-0">
                                {selectedTicket.dueDate && (
                                    <span className="text-sm text-content-muted">
                                        Due: {new Date(selectedTicket.dueDate).toLocaleDateString()}
                                    </span>
                                )}
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(selectedTicket.priority)}`}>{selectedTicket.priority}</span>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status}</span>
                             </div>
                        </div>
                         {/* Actions Row */}
                        {(user?.role === UserRole.ADMIN || user?.role === UserRole.USER) && (
                            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
                                <div className="flex items-center space-x-2">
                                    <label className="text-sm font-medium text-content-muted">Assign To:</label>
                                    <select 
                                        value={selectedTicket.assignedToId || 'unassigned'} 
                                        onChange={e => handleAssignTicket(e.target.value)}
                                        className="bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                    >
                                        <option value="unassigned">-- Unassigned --</option>
                                        {users.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.USER).map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {user?.role === UserRole.ADMIN && (
                                    <>
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm font-medium text-content-muted">Status:</label>
                                            <select onChange={(e) => handleChangeStatus(e.target.value as TicketStatus)} value={selectedTicket.status} className="bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none">
                                                {Object.values(TicketStatus).map(status => <option key={status} value={status}>{status}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm font-medium text-content-muted">Priority:</label>
                                            <select onChange={(e) => handleChangePriority(e.target.value as TicketPriority)} value={selectedTicket.priority} className="bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none">
                                                {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}
                                <div className="flex items-center space-x-2">
                                    <label className="text-sm font-medium text-content-muted">Due Date:</label>
                                    <input 
                                        type="date"
                                        value={selectedTicket.dueDate || ''}
                                        onChange={e => handleChangeDueDate(e.target.value)}
                                        className="bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </header>
                    <div className="space-y-6">
                        {/* Initial Description */}
                         <div className="flex items-start space-x-4">
                            <img src={ticketCreator?.avatar} alt="avatar" className="w-10 h-10 rounded-full"/>
                            <div className="flex-1 bg-base-300 p-4 rounded-lg">
                                <p className="text-sm text-content-muted mb-2"><span className="font-bold text-white">{creatorDisplayName}</span> said:</p>
                                <p className="text-content whitespace-pre-wrap">{selectedTicket.description}</p>
                            </div>
                        </div>
                        {/* Replies */}
                        {replies.map(reply => {
                            const replier = users.find(u => u.id === reply.userId);
                            const isStaff = replier?.role === UserRole.ADMIN || replier?.role === UserRole.USER;
                            return (
                                <div key={reply.id} className="flex items-start space-x-4">
                                     <img src={replier?.avatar} alt="avatar" className="w-10 h-10 rounded-full"/>
                                    <div className={`flex-1 p-4 rounded-lg ${isStaff ? 'bg-brand-primary/10 border border-brand-primary/30' : 'bg-base-300'}`}>
                                        <p className="text-sm text-content-muted mb-2"><span className="font-bold text-white">{replier?.name}</span> replied on {new Date(reply.createdAt).toLocaleString()}:</p>
                                        <p className="text-content whitespace-pre-wrap">{reply.message}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {/* Add Reply Form */}
                    {selectedTicket.status !== TicketStatus.CLOSED && (
                        <div className="mt-8 border-t border-base-300 pt-6">
                            <h3 className="text-xl font-bold text-white mb-4">Add a Reply</h3>
                            <form onSubmit={handleAddReply}>
                                <textarea value={replyMessage} onChange={e => setReplyMessage(e.target.value)} rows={5} className="w-full bg-base-300 text-white p-2 rounded-md border border-base-300 focus:ring-2 focus:ring-brand-primary focus:outline-none" placeholder="Type your message here..." required />
                                <div className="flex justify-end mt-4">
                                    <button type="submit" className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-secondary transition-colors">Send Reply</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            {/* Completion Confirmation Modal */}
            {closingTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-base-200 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Confirm Completion</h2>
                        <p className="text-content-muted mb-6">
                            Are you sure you want to mark the ticket "{closingTicket.subject}" as complete?
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleCancelClose}
                                className="bg-base-300 text-white font-bold py-2 px-6 rounded-lg hover:bg-base-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmClose}
                                className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Mark as Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Completion Animation Overlay */}
            {showCompletion && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-base-200 p-8 rounded-full">
                         <svg className="w-24 h-24" viewBox="0 0 52 52">
                            <circle className="stroke-current text-green-600" cx="26" cy="26" r="25" fill="none" strokeWidth="4" style={{ strokeDasharray: 157, strokeDashoffset: 157, animation: 'draw-circle 0.5s ease-out forwards' }} />
                            <path className="stroke-current text-green-500" fill="none" strokeWidth="5" d="M14.1 27.2l7.1 7.2 16.7-16.8" style={{ strokeDasharray: 48, strokeDashoffset: 48, animation: 'draw-check 0.4s 0.5s ease-out forwards' }} />
                        </svg>
                    </div>
                     <style>{`
                        @keyframes draw-circle { to { stroke-dashoffset: 0; } }
                        @keyframes draw-check { to { stroke-dashoffset: 0; } }
                    `}</style>
                 </div>
            )}

            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-white">Support Tickets</h1>
                {(user?.role === UserRole.CUSTOMER || user?.role === UserRole.USER) && (
                    <button onClick={() => setView('create')} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors">
                        + Create New Ticket
                    </button>
                )}
            </div>
            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                 <div className="mb-4 flex flex-wrap gap-4 p-4 bg-base-300 rounded-lg">
                     <input
                        type="text"
                        placeholder="Search by subject..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-grow md:flex-grow-0 md:w-1/3 bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    />
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as 'ALL' | TicketStatus)}
                        className="bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                    >
                        <option value="ALL">All Statuses</option>
                        {Object.values(TicketStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    <div className="flex items-center space-x-2 ml-auto">
                         <label htmlFor="sort-by" className="text-sm font-medium text-content-muted">Sort by:</label>
                        <select
                            id="sort-by"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as 'updatedAt' | 'priority' | 'dueDate' | 'createdAt')}
                            className="bg-base-100 text-white p-2 rounded-md border border-base-100 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                        >
                            <option value="updatedAt">Last Updated</option>
                            <option value="createdAt">Creation Date</option>
                            <option value="dueDate">Due Date</option>
                            <option value="priority">Priority</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-content">
                        <thead className="text-xs text-content-muted uppercase bg-base-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Subject</th>
                                {user.role !== UserRole.CUSTOMER && <th scope="col" className="px-6 py-3">Creator / Customer</th>}
                                {user.role !== UserRole.CUSTOMER && <th scope="col" className="px-6 py-3">Assigned To</th>}
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Priority</th>
                                <th scope="col" className="px-6 py-3">Due Date</th>
                                <th scope="col" className="px-6 py-3">Last Updated</th>
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                           {processedTickets.map(ticket => {
                                const creator = users.find(u => u.id === ticket.creatorId);
                                const relatedCustomer = ticket.relatedCustomerId ? customers.find(c => c.id === ticket.relatedCustomerId) : null;
                                const isOverdue = ticket.dueDate && new Date(ticket.dueDate) < new Date() && ticket.status !== TicketStatus.CLOSED;
                                return (
                                <tr key={ticket.id} className="bg-base-200 border-b border-base-300 hover:bg-base-300">
                                    <td className="px-6 py-4 font-medium text-white">{ticket.subject}</td>
                                    {user.role !== UserRole.CUSTOMER && 
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-white">{creator?.name}</p>
                                            {relatedCustomer && <p className="text-xs text-content-muted">re: {relatedCustomer.name}</p>}
                                        </td>
                                    }
                                    {user.role !== UserRole.CUSTOMER && 
                                        <td className="px-6 py-4">
                                            {ticket.assignedToId ? getUserName(ticket.assignedToId) : <span className="text-content-muted">Unassigned</span>}
                                        </td>
                                    }
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>{ticket.status}</span></td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span></td>
                                    <td className={`px-6 py-4 ${isOverdue ? 'text-red-400 font-semibold' : ''}`}>
                                        {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : <span className="text-content-muted">N/A</span>}
                                    </td>
                                    <td className="px-6 py-4">{new Date(ticket.updatedAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => viewTicketDetails(ticket)} className="text-brand-primary hover:underline">View Details</button>
                                    </td>
                                </tr>
                           )})}
                        </tbody>
                    </table>
                     {processedTickets.length === 0 && <p className="text-center p-8 text-content-muted">No support tickets match your filters.</p>}
                </div>
            </div>
        </div>
    );
};

export default SupportPortal;