
import { Link } from "react-router-dom";
import { FileText, Upload } from "lucide-react";
import PrivateLayout from "../components/PrivateLayout";

export default function Reports() {
  return (
    <PrivateLayout>
      <div className="page-heading">
        <div>
          <h1>Reports</h1>
          <p>Access your data analysis reports.</p>
        </div>
        <Link to="/upload" className="primary-button">
          <Upload size={17} /> Analyze data
        </Link>
      </div>

      <section className="content-card">
        <div className="empty-state">
          <div className="empty-state-icon"><FileText size={25} /></div>
          <h3>No reports created</h3>
          <p>
            Report generation and PDF/Excel export have not been implemented
            yet.
          </p>
          <Link to="/upload" className="primary-button">Analyze a dataset</Link>
        </div>
      </section>
    </PrivateLayout>
  );
}
