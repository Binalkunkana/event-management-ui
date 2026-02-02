import React, { useEffect, useState } from 'react';
import { getAllScheduledEvents } from '../api/eventApi';

const UserDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data enrichment for the UI since the basic API might not have all fields in the design
    const enrichEvent = (evt) => ({
        ...evt,
        price: evt.price || (Math.random() > 0.5 ? "Free" : `$${Math.floor(Math.random() * 50) + 10}`),
        organizer: evt.organizer || "Rocky Mountain Roasting Co.",
        image: evt.imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        type: evt.type || "Online Event",
        rating: Math.floor(Math.random() * 50) + 50, // 50-100%
        recommended: 100
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            // Un-comment when real API is ready
            // const response = await getAllScheduledEvents();
            // setEvents(response.data.map(enrichEvent));

            // Using mock data to match the visual perfectly for now
            const mockEvents = Array(6).fill(null).map((_, i) => enrichEvent({
                id: i,
                title: "Broomfield Youth Symphony Fundraiser",
                date: new Date().toISOString(),
                location: "Bozeman, MT Street 59718, USA"
            }));
            setEvents(mockEvents);

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '2rem' }}>
            <div className="row">
                {/* Sidebar Filters */}
                <div className="col-md-3">
                    <div className="bg-white p-4 rounded shadow-sm">
                        <h5 className="mb-4 fw-bold">Filter Events</h5>

                        <div className="mb-3">
                            <label className="form-label fw-bold small">Location</label>
                            <select className="form-select">
                                <option>India</option>
                                <option>USA</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold small">Name</label>
                            <select className="form-select">
                                <option>Model</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold small">Date</label>
                            <div className="d-flex gap-2">
                                <input type="text" className="form-control" placeholder="From" />
                                <input type="text" className="form-control" placeholder="To" />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold small">Event Type</label>
                            <select className="form-select">
                                <option>Type</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold small">Event Type</label>
                            <select className="form-select">
                                <option>Paid Event</option>
                                <option>Free Event</option>
                            </select>
                        </div>

                        <button className="btn btn-theme w-100 fw-bold py-2">
                            <i className="bi bi-search me-2"></i>Apply Filters
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-md-9">
                    <div className="bg-white p-4 rounded shadow-sm h-100">
                        {/* Tabs */}
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                            <ul className="nav nav-tabs border-0">
                                <li className="nav-item">
                                    <a className="nav-link active border-0 bg-transparent text-theme fw-bold" style={{ borderBottom: '3px solid var(--theme-orange)' }} href="#">Upcoming Events</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link text-muted border-0" href="#">Past Events</a>
                                </li>
                            </ul>
                            <div className="text-muted small">
                                Sort by: <strong>Recommended</strong>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="row g-4">
                            {events.map((evt, idx) => (
                                <div key={idx} className="col-lg-4 col-md-6">
                                    <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                        <div className="position-relative">
                                            <img src={evt.image} className="card-img-top" alt="Event" style={{ height: '180px', objectFit: 'cover' }} />
                                            <span className="position-absolute top-0 start-0 m-3 badge bg-warning text-dark">{evt.price}</span>
                                            <span className="position-absolute bottom-0 end-0 m-2 badge bg-dark opacity-75">{evt.type}</span>
                                        </div>
                                        <div className="card-body">
                                            <div className="d-flex align-items-center mb-2">
                                                <div className="rounded-circle bg-secondary" style={{ width: 20, height: 20, marginRight: 8 }}></div>
                                                <small className="text-muted">{evt.organizer}</small>
                                            </div>
                                            <h6 className="card-title fw-bold mb-3">{evt.title}</h6>

                                            <div className="d-flex mb-2 small text-muted">
                                                <i className="bi bi-calendar me-2"></i>
                                                <span>13th Jan 2021 - 14th Jan 2021</span>
                                            </div>
                                            <div className="d-flex mb-3 small text-muted">
                                                <i className="bi bi-geo-alt me-2"></i>
                                                <span>{evt.location}</span>
                                            </div>

                                            <div className="mt-3">
                                                <div className="d-flex justify-content-between small mb-1">
                                                    <span>Rating</span>
                                                    <span>{evt.rating}%</span>
                                                </div>
                                                <div className="progress" style={{ height: '4px' }}>
                                                    <div className="progress-bar bg-warning" style={{ width: `${evt.rating}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
