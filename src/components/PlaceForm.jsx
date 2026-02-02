import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPlace, updatePlace, getPlaceById } from "../api/placeApi";

const PlaceForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [place, setPlace] = useState({
        placeName: "",
        placeDescription: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPlace();
        }
    }, [id]);

    const fetchPlace = async () => {
        try {
            const res = await getPlaceById(id);
            if (res.data.data) {
                setPlace(res.data.data);
            }
        } catch (error) {
            console.error("Failed to load place", error);
            alert("Failed to load place data");
        }
    };

    const handleChange = (e) => {
        setPlace({ ...place, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await updatePlace(id, place);
                alert("Place updated successfully!");
            } else {
                await createPlace(place);
                alert("Place created successfully!");
            }
            navigate("/admin/places");
        } catch (error) {
            console.error("Error saving place", error);
            alert("Failed to save place");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h3 className="mb-4 text-center">{id ? "Edit Place" : "Add Place"}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Place Name</label>
                                    <input
                                        type="text"
                                        name="placeName"
                                        className="form-control"
                                        value={place.placeName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        name="placeDescription"
                                        className="form-control"
                                        value={place.placeDescription}
                                        onChange={handleChange}
                                        rows="3"
                                        required
                                    ></textarea>
                                </div>
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? "Saving..." : (id ? "Update Place" : "Create Place")}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/places")}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceForm;
