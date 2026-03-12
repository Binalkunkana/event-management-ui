import React from 'react';
import "../index.css";

const AboutUs = () => {
    return (
        <div className="about-us-page py-5">
            <div className="container">
                <div className="row justify-content-center text-center mb-5 animate-ef">
                    <div className="col-lg-8">
                        <div className="d-inline-flex align-items-center gap-2 ef-badge mb-4 py-2 px-3" style={{ backgroundColor: 'rgba(77, 182, 172, 0.1)', color: 'var(--ef-accent-teal)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history_edu</span>
                            <span className="fw-800 small text-uppercase" style={{ letterSpacing: '0.1em' }}>Our Story</span>
                        </div>
                        <h1 className="display-4 fw-800 mb-4">Elevating Every Event Flow</h1>
                        <p className="lead text-secondary lh-lg">
                            EventFlow was born from a simple observation: the world's most memorable moments deserve an interface that's just as inspiring. We've built a platform that bridges the gap between sophisticated event management and effortless discovery.
                        </p>
                    </div>
                </div>

                <div className="row g-4 mb-5">
                    <div className="col-md-4 animate-ef" style={{ animationDelay: '0.1s' }}>
                        <div className="ef-card h-100">
                            <span className="material-symbols-outlined text-primary mb-3" style={{ fontSize: '40px' }}>auto_awesome</span>
                            <h4 className="fw-800 mb-3">Visionary Design</h4>
                            <p className="text-secondary small">We believe aesthetics and functionality should coexist. Our platform is crafted with a minimalist, premium aesthetic that lets your events shine.</p>
                        </div>
                    </div>
                    <div className="col-md-4 animate-ef" style={{ animationDelay: '0.2s' }}>
                        <div className="ef-card h-100">
                            <span className="material-symbols-outlined text-primary mb-3" style={{ fontSize: '40px' }}>bolt</span>
                            <h4 className="fw-800 mb-3">Seamless Process</h4>
                            <p className="text-secondary small">From discovery to booking, every interaction is optimized for speed and clarity. No friction, just pure event orchestration.</p>
                        </div>
                    </div>
                    <div className="col-md-4 animate-ef" style={{ animationDelay: '0.3s' }}>
                        <div className="ef-card h-100">
                            <span className="material-symbols-outlined text-primary mb-3" style={{ fontSize: '40px' }}>group</span>
                            <h4 className="fw-800 mb-3">Community First</h4>
                            <p className="text-secondary small">We empower organizers and guests alike, creating a vibrant ecosystem where experiences are shared and memories are made.</p>
                        </div>
                    </div>
                </div>

                <div className="ef-card p-5 animate-ef" style={{ background: 'linear-gradient(135deg, #111 0%, #333 100%)', color: 'white', animationDelay: '0.4s' }}>
                    <div className="row align-items-center">
                        <div className="col-lg-7">
                            <h2 className="text-white mb-3">Join the Future of Events</h2>
                            <p className="text-light opacity-75 mb-0">Whether you're planning a corporate gala or a local workshop, EventFlow provides the tools and the canvas to make it extraordinary.</p>
                        </div>
                        <div className="col-lg-5 text-lg-end mt-4 mt-lg-0">
                            <button className="btn-pill bg-white text-dark border-0 px-5 py-3">Explore Events</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
