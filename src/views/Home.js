import React from "react";
import { Link } from "react-router-dom";

export default function Home() {

  return (
    <div className="body-custom">
      <h2>Facial Recognition App</h2>
      <Link className="btn btn-primary mt-2 col-5" to="/photo">
        Photo
      </Link>
      <br/>
      <Link className="btn btn-primary mt-2 col-5" to="/camera">
        Camera
      </Link>
      <br/>
      <Link className="btn btn-primary mt-2 col-5" to="/train">
        Train Face With Camera
      </Link>
    </div>
  );
}
