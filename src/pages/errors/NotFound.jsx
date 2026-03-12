import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <style>
                {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
          @keyframes softPulse {
            0% { transform: scale(1); opacity: 0.1; }
            50% { transform: scale(1.1); opacity: 0.15; }
            100% { transform: scale(1); opacity: 0.1; }
          }
          .floating-404 {
            animation: float 5s ease-in-out infinite;
          }
          .pulse-glow {
            animation: softPulse 4s ease-in-out infinite;
          }
          .btn-ef:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.06);
          }
        `}
            </style>

            {/* Background Blurs consistent with EventFlow theme */}
            <div style={{ ...styles.blurCircle, ...styles.blurTeal }}></div>
            <div style={{ ...styles.blurCircle, ...styles.blurLavender }}></div>

            <div style={styles.glassCard}>
                <div className="floating-404" style={styles.errorCode}>
                    4<span style={{ color: '#4DB6AC' }}>0</span>4
                </div>

                <div style={styles.content}>
                    <h1 style={styles.title}>
                        Oops! Page Not Found<span style={{ color: '#4DB6AC' }}>.</span>
                    </h1>
                    <p style={styles.message}>
                        The event you're looking for might have been rescheduled, moved, or never existed in the first place.
                    </p>

                    <div style={styles.buttonGroup}>
                        <button
                            onClick={() => navigate('/')}
                            style={styles.primaryButton}
                            className="btn-ef"
                        >
                            Back to Home
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            style={styles.secondaryButton}
                            className="btn-ef"
                        >
                            Go Back
                        </button>
                    </div>
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
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)',
        zIndex: 10,
        position: 'relative',
    },
    errorCode: {
        fontSize: '140px',
        fontWeight: '900',
        color: '#111111',
        lineHeight: '1',
        marginBottom: '24px',
        letterSpacing: '-0.05em',
        display: 'inline-block',
    },
    content: {
        position: 'relative',
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
        fontSize: '18px',
        lineHeight: '1.6',
        marginBottom: '40px',
        maxWidth: '450px',
        marginRight: 'auto',
        marginLeft: 'auto',
    },
    buttonGroup: {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap',
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
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
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
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        filter: 'blur(80px)',
        zIndex: 1,
    },
    blurTeal: {
        background: '#4DB6AC',
        top: '-100px',
        right: '-100px',
        opacity: 0.1,
    },
    blurLavender: {
        background: '#9575CD',
        bottom: '-100px',
        left: '-100px',
        opacity: 0.1,
    }
};

export default NotFound;
