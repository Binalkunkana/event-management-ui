import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServerError = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <style>
                {`
          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .entry-animation {
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .btn-ef:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.06);
          }
        `}
            </style>

            {/* Background Blurs for light theme */}
            <div style={{ ...styles.blurCircle, ...styles.blurRed }}></div>
            <div style={{ ...styles.blurCircle, ...styles.blurOrange }}></div>

            <div className="entry-animation" style={styles.glassCard}>
                <div style={styles.iconContainer}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF8A65" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>

                <h1 style={styles.title}>System Interruption<span style={{ color: '#FF8A65' }}>.</span></h1>
                <p style={styles.message}>
                    Our systems are taking a quick breather. We're working on getting everything back on track for your next event.
                </p>

                <div style={styles.buttonGroup}>
                    <button
                        onClick={() => window.location.reload()}
                        style={styles.primaryButton}
                        className="btn-ef"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        style={styles.secondaryButton}
                        className="btn-ef"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#F8F9FB',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
    },
    glassCard: {
        background: '#FFFFFF',
        border: '1px solid #E0E0E0',
        borderRadius: '32px',
        padding: '60px 40px',
        maxWidth: '550px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)',
        zIndex: 10,
        position: 'relative',
    },
    iconContainer: {
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'center',
    },
    title: {
        color: '#111111',
        fontSize: '32px',
        fontWeight: '800',
        marginBottom: '16px',
        letterSpacing: '-0.02em',
    },
    message: {
        color: '#555555',
        fontSize: '17px',
        lineHeight: '1.7',
        marginBottom: '40px',
        maxWidth: '400px',
        marginRight: 'auto',
        marginLeft: 'auto',
    },
    buttonGroup: {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
    },
    primaryButton: {
        background: '#111111',
        color: '#FFFFFF',
        border: 'none',
        padding: '16px 32px',
        borderRadius: '9999px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    secondaryButton: {
        background: 'transparent',
        color: '#111111',
        border: '2px solid #E0E0E0',
        padding: '14px 32px',
        borderRadius: '9999px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    blurCircle: {
        position: 'absolute',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        filter: 'blur(100px)',
        zIndex: 1,
    },
    blurRed: {
        background: '#FF8A65',
        top: '-150px',
        left: '-50px',
        opacity: 0.08,
    },
    blurOrange: {
        background: '#FFB74D',
        bottom: '-150px',
        right: '-50px',
        opacity: 0.08,
    }
};

export default ServerError;
