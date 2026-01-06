import React from "react";
import { useAuth } from "../auth/AuthContext";

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <div className="home-card">
        <div>
          <span className="badge">Authenticated</span>
          <h1>Welcome to ReMarket</h1>
          <p>Registration and login are ready. Next, we can build listings.</p>
        </div>
        <div>
          <strong>Signed in as:</strong>
          <div>{user ? `${user.firstName} ${user.lastName}` : ""}</div>
          <div>{user?.email}</div>
          <div>{user?.phone}</div>
          <div>{user?.address}</div>
          {user?.role ? <div>Role: {user.role}</div> : null}
        </div>
        <button className="secondary-btn" type="button" onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Home;
