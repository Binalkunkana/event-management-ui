import { useState } from "react";
import UserList from "../components/UserList";
import UserForm from "../components/UserForm";

export default function UserPage() {
  const [selectedUserId, setSelectedUserId] = useState(null);

  return (
    <div className="row">
      <div className="col-md-7">
        <UserList onEdit={setSelectedUserId} />
      </div>
      <div className="col-md-5">
        <UserForm
          userId={selectedUserId}
          onSuccess={() => setSelectedUserId(null)}
        />
      </div>
    </div>
  );
}
