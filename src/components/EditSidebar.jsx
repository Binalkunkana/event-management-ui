import { useState, useEffect } from "react";

const EditSidebar = ({ isOpen, onClose, title, children, onSave, loading }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    if (!isOpen && !isAnimating) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`sidebar-backdrop ${isAnimating && isOpen ? 'active' : ''}`}
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1050,
                    opacity: isAnimating && isOpen ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: isAnimating && isOpen ? 'auto' : 'none'
                }}
            />

            {/* Sidebar */}
            <div
                className={`edit-sidebar ${isAnimating && isOpen ? 'open' : ''}`}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: isAnimating && isOpen ? 0 : '-500px',
                    width: '500px',
                    maxWidth: '90vw',
                    height: '100vh',
                    backgroundColor: 'var(--matdash-bg-white)',
                    boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
                    zIndex: 1051,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'right 0.3s ease',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--matdash-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h3 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: 'var(--matdash-text-dark)',
                        margin: 0
                    }}>
                        {title}
                    </h3>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            color: 'var(--matdash-text-muted)',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            lineHeight: 1
                        }}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px'
                }}>
                    {children}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px 24px',
                    borderTop: '1px solid var(--matdash-border)',
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={handleClose}
                        className="btn-matdash btn-matdash-outline"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="btn-matdash btn-matdash-primary"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default EditSidebar;
