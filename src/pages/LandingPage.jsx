import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategories } from "../api/categoryApi";
import { getAllPlaces } from "../api/placeApi";
import "../index.css";

const LandingPage = () => {
    const [categories, setCategories] = useState([]);
    const [places, setPlaces] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedPlace, setSelectedPlace] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchFilters();
    }, []);

    const fetchFilters = async () => {
        try {
            const [catRes, placeRes] = await Promise.all([
                getAllCategories().catch(() => ({ data: { data: [] } })),
                getAllPlaces().catch(() => ({ data: { data: [] } })),
            ]);

            const catData = catRes.data.data || catRes.data || [];
            const placeData = placeRes.data.data || placeRes.data || [];

            setCategories(Array.isArray(catData) ? catData : []);
            setPlaces(Array.isArray(placeData) ? placeData : []);
        } catch (error) {
            console.error("Failed to load filters", error);
        }
    };

    const handleSearch = () => {
        navigate(`/events?category=${selectedCategory}&place=${selectedPlace}&date=${selectedDate}`);
    };

    return (
        <div className="landing-page position-relative overflow-hidden">
            {/* Hero Section */}
            <section className="ef-hero d-flex align-items-center min-vh-100 position-relative">
                {/* Enhanced background blurs */}
                <div className="ef-hero-bg-blur blur-teal position-absolute" style={{ top: '-10%', right: '5%', opacity: '0.6' }}></div>
                <div className="ef-hero-bg-blur blur-lavender position-absolute" style={{ bottom: '-10%', left: '5%', opacity: '0.6' }}></div>
                <div className="ef-hero-bg-blur blur-peach position-absolute" style={{ top: '20%', left: '40%', width: '400px', height: '400px', backgroundColor: 'rgba(255, 182, 193, 0.4)' }}></div>

                <div className="container position-relative z-1">
                    <div className="row justify-content-center">
                        <div className="col-lg-10 text-center animate-ef">
                            <div className="d-inline-flex align-items-center gap-2 ef-badge mb-4 py-2 px-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', color: 'var(--ef-text-primary)' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>celebration</span>
                                <span className="fw-800 small text-uppercase" style={{ letterSpacing: '0.1em' }}>New Era of Experiences</span>
                            </div>

                            <h1 className="display-1 fw-800 mb-4" style={{ letterSpacing: '-0.05em', lineHeight: '1' }}>
                                Design Your <br />
                                Perfect <span style={{ color: 'var(--ef-accent-teal)', position: 'relative' }}>
                                    EventFlow
                                    <svg viewBox="0 0 200 20" className="position-absolute start-0 bottom-0 w-100" style={{ height: '15px', zIndex: '-1' }}>
                                        <path d="M0 15 Q50 5 100 15 T200 15" fill="none" stroke="var(--ef-accent-teal)" strokeWidth="4" opacity="0.3" />
                                    </svg>
                                </span>
                            </h1>

                            <p className="lead text-secondary mb-5 mx-auto lh-lg" style={{ maxWidth: '650px', fontSize: '1.25rem' }}>
                                The modern benchmark for event orchestration. Seamlessly discover, curate, and book world-class gatherings through an interface built for the future.
                            </p>

                            <div className="d-flex flex-wrap gap-4 justify-content-center mb-5 pb-4">
                                <button className="btn-pill btn-primary px-5 py-3 shadow-lg" onClick={() => document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' })}>
                                    Start Exploring
                                </button>
                                <button className="btn-pill btn-outline px-5 py-3 bg-white" onClick={() => navigate('/events')}>
                                    Learn Our Process
                                </button>
                            </div>

                            {/* Minimalist Search Bar - Elevated */}
                            <div id="search-section" className="ef-card p-2 mx-auto animate-ef shadow-xl" style={{ maxWidth: '1000px', animationDelay: '0.2s', borderRadius: '30px' }}>
                                <div className="row g-2 p-2">
                                    <div className="col-lg-4">
                                        <div className="position-relative h-100">
                                            <span className="position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary material-symbols-outlined" style={{ fontSize: '20px' }}>category</span>
                                            <select
                                                className="ef-input ps-5 h-100"
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                style={{ border: 'none', backgroundColor: '#f9f9f9' }}
                                            >
                                                <option value="">Any Category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.eventCategoryId || cat.EventCategoryId} value={cat.eventCategoryId || cat.EventCategoryId}>
                                                        {cat.eventCategoryName || cat.EventCategoryName || cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-lg-3">
                                        <div className="position-relative h-100">
                                            <span className="position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary material-symbols-outlined" style={{ fontSize: '20px' }}>location_on</span>
                                            <select
                                                className="ef-input ps-5 h-100"
                                                value={selectedPlace}
                                                onChange={(e) => setSelectedPlace(e.target.value)}
                                                style={{ border: 'none', backgroundColor: '#f9f9f9' }}
                                            >
                                                <option value="">Everywhere</option>
                                                {places.map((place) => (
                                                    <option key={place.placeId || place.PlaceId} value={place.placeId || place.PlaceId}>
                                                        {place.placeName || place.PlaceName || place.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-lg-3">
                                        <div className="position-relative h-100">
                                            <span className="position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_month</span>
                                            <input
                                                type="date"
                                                className="ef-input ps-5 h-100"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                style={{ border: 'none', backgroundColor: '#f9f9f9' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-2">
                                        <button className="btn-pill btn-primary w-100 h-100 py-3 d-flex align-items-center justify-content-center gap-2" onClick={handleSearch}>
                                            <span className="material-symbols-outlined">search</span>
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
