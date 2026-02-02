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
    const navigate = useNavigate();

    useEffect(() => {
        fetchFilters();
    }, []);

    const fetchFilters = async () => {
        try {
            const [catRes, placeRes] = await Promise.all([
                getAllCategories(),
                getAllPlaces(),
            ]);
            setCategories(catRes.data.data || []);
            setPlaces(placeRes.data.data || []);
        } catch (error) {
            console.error("Failed to load filters", error);
        }
    };

    const handleSearch = () => {
        navigate(`/events?category=${selectedCategory}&place=${selectedPlace}`);
    };

    return (
        <div className="landing-page">
            <div className="hero-manup">
                <div className="container">
                    <div className="row align-items-center">
                        {/* Left Content */}
                        <div className="col-lg-6 hero-text-content animate-slide-up">
                            <span className="hero-date">5 TO 9 MAY 2026, MARDAVALL HOTEL, NEW YORK</span>
                            <h1 className="hero-heading text-white">
                                Change Your Mind <br /> To Become Success
                            </h1>
                            <button className="btn-hero-cta mb-5" onClick={() => document.getElementById('search-widget').scrollIntoView({ behavior: 'smooth' })}>
                                Buy Ticket
                            </button>

                            {/* Search Widget Integrated here or below */}
                            <div id="search-widget" className="landing-search-overlay mt-4">
                                <h5 className="text-white mb-3">Find Your Next Event</h5>
                                <div className="row g-2">
                                    <div className="col-md-5">
                                        <select
                                            className="form-select border-0"
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.eventCategoryId} value={cat.eventCategoryId}>
                                                    {cat.eventCategoryName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <select
                                            className="form-select border-0"
                                            value={selectedPlace}
                                            onChange={(e) => setSelectedPlace(e.target.value)}
                                        >
                                            <option value="">Select Place</option>
                                            {places.map((place) => (
                                                <option key={place.placeId} value={place.placeId}>
                                                    {place.placeName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <button className="btn btn-warning w-100 fw-bold" onClick={handleSearch}>
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Image (Man) */}
                        <div className="col-lg-6 d-none d-lg-block text-end">
                            {/* Placeholder for the "Man" image from the template */}
                            <img
                                src="https://mediacity.co.in/manup/img/bg-img/man.png"
                                alt="Speaker"
                                className="hero-man-image img-fluid"
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800' }} // Fallback if direct link fails
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
