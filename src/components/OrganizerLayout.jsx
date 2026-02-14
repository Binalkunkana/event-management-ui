import OrganizerSidebar from "./OrganizerSidebar";
import AdminHeader from "./AdminHeader";
import "../styles/matdash-theme.css";

const OrganizerLayout = ({ children }) => {
    return (
        <div className="admin-layout">
            <OrganizerSidebar />
            <main className="admin-content">
                <AdminHeader />
                <div className="admin-content-body">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default OrganizerLayout;
