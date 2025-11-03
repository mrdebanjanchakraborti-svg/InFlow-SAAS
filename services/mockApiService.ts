import { User, UserRole, Customer, Software, Subscription, ProjectStatus, SubscriptionPlan, Invoice, Commission, DiscountCoupon, DiscountType, SupportTicket, TicketStatus, TicketReply, Notification, TicketPriority, NotificationType } from '../types';

export let mockUsers: User[] = [
    { id: 'user-admin', name: 'Admin User', email: 'admin@saas.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/seed/admin/100' },
    { id: 'user-sales-1', name: 'Sales Team A', email: 'sales1@saas.com', role: UserRole.USER, avatar: 'https://picsum.photos/seed/sales1/100', referralLink: 'https://saas.com/ref/sales1' },
    { id: 'user-sales-2', name: 'Sales Team B', email: 'sales2@saas.com', role: UserRole.USER, avatar: 'https://picsum.photos/seed/sales2/100', referralLink: 'https://saas.com/ref/sales2' },
    { id: 'user-customer-1', name: 'Ravi Kumar', email: 'ravi@customer.com', role: UserRole.CUSTOMER, avatar: 'https://picsum.photos/seed/customer1/100' },
    { id: 'user-customer-2', name: 'Priya Sharma', email: 'priya@customer.com', role: UserRole.CUSTOMER, avatar: 'https://picsum.photos/seed/customer2/100' },
];

export let mockSoftware: Software[] = [
    {
        id: 'sw-crm',
        name: 'NexusCRM',
        description: 'A comprehensive CRM platform designed to streamline sales processes, manage leads, and enhance customer engagement.',
        category: 'CRM',
        targetIndustries: ['Sales', 'Marketing', 'Real Estate'],
        features: ['Contact Management', 'Lead Tracking', 'Email Automation', 'Sales Analytics', 'Advanced Reporting', 'Integration with marketing tools'],
        demoVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        pricing: {
            [SubscriptionPlan.MONTHLY]: 2500,
            [SubscriptionPlan.QUARTERLY]: 7000,
            [SubscriptionPlan.YEARLY]: 25000,
        },
        setupFee: 5000,
    },
    {
        id: 'sw-project',
        name: 'TaskMaster',
        description: 'Collaborative project management tool for agile teams.',
        category: 'Project Management',
        targetIndustries: ['Software Development', 'Creative Agencies', 'Startups'],
        features: ['Kanban Boards', 'Gantt Charts', 'Time Tracking', 'Team Collaboration'],
        demoVideoUrl: 'https://vimeo.com/13536878',
        pricing: {
            [SubscriptionPlan.MONTHLY]: 1800,
            [SubscriptionPlan.QUARTERLY]: 5000,
            [SubscriptionPlan.YEARLY]: 18000,
        },
        setupFee: 3000,
    },
    {
        id: 'sw-analytics',
        name: 'Insightify',
        description: 'Advanced business intelligence and data visualization platform.',
        category: 'Data Analytics',
        targetIndustries: ['E-commerce', 'Finance', 'Healthcare'],
        features: ['Real-time Dashboards', 'Predictive Analytics', 'Custom Reporting', 'Data Integration'],
        demoVideoUrl: '',
        pricing: {
            [SubscriptionPlan.MONTHLY]: 4000,
            [SubscriptionPlan.QUARTERLY]: 11000,
            [SubscriptionPlan.YEARLY]: 40000,
        },
        setupFee: 8000,
    },
];

export let mockCustomers: Customer[] = [
    { id: 'cust-1', name: 'Ravi Kumar', email: 'ravi@customer.com', company: 'Innovate Solutions', signupDate: '2023-08-15', assignedToUserId: 'user-sales-1', referredByUserId: 'user-sales-1', mobile: '9876543210', whatsapp: '9876543210', city: 'Mumbai', state: 'Maharashtra', pin: '400001' },
    { id: 'cust-2', name: 'Priya Sharma', email: 'priya@customer.com', company: 'Creative Minds Inc.', signupDate: '2023-09-01', assignedToUserId: 'user-sales-2', mobile: '9123456780', whatsapp: '9123456780', city: 'Bengaluru', state: 'Karnataka', pin: '560001' },
    { id: 'cust-3', name: 'Amit Singh', email: 'amit@customer.com', company: 'Tech Giants Ltd.', signupDate: '2023-10-20', assignedToUserId: 'user-sales-1', referredByUserId: 'user-sales-1', mobile: '8765432109', whatsapp: '8765432109', city: 'Delhi', state: 'Delhi', pin: '110001' },
];

export let mockSubscriptions: Subscription[] = [
    { id: 'sub-1', customerId: 'cust-1', softwareId: 'sw-crm', plan: SubscriptionPlan.YEARLY, startDate: '2023-08-15', nextRenewalDate: '2024-08-15', nextBillingDate: '2024-08-15', renewalAmount: 25000, onboardingDate: '2023-08-20', trainingDate: '2023-08-25', status: ProjectStatus.PENDING, nextActionDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
    { id: 'sub-2', customerId: 'cust-1', softwareId: 'sw-project', plan: SubscriptionPlan.MONTHLY, startDate: '2023-11-01', nextRenewalDate: '2024-07-01', nextBillingDate: '2024-07-01', renewalAmount: 1800, onboardingDate: '2023-11-05', trainingDate: '2023-11-10', status: ProjectStatus.TRAINING, nextActionDate: '2024-07-25' },
    { id: 'sub-3', customerId: 'cust-2', softwareId: 'sw-project', plan: SubscriptionPlan.QUARTERLY, startDate: '2023-09-01', nextRenewalDate: '2024-06-15', nextBillingDate: '2024-06-15', renewalAmount: 5000, onboardingDate: '2023-09-05', trainingDate: '2023-09-10', status: ProjectStatus.COMPLETE },
    { id: 'sub-4', customerId: 'cust-3', softwareId: 'sw-crm', plan: SubscriptionPlan.MONTHLY, startDate: '2023-10-20', nextRenewalDate: '2024-07-20', nextBillingDate: '2024-07-20', renewalAmount: 2500, onboardingDate: '2023-10-22', trainingDate: '2023-10-28', status: ProjectStatus.PENDING, nextActionDate: '2024-07-22' },
];

export let mockInvoices: Invoice[] = [
    { id: 'inv-1', subscriptionId: 'sub-1', customerId: 'cust-1', amount: 30000, issueDate: '2023-08-15', paymentDate: '2023-08-15' },
    { id: 'inv-2', subscriptionId: 'sub-2', customerId: 'cust-1', amount: 4800, issueDate: '2023-11-01', paymentDate: '2023-11-01' },
    { id: 'inv-3', subscriptionId: 'sub-3', customerId: 'cust-2', amount: 8000, issueDate: '2023-09-01', paymentDate: '2023-09-01' },
    { id: 'inv-4', subscriptionId: 'sub-4', customerId: 'cust-3', amount: 7500, issueDate: '2023-10-20', paymentDate: '2023-10-20' },
    // Added more recent invoices to make dashboard stats and chart more dynamic and realistic
    { id: 'inv-5', subscriptionId: 'sub-1', customerId: 'cust-1', amount: 40000, issueDate: '2024-01-15', paymentDate: '2024-01-15' },
    { id: 'inv-6', subscriptionId: 'sub-2', customerId: 'cust-1', amount: 30000, issueDate: '2024-02-01', paymentDate: '2024-02-01' },
    { id: 'inv-7', subscriptionId: 'sub-3', customerId: 'cust-2', amount: 50000, issueDate: '2024-03-01', paymentDate: '2024-03-01' },
    { id: 'inv-8', subscriptionId: 'sub-4', customerId: 'cust-3', amount: 45000, issueDate: '2024-04-20', paymentDate: '2024-04-20' },
    { id: 'inv-9', subscriptionId: 'sub-1', customerId: 'cust-1', amount: 60000, issueDate: '2024-05-15', paymentDate: '2024-05-15' },
    { id: 'inv-10', subscriptionId: 'sub-2', customerId: 'cust-1', amount: 55000, issueDate: '2024-06-01' },
];

export const mockCommissions: Commission[] = [
    { id: 'com-1', userId: 'user-sales-1', customerId: 'cust-1', invoiceId: 'inv-1', amount: 6000, date: '2023-08-15' },
    { id: 'com-2', userId: 'user-sales-1', customerId: 'cust-3', invoiceId: 'inv-4', amount: 1500, date: '2023-10-20' },
];

export let mockDiscountCoupons: DiscountCoupon[] = [
    {
        id: 'coupon-1',
        code: 'SUMMER20',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        validFrom: '2024-06-01',
        validUntil: '2024-08-31',
        isActive: true,
        applicableSoftwareIds: ['sw-crm'],
    },
    {
        id: 'coupon-2',
        code: 'NEWUSER500',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 500,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        isActive: true,
        applicableSoftwareIds: [], // All software
    },
     {
        id: 'coupon-3',
        code: 'EXPIRED10',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        validFrom: '2023-01-01',
        validUntil: '2023-12-31',
        isActive: false,
        applicableSoftwareIds: [],
    },
];

export let mockSupportTickets: SupportTicket[] = [
    {
        id: 'ticket-1',
        creatorId: 'user-customer-1', // Ravi Kumar
        subject: 'Cannot login to NexusCRM',
        description: 'I seem to have forgotten my password for NexusCRM and the reset link is not working. Can you please assist?',
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        createdAt: '2024-07-10T10:00:00Z',
        updatedAt: '2024-07-10T10:00:00Z',
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], // 5 days from now
    },
    {
        id: 'ticket-2',
        creatorId: 'user-customer-2', // Priya Sharma
        subject: 'Billing Inquiry for TaskMaster',
        description: 'My last invoice seems incorrect. I was on the quarterly plan but was billed for monthly. Please check.',
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.MEDIUM,
        createdAt: '2024-07-09T14:30:00Z',
        updatedAt: '2024-07-10T11:00:00Z',
        assignedToId: 'user-sales-1',
        dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 days ago (overdue)
    },
    {
        id: 'ticket-3',
        creatorId: 'user-customer-1', // Ravi Kumar
        subject: 'Feature Request for TaskMaster',
        description: 'It would be great if TaskMaster could integrate with our internal calendar system. Is this on the roadmap?',
        status: TicketStatus.CLOSED,
        priority: TicketPriority.LOW,
        createdAt: '2024-06-20T09:00:00Z',
        updatedAt: '2024-06-22T15:00:00Z',
        assignedToId: 'user-admin',
    },
];

export let mockTicketReplies: TicketReply[] = [
    {
        id: 'reply-1',
        ticketId: 'ticket-2',
        userId: 'user-sales-1', // Sales Team A
        message: 'Hi Priya, thank you for reaching out. We are looking into the billing discrepancy and will get back to you shortly.',
        createdAt: '2024-07-10T11:00:00Z',
    },
    {
        id: 'reply-2',
        ticketId: 'ticket-3',
        userId: 'user-admin',
        message: 'Hello Ravi, thanks for the suggestion! We have passed this along to our product team for consideration in future updates.',
        createdAt: '2024-06-21T10:00:00Z',
    },
    {
        id: 'reply-3',
        ticketId: 'ticket-3',
        userId: 'user-customer-1', // Ravi Kumar
        message: 'Great, thank you for the update!',
        createdAt: '2024-06-21T11:30:00Z',
    },
];

export let mockNotifications: Notification[] = [];

// --- Simulates a background job to create task reminders ---
const generateTaskReminders = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    mockSupportTickets.forEach(ticket => {
        if (!ticket.dueDate || ticket.status === TicketStatus.CLOSED || !ticket.assignedToId) {
            return;
        }

        const dueDate = new Date(ticket.dueDate);

        // --- Overdue Reminders ---
        if (dueDate < today) {
            const hasExistingOverdueNotif = mockNotifications.some(n =>
                n.ticketId === ticket.id && n.type === NotificationType.TASK_OVERDUE
            );
            if (!hasExistingOverdueNotif) {
                const newNotification: Notification = {
                    id: `notif-${Date.now()}-overdue-${ticket.id}`,
                    userId: ticket.assignedToId,
                    ticketId: ticket.id,
                    title: `🔥 OVERDUE: ${ticket.subject.substring(0, 20)}...`,
                    message: `This task was due on ${dueDate.toLocaleDateString()}.`,
                    createdAt: new Date().toISOString(),
                    isRead: false,
                    type: NotificationType.TASK_OVERDUE,
                };
                mockNotifications.unshift(newNotification);
            }
        }
        // --- Due Soon Reminders ---
        else if (dueDate >= today && dueDate <= tomorrow) {
             const hasExistingDueSoonNotif = mockNotifications.some(n =>
                n.ticketId === ticket.id && n.type === NotificationType.TASK_DUE_SOON
            );
            if (!hasExistingDueSoonNotif) {
                 const newNotification: Notification = {
                    id: `notif-${Date.now()}-duesoon-${ticket.id}`,
                    userId: ticket.assignedToId,
                    ticketId: ticket.id,
                    title: `⏰ Due Soon: ${ticket.subject.substring(0, 20)}...`,
                    message: `This task is due on ${dueDate.toLocaleDateString()}.`,
                    createdAt: new Date().toISOString(),
                    isRead: false,
                    type: NotificationType.TASK_DUE_SOON,
                };
                mockNotifications.unshift(newNotification);
            }
        }
    });
};

let hasGeneratedRecurringInvoices = false; // Prevent re-running in a single session

const generateRecurringInvoices = () => {
    if (hasGeneratedRecurringInvoices) return;

    const today = new Date();
    const subscriptionsToUpdate = mockSubscriptions.filter(sub => new Date(sub.nextBillingDate) < today);

    subscriptionsToUpdate.forEach(sub => {
        console.log(`Generating recurring invoice for subscription ${sub.id}`);

        // 1. Create a new unpaid invoice
        const newInvoice: Invoice = {
            id: `inv-recurring-${Date.now()}-${sub.id}`,
            subscriptionId: sub.id,
            customerId: sub.customerId,
            amount: sub.renewalAmount,
            issueDate: new Date().toISOString().split('T')[0],
            // No paymentDate, as it's unpaid
        };
        mockInvoices.unshift(newInvoice);

        // 2. Update the subscription's next dates
        const currentRenewal = new Date(sub.nextRenewalDate);
        let newRenewalDate: Date;

        switch (sub.plan) {
            case SubscriptionPlan.MONTHLY:
                newRenewalDate = new Date(currentRenewal.setMonth(currentRenewal.getMonth() + 1));
                break;
            case SubscriptionPlan.QUARTERLY:
                newRenewalDate = new Date(currentRenewal.setMonth(currentRenewal.getMonth() + 3));
                break;
            case SubscriptionPlan.YEARLY:
            default:
                newRenewalDate = new Date(currentRenewal.setFullYear(currentRenewal.getFullYear() + 1));
        }
        
        const newDateStr = newRenewalDate.toISOString().split('T')[0];
        const subIndex = mockSubscriptions.findIndex(s => s.id === sub.id);
        if (subIndex > -1) {
            mockSubscriptions[subIndex].nextRenewalDate = newDateStr;
            mockSubscriptions[subIndex].nextBillingDate = newDateStr;
        }
    });
    hasGeneratedRecurringInvoices = true;
};


// API Simulation
export const api = {
    getUser: async (id: string): Promise<User | undefined> => mockUsers.find(u => u.id === id),
    getAllUsers: async (): Promise<User[]> => [...mockUsers],
    getCustomersForUser: async (userId: string): Promise<Customer[]> => mockCustomers.filter(c => c.assignedToUserId === userId),
    getReferredCustomersForUser: async (userId: string): Promise<Customer[]> => mockCustomers.filter(c => c.referredByUserId === userId),
    getAllCustomers: async (): Promise<Customer[]> => mockCustomers,
    getSubscriptionsForCustomer: async (customerId: string): Promise<Subscription[]> => mockSubscriptions.filter(s => s.customerId === customerId),
    getSoftware: async (id: string): Promise<Software | undefined> => mockSoftware.find(s => s.id === id),
    getAllSoftware: async (): Promise<Software[]> => mockSoftware,
    getCommissionsForUser: async (userId: string): Promise<Commission[]> => mockCommissions.filter(c => c.userId === userId),

    addSoftware: async (softwareData: Omit<Software, 'id' | 'targetIndustries'>): Promise<Software> => {
        const newSoftware: Software = {
            id: `sw-${Date.now()}`,
            targetIndustries: [], // Add default empty values for fields not in form
            ...softwareData,
        };
        mockSoftware.push(newSoftware);
        return newSoftware;
    },

    deleteSoftware: async (softwareId: string): Promise<boolean> => {
        const initialLength = mockSoftware.length;
        mockSoftware = mockSoftware.filter(s => s.id !== softwareId);
        return mockSoftware.length < initialLength;
    },

    registerCustomer: async (details: { name: string, email: string, company: string, referralCode?: string | null }): Promise<{ success: boolean, message: string }> => {
        // Check if email is already taken
        if (mockUsers.some(u => u.email === details.email)) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        const newUserId = `user-customer-${mockUsers.length + 1}`;
        const newCustomerId = `cust-${mockCustomers.length + 1}`;

        const newUser: User = {
            id: newUserId,
            name: details.name,
            email: details.email,
            role: UserRole.CUSTOMER,
            avatar: `https://picsum.photos/seed/${newUserId}/100`,
        };

        const newCustomer: Customer = {
            id: newCustomerId,
            name: details.name,
            email: details.email,
            company: details.company,
            signupDate: new Date().toISOString().split('T')[0],
        };

        if (details.referralCode) {
            // Find user whose referral link ends with the code
            const referringUser = mockUsers.find(u => u.referralLink?.endsWith(details.referralCode as string));
            if (referringUser) {
                newCustomer.referredByUserId = referringUser.id;
                newCustomer.assignedToUserId = referringUser.id; // Assign to the referrer
            }
        }
        
        mockUsers.push(newUser);
        mockCustomers.push(newCustomer);

        console.log("New user registered:", newUser);
        console.log("New customer created:", newCustomer);

        return { success: true, message: 'Registration successful!' };
    },
    
    getAllCoupons: async (): Promise<DiscountCoupon[]> => mockDiscountCoupons,
    
    addCoupon: async (couponData: Omit<DiscountCoupon, 'id'>): Promise<DiscountCoupon> => {
        const newCoupon: DiscountCoupon = {
            id: `coupon-${Date.now()}`,
            ...couponData,
        };
        mockDiscountCoupons.push(newCoupon);
        return newCoupon;
    },

    updateCoupon: async (couponId: string, updates: Partial<DiscountCoupon>): Promise<DiscountCoupon | null> => {
        const couponIndex = mockDiscountCoupons.findIndex(c => c.id === couponId);
        if (couponIndex > -1) {
            mockDiscountCoupons[couponIndex] = { ...mockDiscountCoupons[couponIndex], ...updates };
            return mockDiscountCoupons[couponIndex];
        }
        return null;
    },

    deleteCoupon: async (couponId: string): Promise<boolean> => {
        const initialLength = mockDiscountCoupons.length;
        mockDiscountCoupons = mockDiscountCoupons.filter(c => c.id !== couponId);
        return mockDiscountCoupons.length < initialLength;
    },
    
    requestPasswordReset: async (email: string): Promise<{ success: boolean, message: string }> => {
        const userExists = mockUsers.some(u => u.email === email);
        console.log(`Password reset requested for ${email}. User exists: ${userExists}`);
        // In a real app, we would generate a token, save it with an expiry,
        // and send an email. We always return a success-like message
        // to prevent user enumeration attacks.
        return new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'If an account with this email exists, a password reset link has been sent.' }), 500));
    },

    resetPassword: async (data: { email: string, newPassword: string }): Promise<{ success: boolean, message: string }> => {
        const user = mockUsers.find(u => u.email === data.email);
        if (!user) {
            // This would be handled by token validation in a real app.
            // For this simulation, we'll return a generic error.
             return new Promise(resolve => setTimeout(() => resolve({ success: false, message: 'Password reset failed. Please try again.' }), 500));
        }
        console.log(`Password for user ${user.name} (${user.email}) has been reset.`);
        // In a real app, we'd update the user's password hash in the database.
        return new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Your password has been reset successfully.' }), 500));
    },

    updateUserRole: async (userId: string, newRole: UserRole): Promise<User | null> => {
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            mockUsers[userIndex].role = newRole;
            console.log(`Updated role for ${mockUsers[userIndex].name} to ${newRole}`);
            return mockUsers[userIndex];
        }
        return null;
    },
    
    addUser: async (details: { name: string; email: string; role: UserRole; }): Promise<{ success: boolean; message: string; user?: User; }> => {
        if (mockUsers.some(u => u.email === details.email)) {
            return { success: false, message: 'An account with this email already exists.' };
        }
        const newUserId = `user-new-${Date.now()}`;
        const newUser: User = {
            id: newUserId,
            name: details.name,
            email: details.email,
            role: details.role,
            avatar: `https://picsum.photos/seed/${newUserId}/100`,
        };
        // Add referral link for sales users
        if(details.role === UserRole.USER) {
            newUser.referralLink = `https://saas.com/ref/${details.name.toLowerCase().replace(/\s/g, '')}`
        }

        mockUsers.push(newUser);
        return { success: true, message: 'User created successfully.', user: newUser };
    },

    reassignCustomer: async (customerId: string, newUserId: string | undefined): Promise<{ success: boolean; message: string; customer?: Customer }> => {
        const customerIndex = mockCustomers.findIndex(c => c.id === customerId);
        if (customerIndex > -1) {
            mockCustomers[customerIndex].assignedToUserId = newUserId;
            console.log(`Reassigned customer ${mockCustomers[customerIndex].name} to user ${newUserId || 'unassigned'}`);
            return { success: true, message: 'Customer reassigned successfully.', customer: mockCustomers[customerIndex] };
        }
        return { success: false, message: 'Customer not found.' };
    },

    updateCustomerDetails: async (customerId: string, updates: Partial<Pick<Customer, 'mobile' | 'whatsapp'>>): Promise<Customer | null> => {
        const customerIndex = mockCustomers.findIndex(c => c.id === customerId);
        if (customerIndex > -1) {
            const updatedCustomer = { ...mockCustomers[customerIndex], ...updates };
            mockCustomers[customerIndex] = updatedCustomer;
            console.log(`Updated details for customer ${updatedCustomer.name}`, updates);
            return updatedCustomer;
        }
        return null;
    },

    // Support Ticket API
    getTicketsForCustomer: async (customerId: string): Promise<SupportTicket[]> => {
        const customer = mockCustomers.find(c => c.id === customerId);
        const user = mockUsers.find(u => u.email === customer?.email && u.role === UserRole.CUSTOMER);
        if (!user) return [];
        return mockSupportTickets.filter(t => t.creatorId === user.id).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },
    getAllTickets: async (): Promise<SupportTicket[]> => {
        return [...mockSupportTickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },
     getTicketsForUser: async (userId: string): Promise<SupportTicket[]> => {
        return mockSupportTickets.filter(t => t.assignedToId === userId || t.creatorId === userId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },
    createTicket: async (ticketData: { creatorId: string; subject: string; description: string; priority: TicketPriority; dueDate?: string; relatedCustomerId?: string }): Promise<SupportTicket> => {
        const now = new Date().toISOString();
        const newTicket: SupportTicket = {
            id: `ticket-${Date.now()}`,
            status: TicketStatus.OPEN,
            createdAt: now,
            updatedAt: now,
            priority: ticketData.priority || TicketPriority.MEDIUM,
            ...ticketData
        };
        mockSupportTickets.unshift(newTicket);

        // --- NOTIFICATION SIMULATION ---
        const creator = mockUsers.find(u => u.id === ticketData.creatorId);
        if(creator) {
            const admins = mockUsers.filter(u => u.role === UserRole.ADMIN);
            admins.forEach(admin => {
                const newNotification: Notification = {
                    id: `notif-${Date.now()}-${admin.id}`,
                    userId: admin.id,
                    ticketId: newTicket.id,
                    title: `New Ticket: ${newTicket.subject.substring(0, 30)}...`,
                    message: `A new support ticket was created by ${creator.name}.`,
                    createdAt: now,
                    isRead: false,
                    type: NotificationType.NEW_TICKET,
                };
                mockNotifications.unshift(newNotification);
            });
        }
        // --- END NOTIFICATION SIMULATION ---

        return newTicket;
    },
    getTicketById: async (ticketId: string): Promise<SupportTicket | undefined> => {
        return mockSupportTickets.find(t => t.id === ticketId);
    },
    getRepliesForTicket: async (ticketId: string): Promise<TicketReply[]> => {
        return mockTicketReplies.filter(r => r.ticketId === ticketId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },
    addReplyToTicket: async (replyData: { ticketId: string; userId: string; message: string }): Promise<TicketReply> => {
        const now = new Date().toISOString();
        const newReply: TicketReply = {
            id: `reply-${Date.now()}`,
            createdAt: now,
            ...replyData,
        };
        mockTicketReplies.push(newReply);

        const ticketIndex = mockSupportTickets.findIndex(t => t.id === replyData.ticketId);
        if (ticketIndex > -1) {
            mockSupportTickets[ticketIndex].updatedAt = now;
            const user = mockUsers.find(u => u.id === replyData.userId);
            if (user?.role === UserRole.CUSTOMER && mockSupportTickets[ticketIndex].status === TicketStatus.CLOSED) {
                mockSupportTickets[ticketIndex].status = TicketStatus.OPEN;
            }
        }

        return newReply;
    },
    updateTicket: async (ticketId: string, updates: Partial<SupportTicket>): Promise<SupportTicket | null> => {
        const ticketIndex = mockSupportTickets.findIndex(t => t.id === ticketId);
        if (ticketIndex > -1) {
            const now = new Date().toISOString();
            mockSupportTickets[ticketIndex] = { ...mockSupportTickets[ticketIndex], ...updates, updatedAt: now };
            return mockSupportTickets[ticketIndex];
        }
        return null;
    },
    // Notification API
    getNotificationsForUser: async (userId: string): Promise<Notification[]> => {
        // Run the reminder generator every time notifications are fetched to simulate a cron job
        generateTaskReminders();
        return mockNotifications.filter(n => n.userId === userId);
    },
    markNotificationAsRead: async (notificationId: string): Promise<boolean> => {
        const notificationIndex = mockNotifications.findIndex(n => n.id === notificationId);
        if (notificationIndex > -1) {
            mockNotifications[notificationIndex].isRead = true;
            return true;
        }
        return false;
    },
    // Subscription Management API
    getSubscriptionsForSoftware: async (softwareId: string): Promise<Subscription[]> => {
        return mockSubscriptions.filter(s => s.softwareId === softwareId);
    },
    getSubscriptionById: async (subscriptionId: string): Promise<Subscription | undefined> => {
        return mockSubscriptions.find(s => s.id === subscriptionId);
    },
    updateSubscriptionDetails: async (subscriptionId: string, updates: Partial<Pick<Subscription, 'status' | 'nextActionDate'>>): Promise<Subscription | null> => {
        const subIndex = mockSubscriptions.findIndex(s => s.id === subscriptionId);
        if (subIndex > -1) {
            const updatedSubscription = { ...mockSubscriptions[subIndex], ...updates };
            mockSubscriptions[subIndex] = updatedSubscription;
            return updatedSubscription;
        }
        return null;
    },
    makeRenewalPayment: async (subscriptionId: string): Promise<{ success: boolean, message: string }> => {
        const subIndex = mockSubscriptions.findIndex(s => s.id === subscriptionId);
        if (subIndex === -1) {
            return { success: false, message: 'Subscription not found.' };
        }

        const subscription = mockSubscriptions[subIndex];
        const customer = mockCustomers.find(c => c.id === subscription.customerId);

        // 1. Create a new paid invoice
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const newInvoice: Invoice = {
            id: `inv-renewal-${Date.now()}`,
            subscriptionId: subscription.id,
            customerId: subscription.customerId,
            amount: subscription.renewalAmount,
            issueDate: todayStr,
            paymentDate: todayStr, // Mark as paid immediately
        };
        mockInvoices.unshift(newInvoice);

        // 2. Check for referral and create commission
        if (customer?.referredByUserId) {
            const newCommission: Commission = {
                id: `com-renewal-${Date.now()}`,
                userId: customer.referredByUserId,
                customerId: customer.id,
                invoiceId: newInvoice.id,
                amount: newInvoice.amount * 0.20, // 20% commission
                date: todayStr,
            };
            mockCommissions.unshift(newCommission);
            console.log("Generated renewal commission:", newCommission);
        }

        // 3. Update the subscription's renewal and billing dates
        const currentRenewal = new Date(subscription.nextRenewalDate);
        let newRenewalDate: Date;

        // If the old renewal date is in the past, base the new one on today's date
        const baseDate = currentRenewal < now ? now : currentRenewal;

        switch (subscription.plan) {
            case SubscriptionPlan.MONTHLY:
                newRenewalDate = new Date(baseDate.setMonth(baseDate.getMonth() + 1));
                break;
            case SubscriptionPlan.QUARTERLY:
                newRenewalDate = new Date(baseDate.setMonth(baseDate.getMonth() + 3));
                break;
            case SubscriptionPlan.YEARLY:
            default:
                newRenewalDate = new Date(baseDate.setFullYear(baseDate.getFullYear() + 1));
        }

        const newRenewalDateStr = newRenewalDate.toISOString().split('T')[0];
        mockSubscriptions[subIndex].nextRenewalDate = newRenewalDateStr;
        mockSubscriptions[subIndex].nextBillingDate = newRenewalDateStr;

        console.log(`Payment processed for ${subscription.id}. New renewal date: ${newRenewalDateStr}`);
        return { success: true, message: 'Renewal payment successful!' };
    },
    getInvoicesForCustomer: async (customerId: string): Promise<Invoice[]> => {
        generateRecurringInvoices(); // Simulate check before fetching
        return mockInvoices.filter(inv => inv.customerId === customerId);
    },
     changeSubscriptionPlan: async (subscriptionId: string, newPlan: SubscriptionPlan): Promise<{ success: boolean, message: string }> => {
        const subIndex = mockSubscriptions.findIndex(s => s.id === subscriptionId);
        if (subIndex === -1) {
            return { success: false, message: 'Subscription not found.' };
        }

        const subscription = mockSubscriptions[subIndex];
        const software = mockSoftware.find(sw => sw.id === subscription.softwareId);

        if (!software) {
            return { success: false, message: 'Associated software not found.' };
        }

        if (subscription.plan === newPlan) {
            return { success: false, message: 'Cannot change to the same plan.' };
        }

        // Update the plan and renewal amount for the next cycle
        mockSubscriptions[subIndex].plan = newPlan;
        mockSubscriptions[subIndex].renewalAmount = software.pricing[newPlan];

        console.log(`Plan for subscription ${subscriptionId} changed to ${newPlan}. New renewal amount: ${software.pricing[newPlan]}`);
        
        return { success: true, message: 'Subscription plan updated successfully.' };
    },
};