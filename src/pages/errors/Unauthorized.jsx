import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <style>
                {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
          }
          .lock-animation {
            animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
            animation-delay: 1.5s;
          }
          .btn-ef:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.06);
          }
        `}
            </style>

            {/* Background Blurs for light theme */}
            <div style={{ ...styles.blurCircle, ...styles.blurAmber }}></div>
            <div style={{ ...styles.blurCircle, ...styles.blurIndigo }}></div>

            <div style={styles.glassCard}>
                <div className="lock-animation" style={styles.iconContainer}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#FFA726" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>

                <h1 style={styles.title}>You're <span style={{ color: '#FFA726' }}>Unauthorized.</span></h1>
                <p style={styles.message}>
                    Access Denied. You do not have the required permissions to view this event management section.
                </p>

                <div style={styles.buttonGroup}>
                    <button
                        onClick={() => navigate('/login')}
                        style={styles.primaryButton}
                        className="btn-ef"
                    >
                        Go to Login Page
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        style={styles.secondaryButton}
                        className="btn-ef"
                    >
                        Go Back
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
        background: '#FFF8E1',
        width: '100px',
        height: '100px',
        borderRadius: '32px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto 32px',
        border: '1px solid #FFECB3',
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
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        maxWidth: '300px',
        margin: '0 auto',
    },
    primaryButton: {
        background: '#111111',
        color: '#FFFFFF',
        border: 'none',
        padding: '16px 32px',
        borderRadius: '12px',
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
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    blurCircle: {
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        filter: 'blur(100px)',
        zIndex: 1,
    },
    blurAmber: {
        background: '#FFA726',
        top: '-200px',
        left: '-100px',
        opacity: 0.06,
    },
    blurIndigo: {
        background: '#5C6BC0',
        bottom: '-200px',
        right: '-100px',
        opacity: 0.06,
    }
};

export default Unauthorized;
