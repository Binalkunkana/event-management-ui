import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.container}>
                    <div style={styles.glassCard}>
                        <div style={styles.iconContainer}>
                            <svg
                                width="64"
                                height="64"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#ff4d4d"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <h1 style={styles.title}>Oops! Something went wrong.</h1>
                        <p style={styles.message}>
                            We encountered an unexpected error while rendering this page.
                            Our team has been notified.
                        </p>
                        <div style={styles.buttonContainer}>
                            <button
                                onClick={this.handleReset}
                                style={styles.button}
                            >
                                Back to Home
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                style={styles.secondaryButton}
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        fontFamily: "'Inter', sans-serif",
        padding: '20px',
    },
    glassCard: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px border rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    },
    iconContainer: {
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'center',
    },
    title: {
        color: '#f8fafc',
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: '16px',
        letterSpacing: '-0.025em',
    },
    message: {
        color: '#94a3b8',
        fontSize: '16px',
        lineHeight: '1.6',
        marginBottom: '32px',
    },
    buttonContainer: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
    },
    button: {
        background: '#3b82f6',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
    },
    secondaryButton: {
        background: 'transparent',
        color: '#f8fafc',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    }
};

export default ErrorBoundary;
