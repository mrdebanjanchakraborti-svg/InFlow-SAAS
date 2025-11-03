import React, { useState, createContext, useMemo, useEffect, useCallback } from 'react';
import { User, UserRole, Notification, NotificationType } from './types';
import { mockUsers, api } from './services/mockApiService';
import AdminPortal from './features/admin/AdminPortal';
import UserPortal from './features/user/UserPortal';
import CustomerPortal from './features/customer/CustomerPortal';
import LandingPage from './features/landing/LandingPage';
import SystemDesignPage from './features/system/SystemDesignPage';
import RegistrationPage from './features/auth/RegistrationPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';


// Simple Auth Context
export const AuthContext = createContext<{ user: User | null; login: (user: User) => void; logout: () => void; }>({
    user: null,
    login: () => {},
    logout: () => {},
});

const LOGO_BASE64 = "data:image/png;base64,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yL+f93+v53530L/X3P/F+f/i/O/1PyH+X+2+J9m/3/0/0/W/9vy/5f336n+/+x+wPwvyf8D9L96/9/Y/7e1/9cy//9y/v+f/l+3/8/+X+H/y+f/3fr/+fj/n/L/Rfh/p/vfW/+/s/+3j/+3sv/X7/9n5L9j/p+s/7eK/79z/69q/3/M/t/T/t/J/9/G/p+9/yfu/wf+39n9l/L/Cvk/5v73qf8fqf/n5/+/5P+/5P8R/3+q/8++f1/j/y/S/+/6v+f9v2X/X1f/X1L/L/L/y+D/l8P//13//y78v0T+3+L8n+b//zD8/0L9P735n8n/T4n/x/r/mvr/UvnfjfzP1X+R/e/e/zeD/286/u+p//1s+X8u/D8l/h9y/78w+u+r8H5K//dl/L8X/T/m/+vt/+vr/938v9L/S/G/4P8P+/+a+9/K/Q/g/5fk/w/j/0P+P+P/O//fG/w/2P7D6r9p+g9i/k+j/y+p/9fW/zfu/2P2XzP/36P/p/b/qft/Kfl/Yv+/9/8d/n9u/h+6/2+7/7fs/4/4/+v/r+n/i+d/5v0vtv9v8/929990/y/U/7P0/7P8v5b6P3b/J++/YvuP+n+l+d9c/1/m/nf8/h/8f+f9b7b/W/E/yvzf8n+x//+7//vR/7cQQqA+YQSiKCMQAYnKCERQQiACEpURIJjFCIgIRlBEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEIighEQEI/S/.9mD2sAAAAASUVORK5CYII=";


const LoginPage: React.FC<{ onLogin: (user: User) => void, onSwitchToRegister: () => void, onBackToLanding: () => void, onForgotPassword: () => void }> = ({ onLogin, onSwitchToRegister, onBackToLanding, onForgotPassword }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
            <div className="w-full max-w-md bg-base-200 p-8 rounded-xl shadow-lg relative">
                 <img src={LOGO_BASE64} alt="Inflow logo" className="h-12 mx-auto mb-8" />
                <button onClick={onBackToLanding} className="absolute top-4 left-4 text-content-muted hover:text-white">&larr; Back</button>
                <h2 className="text-3xl font-bold text-center text-white mb-8">Select Your Portal</h2>
                <div className="space-y-4">
                    {mockUsers.map(user => (
                        <button
                            key={user.id}
                            onClick={() => onLogin(user)}
                            className="w-full text-left p-4 rounded-lg bg-base-300 hover:bg-brand-primary transition-all duration-300 group"
                        >
                            <p className="font-bold text-lg text-white">{user.name}</p>
                            <p className="text-sm text-content-muted group-hover:text-white">Login as {user.role}</p>
                        </button>
                    ))}
                </div>
                 <div className="text-center mt-4">
                    <button onClick={onForgotPassword} className="text-sm text-brand-primary hover:underline">
                        Forgot Password?
                    </button>
                </div>
                 <p className="text-center mt-4 text-sm text-content-muted">
                    New customer?{' '}
                    <button onClick={onSwitchToRegister} className="font-semibold text-brand-primary hover:underline">
                        Sign up here
                    </button>
                </p>
            </div>
        </div>
    );
};

// Deep link state type
type DeepLinkState = {
    target: 'support';
    ticketId: string;
} | null;

const getNotificationIcon = (type?: NotificationType) => {
    switch (type) {
        case NotificationType.TASK_OVERDUE:
            return '🔥';
        case NotificationType.TASK_DUE_SOON:
            return '⏰';
        case NotificationType.NEW_TICKET:
        default:
            return '📩';
    }
};


const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [page, setPage] = useState<'portal' | 'system'>('portal');
    const [view, setView] = useState<'landing' | 'login' | 'register' | 'forgotPassword' | 'resetPassword'>('landing');
    const [refCode, setRefCode] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [deepLink, setDeepLink] = useState<DeepLinkState>(null);

     useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            setRefCode(ref);
            setView('register'); // Go directly to register if ref link is used
        }
    }, []);
    
    const fetchNotifications = useCallback(async () => {
        if(user) {
            const userNotifications = await api.getNotificationsForUser(user.id);
            setNotifications(userNotifications.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications to simulate real-time updates
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);


    const authContextValue = useMemo(() => ({
        user,
        login: (loggedInUser: User) => {
            setUser(loggedInUser);
        },
        logout: () => {
            setUser(null);
            setPage('portal');
            setView('landing');
            setNotifications([]);
        }
    }), [user]);
    
    const handleLogin = (loggedInUser: User) => {
        authContextValue.login(loggedInUser);
    };

    const handleNotificationClick = async (notification: Notification) => {
        setPage('portal');
        setDeepLink({ target: 'support', ticketId: notification.ticketId });
        setShowNotifications(false);
        await api.markNotificationAsRead(notification.id);
        fetchNotifications(); // Refresh immediately
    };

    const renderPortal = () => {
        if (!user) return null; // Should be handled by the main view logic
        
        const portalProps = {
            deepLink,
            clearDeepLink: () => setDeepLink(null)
        };
        
        switch (user.role) {
            case UserRole.ADMIN:
                return <AdminPortal {...portalProps} />;
            case UserRole.USER:
                return <UserPortal {...portalProps} />;
            case UserRole.CUSTOMER:
                return <CustomerPortal />;
            default:
                 // This case should not be reached when logged in
                return null;
        }
    };
    
    if (!user) {
        switch(view) {
            case 'login':
                return <LoginPage 
                    onLogin={handleLogin} 
                    onSwitchToRegister={() => setView('register')} 
                    onBackToLanding={() => setView('landing')}
                    onForgotPassword={() => setView('forgotPassword')}
                />;
            case 'register':
                return <RegistrationPage onSwitchToLogin={() => setView('login')} initialRefCode={refCode} />;
            case 'forgotPassword':
                return <ForgotPasswordPage onSwitchToLogin={() => setView('login')} onProceedToReset={() => setView('resetPassword')} />;
            case 'resetPassword':
                return <ResetPasswordPage onSwitchToLogin={() => setView('login')} />;
            case 'landing':
            default:
                return <LandingPage onNavigateToLogin={() => setView('login')} onNavigateToRegister={() => setView('register')} />;
        }
    }
    
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <AuthContext.Provider value={authContextValue}>
            <div className="flex">
                <nav className="w-16 md:w-56 bg-base-200 min-h-screen p-2 md:p-4 flex flex-col justify-between">
                    <div>
                        <div className="mb-8 p-2">
                            <img src={LOGO_BASE64} alt="Inflow logo" className="h-8 hidden md:block" />
                            <img src={LOGO_BASE64} alt="Inflow logo" className="h-8 w-8 object-contain md:hidden" />
                        </div>
                        <ul className="space-y-2">
                            <li>
                                <button onClick={() => setPage('portal')} className={`w-full text-left flex items-center p-2 rounded-lg transition-colors ${page === 'portal' ? 'bg-brand-primary text-white' : 'hover:bg-base-300'}`}>
                                    <span className="md:mr-3">🏠</span> <span className="hidden md:inline">Portal</span>
                                </button>
                            </li>
                             {user.role !== UserRole.CUSTOMER && (
                                <li className="relative">
                                    <button onClick={() => setShowNotifications(s => !s)} className={`w-full text-left flex items-center p-2 rounded-lg transition-colors hover:bg-base-300`}>
                                        <span className="md:mr-3 relative">
                                            🔔
                                            {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">{unreadCount}</span>}
                                        </span>
                                        <span className="hidden md:inline">Notifications</span>
                                    </button>
                                    {showNotifications && (
                                        <div className="absolute left-16 top-0 md:left-0 md:top-12 z-20 w-80 bg-base-300 rounded-lg shadow-xl border border-content-muted/20">
                                            <div className="p-3 font-bold text-white border-b border-base-200">Notifications</div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length > 0 ? notifications.map(n => (
                                                    <button key={n.id} onClick={() => handleNotificationClick(n)} className={`w-full text-left p-3 text-sm hover:bg-brand-primary/20 ${!n.isRead ? 'bg-brand-primary/10' : ''}`}>
                                                        <p className="font-bold text-white flex items-center">
                                                            <span className="mr-2">{getNotificationIcon(n.type)}</span>
                                                            {n.title}
                                                        </p>
                                                        <p className="text-content-muted pl-6">{n.message}</p>
                                                        <p className="text-xs text-content-muted/50 mt-1 pl-6">{new Date(n.createdAt).toLocaleString()}</p>
                                                    </button>
                                                )) : <p className="p-4 text-sm text-content-muted">No notifications yet.</p>}
                                            </div>
                                        </div>
                                    )}
                                </li>
                             )}
                            {user.role === UserRole.ADMIN && (
                                <li>
                                    <button onClick={() => setPage('system')} className={`w-full text-left flex items-center p-2 rounded-lg transition-colors ${page === 'system' ? 'bg-brand-primary text-white' : 'hover:bg-base-300'}`}>
                                       <span className="md:mr-3">🛠️</span> <span className="hidden md:inline">System Design</span>
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                     <button onClick={authContextValue.logout} className="w-full text-left flex items-center p-2 rounded-lg transition-colors hover:bg-red-500 hover:text-white">
                         <span className="md:mr-3">🚪</span> <span className="hidden md:inline">Logout</span>
                    </button>
                </nav>
                <main className="flex-1 min-h-screen bg-base-100">
                    {page === 'portal' ? renderPortal() : <SystemDesignPage />}
                </main>
            </div>
        </AuthContext.Provider>
    );
};

export default App;