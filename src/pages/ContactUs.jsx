import React from 'react';
import "../index.css";

const ContactUs = () => {
    return (
        <div className="contact-us-page py-5">
            <div className="container">
                <div className="row justify-content-center text-center mb-5 animate-ef">
                    <div className="col-lg-8">
                        <div className="d-inline-flex align-items-center gap-2 ef-badge mb-4 py-2 px-3" style={{ backgroundColor: 'rgba(149, 117, 205, 0.1)', color: 'var(--ef-accent-lavender)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>alternate_email</span>
                            <span className="fw-800 small text-uppercase" style={{ letterSpacing: '0.1em' }}>Get in Touch</span>
                        </div>
                        <h1 className="display-4 fw-800 mb-4">We'd Love to Hear From You</h1>
                        <p className="lead text-secondary">
                            Have questions about an event or interest in partnering with us? Our team is here to help you navigate through the EventFlow.
                        </p>
                    </div>
                </div>

                <div className="row g-5">
                    <div className="col-lg-5 animate-ef" style={{ animationDelay: '0.1s' }}>
                        <div className="mb-5">
                            <h4 className="fw-800 mb-4">Contact Information</h4>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="bg-white shadow-sm rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                    <span className="material-symbols-outlined text-dark">mail</span>
                                </div>
                                <div>
                                    <span className="ef-label mb-0">Email Us</span>
                                    <p className="fw-600 mb-0">hello@eventflow.com</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="bg-white shadow-sm rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                    <span className="material-symbols-outlined text-dark">call</span>
                                </div>
                                <div>
                                    <span className="ef-label mb-0">Call Us</span>
                                    <p className="fw-600 mb-0">+91 98765 43210</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-white shadow-sm rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                    <span className="material-symbols-outlined text-dark">location_on</span>
                                </div>
                                <div>
                                    <span className="ef-label mb-0">Visit Us</span>
                                    <p className="fw-600 mb-0">123 Experience Way, Tech Hub, <br />Ahmedabad, Gujarat 380001</p>
                                </div>
                            </div>
                        </div>

                        <div className="ef-card p-4" style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderStyle: 'dashed' }}>
                            <h5 className="fw-800 mb-2">Support Hours</h5>
                            <p className="text-secondary small mb-0">Our dedicated support team is available Monday through Friday, 9:00 AM to 6:00 PM IST.</p>
                        </div>
                    </div>

                    <div className="col-lg-7 animate-ef" style={{ animationDelay: '0.2s' }}>
                        <div className="ef-card">
                            <h4 className="fw-800 mb-4">Send a Message</h4>
                            <form>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="ef-label">Full Name</label>
                                        <input type="text" className="ef-input" placeholder="John Doe" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="ef-label">Email Address</label>
                                        <input type="email" className="ef-input" placeholder="john@example.com" />
                                    </div>
                                    <div className="col-12">
                                        <label className="ef-label">Subject</label>
                                        <input type="text" className="ef-input" placeholder="How can we help?" />
                                    </div>
                                    <div className="col-12">
                                        <label className="ef-label">Message</label>
                                        <textarea className="ef-input" rows="5" placeholder="Tell us more about your inquiry..."></textarea>
                                    </div>
                                    <div className="col-12 mt-4">
                                        <button className="btn-pill btn-primary w-100 py-3">Send Message</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
