import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createCategory, updateCategory, getCategoryById } from "../api/categoryApi";
import CategoryList from "./CategoryList";

const CategoryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState({
        categoryName: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            const res = await getCategoryById(id);
            if (res.data.data) {
                setCategory(res.data.data);
            }
        } catch (error) {
            console.error("Failed to load category", error);
            alert("Failed to load category data");
        }
    };

    const handleChange = (e) => {
        setCategory({ ...category, [e.target.name]: e.target.value });
    };
    // Helper for "add new category" mode - resets form for add
    // You can call this to reset the category state for adding a new category (not strictly needed if used as a dedicated 'add' route)
    const handleAddCategory = () => {
        setCategory({
            categoryName: ""
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await updateCategory(id, category);
                alert("Category updated successfully!");
            } else {
                await createCategory(category);
                alert("Category created successfully!");
            }
            navigate("/admin/categories");
        } catch (error) {
            console.error("Error saving category", error);
            alert("Failed to save category");
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
                            <h3 className="mb-4 text-center">{id ? "Edit Category" : "Add Category"}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Category Name</label>
                                    <input
                                        type="text"
                                        name="categoryName"
                                        className="form-control"
                                        value={category.categoryName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? "Saving..." : (id ? "Update Category" : "Create Category")}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => navigate(<CategoryList/>)}>
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

export default CategoryForm;
