export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER', // Sales/Team Member
    CUSTOMER = 'CUSTOMER',
}

export enum SubscriptionPlan {
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    YEARLY = 'YEARLY',
}

export enum ProjectStatus {
    REVIEW = 'REVIEW',
    PENDING = 'PENDING',
    TRAINING = 'TRAINING',
    COMPLETE = 'COMPLETE',
}

export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    CLOSED = 'CLOSED',
}

export enum TicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

export enum NotificationType {
    NEW_TICKET = 'NEW_TICKET',
    TASK_DUE_SOON = 'TASK_DUE_SOON',
    TASK_OVERDUE = 'TASK_OVERDUE',
}


export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar: string;
    referralLink?: string;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    company: string;
    signupDate: string;
    assignedToUserId?: string;
    referredByUserId?: string;
    mobile?: string;
    whatsapp?: string;
    city?: string;
    state?: string;
    pin?: string;
}

export interface Software {
    id: string;
    name: string;
    description: string;
    category: string;
    targetIndustries: string[];
    features: string[];
    demoVideoUrl: string;
    pricing: {
        [plan in SubscriptionPlan]: number;
    };
    setupFee: number;
}

export interface Subscription {
    id: string;
    customerId: string;
    softwareId: string;
    plan: SubscriptionPlan;
    startDate: string;
    nextRenewalDate: string;
    nextBillingDate: string;
    renewalAmount: number;
    onboardingDate: string;
    trainingDate: string;
    status: ProjectStatus;
    nextActionDate?: string; // YYYY-MM-DD
}

export interface Invoice {
    id: string;
    subscriptionId: string;
    customerId: string;
    amount: number;
    issueDate: string;
    paymentDate?: string;
}

export interface Commission {
    id: string;
    userId: string;
    customerId: string;
    invoiceId: string;
    amount: number;
    date: string;
}

export interface DiscountCoupon {
    id: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    validFrom: string; // YYYY-MM-DD
    validUntil: string; // YYYY-MM-DD
    isActive: boolean;
    applicableSoftwareIds: string[]; // Empty array means applicable to all
}

export interface SupportTicket {
    id: string;
    creatorId: string; // ID of the User who created the ticket (can be a customer or a sales user)
    relatedCustomerId?: string; // Optional: If the ticket is about a specific customer
    subject: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: string; // ISO String
    updatedAt: string; // ISO String
    assignedToId?: string; // ID of admin/support user
    dueDate?: string; // YYYY-MM-DD
}

export interface TicketReply {
    id: string;
    ticketId: string;
    userId: string; // ID of user who replied (customer, admin, or support)
    message: string;
    createdAt: string; // ISO String
}

export interface Notification {
    id: string;
    userId: string; // The user who receives the notification
    ticketId: string;
    title: string;
    message: string;
    createdAt: string; // ISO String
    isRead: boolean;
    type?: NotificationType;
}