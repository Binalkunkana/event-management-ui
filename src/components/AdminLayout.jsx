import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "../styles/matdash-theme.css";

const AdminLayout = ({ children }) => {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-content">
                <AdminHeader />
                <div className="admin-content-body">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
