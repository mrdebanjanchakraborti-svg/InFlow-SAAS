
import React from 'react';

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-base-200 p-6 rounded-lg shadow-lg ${className}`}>
        <h2 className="text-2xl font-bold text-white border-b-2 border-brand-primary pb-2 mb-4">{title}</h2>
        {children}
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
     <div className="text-content space-y-2">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        {children}
    </div>
);

const FlowBox: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-base-300 p-3 rounded-md text-center border border-content-muted ${className}`}>
        {children}
    </div>
);

const Arrow: React.FC<{ direction?: 'down' | 'right' }> = ({ direction = 'down' }) => (
    <div className={`flex justify-center items-center ${direction === 'down' ? 'h-8' : 'w-8'}`}>
        <span className="text-brand-secondary text-2xl">{direction === 'down' ? '↓' : '→'}</span>
    </div>
);

const SystemDesignPage: React.FC = () => {
    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-4xl font-bold text-white">System Design & Workflow</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="System Architecture">
                    <div className="space-y-4">
                        <Section title="Frontend (Client-Side)">
                             <p className="text-sm">Built with <span className="font-bold text-white">React & TypeScript</span> for a modern, type-safe user interface. Styled with <span className="font-bold text-white">Tailwind CSS</span> for a responsive, utility-first design.</p>
                        </Section>
                         <Section title="Backend (Server-Side)">
                             <p className="text-sm">A <span className="font-bold text-white">Node.js/Express</span> server handling business logic, API requests, and authentication. Connects to the database and external services.</p>
                        </Section>
                         <Section title="Database">
                             <p className="text-sm">A <span className="font-bold text-white">Cloud Database</span> (e.g., PostgreSQL or MongoDB) to store all application data including users, customers, subscriptions, and transactions.</p>
                        </Section>
                         <Section title="External Services">
                            <ul className="list-disc list-inside text-sm space-y-1">
                                <li><span className="font-bold text-white">Payment Gateway:</span> Securely processes online payments.</li>
                                <li><span className="font-bold text-white">Email Service:</span> Sends transactional emails (invoices, credentials, reminders).</li>
                                <li><span className="font-bold text-white">WhatsApp API:</span> Sends renewal notifications.</li>
                            </ul>
                        </Section>
                    </div>
                </Card>

                <Card title="Database Table Structure">
                    <div className="space-y-4 text-sm">
                        <p className="italic text-content-muted">This is represented by the interfaces in <span className="font-mono bg-base-300 px-1 rounded">types.ts</span>.</p>
                        <p><strong className="text-white">Users:</strong> id, name, email, password_hash, role, referralLink</p>
                        <p><strong className="text-white">Customers:</strong> id, name, email, company, signupDate, assignedToUserId, referredByUserId</p>
                        <p><strong className="text-white">Software:</strong> id, name, description, features, pricing, setupFee</p>
                        <p><strong className="text-white">Subscriptions:</strong> id, customerId, softwareId, plan, nextRenewalDate, status</p>
                        <p><strong className="text-white">Invoices:</strong> id, subscriptionId, amount, issueDate, status</p>
                        <p><strong className="text-white">Commissions:</strong> id, userId, invoiceId, amount, date</p>
                    </div>
                </Card>

                 <Card title="Customer Journey Workflow" className="lg:col-span-2">
                     <div className="flex flex-col md:flex-row md:space-x-4 items-center justify-around text-sm">
                        <FlowBox>Visits Website</FlowBox>
                        <Arrow direction="right" />
                        <FlowBox>Selects Software & Plan</FlowBox>
                         <Arrow direction="right" />
                        <FlowBox>Makes Payment</FlowBox>
                        <Arrow direction="right" />
                        <FlowBox className="bg-green-900 border-green-500 text-white">Receives Invoice & Login via Email</FlowBox>
                         <Arrow direction="right" />
                        <FlowBox>Accesses Customer Portal</FlowBox>
                    </div>
                </Card>

                <Card title="Email Automation Flow">
                    <div className="flex flex-col items-start space-y-4">
                        <FlowBox>1. Payment Successful</FlowBox>
                        <Arrow />
                        <FlowBox>2. Auto-generate PDF Invoice + Create User Credentials</FlowBox>
                        <Arrow />
                        <FlowBox>3. Send "Welcome" Email with Invoice & Credentials Attached</FlowBox>
                        <Arrow />
                        <FlowBox>4. Schedule Renewal Reminders (7 days & 1 day prior)</FlowBox>
                    </div>
                </Card>

                 <Card title="Commission Calculation Logic">
                     <div className="text-content space-y-4">
                        <p>Commission is calculated at <strong className="text-white">20%</strong> of the total payment amount for both new sign-ups and renewals.</p>
                        <div className="font-mono text-sm bg-base-300 p-4 rounded-md">
                            <p><span className="text-purple-400">WHEN</span> a Customer signs up via a User's Referral Link</p>
                            <p><span className="text-purple-400">AND</span> a successful Payment is made (Invoice amount = <span className="text-yellow-400">X</span>)</p>
                            <p><span className="text-purple-400">THEN</span></p>
                            <p className="pl-4">Commission = <span className="text-yellow-400">X</span> * 0.20</p>
                            <p className="pl-4">Create Commission record for referring User.</p>
                        </div>
                        <p>This logic applies to the initial payment (including setup fee) and all subsequent renewal payments.</p>
                     </div>
                </Card>

            </div>
        </div>
    );
};

export default SystemDesignPage;

