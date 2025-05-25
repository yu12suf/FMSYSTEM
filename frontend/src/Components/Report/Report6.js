import React, { useRef, useState } from "react";
import axios from "axios";
import "./Report6.css";

const Report6 = () => {
  const [selectedProof, setSelectedProof] = useState("");
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const printRef = useRef();

  const handlePreview = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/records/search-by-kebele/?kebele=${selectedProof}`
      );
      setRecords(response.data);
      setShowModal(true); // Show the modal after data is fetched
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
        `http://localhost:8000/api/records/search-by-kebele/?kebele=${selectedProof}`
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
      <label>ቀበሌ</label>
      <select
        name="kebele"
        value={selectedProof}
        onChange={(e) => setSelectedProof(e.target.value)}
      >
        <option value="">Select</option>
        <option>01</option>
        <option>02</option>
        <option>03</option>
        <option>04</option>
        <option>05</option>
        <option>06</option>
        <option>07</option>
        <option>08</option>
        <option>09</option>
        <option>10</option>
        <option>11</option>
        <option>12</option>
        <option>13</option>
        <option>14</option>
        <option>15</option>
        <option>16</option>
        <option>17</option>
        <option>18</option>
        <option>19</option>
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
            <div className="report6-header">
              <h2>የተመረጠው መረጃ</h2>
            </div>

            <table className="preview-table">
              <thead>
                <tr>
                  <th>ተ.ቁ </th>
                  <th>ይዞታው ባለቤት ስም</th>
                  <th>UPIN</th>
                  <th>የቦታው ደረጃ</th>
                  <th>የቦታ ስፋት</th>
                  <th>የይዞታው አገልግሎት</th>
                  <th>ቀበሌ</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{record.PropertyOwnerName}</td>
                    <td>{record.UPIN}</td>
                    <td>{record.placeLevel}</td>
                    <td>{record.spaceSize}</td>
                    <td>{record.ServiceOfEstate}</td>
                    <td>{record.kebele}</td>
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
                <th>የቦታው ደረጃ</th>
                <th>የቦታ ስፋት</th>
                <th>የይዞታው አገልግሎት</th>
                <th>ቀበሌ</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{record.PropertyOwnerName}</td>
                  <td>{record.UPIN}</td>
                  <td>{record.placeLevel}</td>
                  <td>{record.spaceSize}</td>
                  <td>{record.ServiceOfEstate}</td>
                  <td>{record.kebele}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Report6;
