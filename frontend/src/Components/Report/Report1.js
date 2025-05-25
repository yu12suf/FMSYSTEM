import axios from "axios";
import "./Report1.css";
import React, { useRef, useState } from "react";

const Report1 = () => {
  const [selectedProof, setSelectedProof] = useState("");
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const printRef = useRef(); // Reference for print content

  const handlePreview = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/records/search-by-service/?ServiceOfEstate=${selectedProof}`
      );
      setRecords(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handlePrint = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/records/search-by-service/?ServiceOfEstate=${selectedProof}`
      );
      setRecords(response.data);

      // Wait for the DOM to update
      setTimeout(() => {
        if (!printRef.current) return;
        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Optional: Reload to restore full page
      }, 500); // small delay to ensure ref renders
    } catch (error) {
      console.error("Error fetching data for print:", error);
    }
  };

  return (
    <div className="form-group horizontal-group">
      <label>የይዞታው አገልግሎት</label>
      <select
        name="ServiceOfEstate"
        value={selectedProof}
        onChange={(e) => setSelectedProof(e.target.value)}
      >
        <option value="">Select</option>
        <option>ለመኖረያ</option>
        <option>ለንግድ</option>
        <option>የመንግስት</option>
        <option>የሐይማኖት ተቋም</option>
        <option>ኢንቨስትመንት</option>
        <option>የቀበሌ</option>
        <option>የኪይ ቤቶች</option>
        <option>ኮንዲኒሚየም</option>
        <option>መንገድ</option>
        <option>የማሃበር</option>
        <option>ሌሎች</option>
      </select>

      <div className="button-group-vertical">
        <button onClick={handlePreview}>Preview</button>
        <button onClick={handlePrint}>Print</button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handleClose}>
              &times;
            </button>
            <div className="report1-header">
              <h2>የተመረጠው መረጃ</h2>
            </div>

            <table className="preview-table">
              <thead>
                <tr>
                  <th>ተ.ቁ </th>
                  <th>ይዞታው ባለቤት ስም</th>
                  <th>UPIN</th>
                  <th>ቀበሌ</th>
                  <th>የቦታው ደረጃ</th>
                  <th>የቦታ ስፋት</th>
                  <th>የይዞታው አገልግሎት</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{record.PropertyOwnerName}</td>
                    <td>{record.UPIN}</td>
                    <td>{record.kebele}</td>
                    <td>{record.placeLevel}</td>
                    <td>{record.spaceSize}</td>
                    <td>{record.ServiceOfEstate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hidden printable content */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <h2>የተመረጠው መረጃ</h2>
          <table className="preview-table">
            <thead>
              <tr>
                <th>ተ.ቁ </th>
                <th>ይዞታው ባለቤት ስም</th>
                <th>UPIN</th>
                <th>ቀበሌ</th>
                <th>የቦታው ደረጃ</th>
                <th>የቦታ ስፋት</th>
                <th>የይዞታው አገልግሎት</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{record.PropertyOwnerName}</td>
                  <td>{record.UPIN}</td>
                  <td>{record.kebele}</td>
                  <td>{record.placeLevel}</td>
                  <td>{record.spaceSize}</td>
                  <td>{record.ServiceOfEstate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Report1;
