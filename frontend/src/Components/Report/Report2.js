import React, { useRef, useState } from "react";
import axios from "axios";

const Report2 = () => {
  const [selectedProof, setSelectedProof] = useState("");
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const printRef = useRef();

  const handlePreview = async () => {
    if (!selectedProof.trim()) {
      alert("Please select a value for 'የይዞታው አገልግሎት' before previewing.");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8000/api/records/search-by-kebele/?kebele=${selectedProof}`
      );
      setRecords(response.data);
      setShowModal(true);

      // Update printRef content dynamically
      if (printRef.current) {
        printRef.current.innerHTML = `
        <h2>የተመረጠው መረጃ</h2>
        <table class="preview-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid black;">ተ.ቁ</th>
              <th style="border: 1px solid black;">ይዞታው ባለቤት ስም</th>
              <th style="border: 1px solid black;">UPIN</th>
              <th style="border: 1px solid black;">ቀበሌ</th>
              <th style="border: 1px solid black;">የቦታው ደረጃ</th>
              <th style="border: 1px solid black;">የቦታ ስፋት</th>
              <th style="border: 1px solid black; background-color: green; color: white;">የይዞታው አገልግሎት</th>
            </tr>
          </thead>
          <tbody>
           ${response.data
             .map(
               (record, index) => `
                <tr>
                  <td style="border: 1px solid black;">${index + 1}</td>
                  <td style="border: 1px solid black;">${
                    record.PropertyOwnerName
                  }</td>
                  <td style="border: 1px solid black;">${record.UPIN}</td>
                  <td style="border: 1px solid black;">${record.kebele}</td>
                  <td style="border: 1px solid black;">${record.placeLevel}</td>
                  <td style="border: 1px solid black;">${record.spaceSize}</td>
                  <td style="border: 1px solid black; background-color: green; color: white;">${
                    record.ServiceOfEstate
                  }</td>
                </tr>
              `
             )
             .join("")}
          </tbody>
        </table>
        `;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>
      </head>
      <body>
        ${printRef.current.innerHTML}
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f4f6f8",
      padding: "30px",
      maxWidth: "600px",
      margin: "40px auto",
      borderRadius: "12px",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
    },
    label: {
      fontSize: "1.2rem",
      fontWeight: "600",
      color: "#333",
      marginBottom: "10px",
    },
    select: {
      padding: "10px 14px",
      border: "1px solid #ccc",
      borderRadius: "6px",
      fontSize: "1rem",
      backgroundColor: "#fff",
      width: "100px",
      marginBottom: "20px",
      transition: "border-color 0.3s ease",
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      marginTop: "20px",
    },
    button: {
      padding: "10px 20px",
      cursor: "pointer",
      backgroundColor: "#007bff",
      border: "none",
      color: "white",
      borderRadius: "6px",
      fontSize: "1rem",
      fontWeight: "600",
      transition: "background-color 0.3s, transform 0.2s, box-shadow 0.3s",
      boxShadow: "0 4px 12px rgba(0, 123, 255, 0.2)",
    },
    buttonHover: {
      backgroundColor: "#0056b3",
      transform: "translateY(-2px)",
      boxShadow: "0 6px 15px rgba(0, 86, 179, 0.3)",
    },
    modalOverlay: {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "1000",
    },
    modalContent: {
      background: "#fff",
      padding: "25px",
      width: "90%",
      maxWidth: "800px",
      borderRadius: "10px",
      position: "relative",
      overflowY: "auto",
      maxHeight: "90vh",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
      zIndex: "1001",
    },
    closeButton: {
      position: "absolute",
      top: "15px",
      right: "20px",
      background: "#dc3545",
      color: "white",
      border: "none",
      fontSize: "20px",
      borderRadius: "50%",
      width: "35px",
      height: "35px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    previewTable: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "20px",
      backgroundColor: "white",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    tableHeader: {
      backgroundColor: "#007bff",
      color: "white",
      fontWeight: "bold",
      padding: "12px 16px",
      textAlign: "left",
      fontSize: "1rem",
      border: "1px solid black", // Black border for table header
    },
    tableCell: {
      padding: "12px 16px",
      textAlign: "left",
      fontSize: "1rem",
      border: "1px solid black", // Black border for table cells
    },
    lastColumnCell: {
      backgroundColor: "green", // Green background for last column
      color: "white",
      fontWeight: "bold",
      border: "1px solid black",
      padding: "12px 16px",
      textAlign: "left",
      fontSize: "1rem",
    },
    tableRowEven: {
      backgroundColor: "#f8f9fa",
    },
    reportHeader: {
      textAlign: "center",
      marginBottom: "20px",
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "#333",
    },
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>ቀበሌ</label>
      <select
        name="kebele"
        value={selectedProof}
        onChange={(e) => setSelectedProof(e.target.value)}
        style={styles.select}
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
      <div style={styles.buttonGroup}>
        <button
          style={styles.button}
          onClick={handlePreview}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor =
              styles.buttonHover.backgroundColor)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor =
              styles.button.backgroundColor)
          }
        >
          Preview
        </button>
        <button
          style={styles.button}
          onClick={handlePrint}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor =
              styles.buttonHover.backgroundColor)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor =
              styles.button.backgroundColor)
          }
        >
          Print
        </button>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeButton} onClick={handleClose}>
              &times;
            </button>
            <div style={styles.reportHeader}>
              <h2>የተመረጠው መረጃ</h2>
            </div>

            <table style={styles.previewTable}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>ተ.ቁ</th>
                  <th style={styles.tableHeader}>ይዞታው ባለቤት ስም</th>
                  <th style={styles.tableHeader}>UPIN</th>
                  <th style={styles.tableHeader}>የቦታው ደረጃ</th>
                  <th style={styles.tableHeader}>የቦታ ስፋት</th>
                  <th style={styles.tableHeader}>የይዞታው አገልግሎት</th>
                  <th style={styles.tableHeader}>ቀበሌ</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr
                    key={index}
                    style={
                      index % 2 === 0
                        ? styles.tableRowEven
                        : { backgroundColor: "white" }
                    }
                  >
                    <td style={styles.tableCell}>{index + 1}</td>
                    <td style={styles.tableCell}>{record.PropertyOwnerName}</td>
                    <td style={styles.tableCell}>{record.UPIN}</td>
                    <td style={styles.tableCell}>{record.placeLevel}</td>
                    <td style={styles.tableCell}>{record.spaceSize}</td>
                    <td style={styles.tableCell}>{record.ServiceOfEstate}</td>
                    <td style={styles.lastColumnCell}>{record.kebele}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <h2>የተመረጠው መረጃ</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid black" }}>ተ.ቁ</th>
                <th style={{ border: "1px solid black" }}>ይዞታው ባለቤት ስም</th>
                <th style={{ border: "1px solid black" }}>UPIN</th>
                <th style={{ border: "1px solid black" }}>ቀበሌ</th>
                <th style={{ border: "1px solid black" }}>የቦታው ደረጃ</th>
                <th style={{ border: "1px solid black" }}>የቦታ ስፋት</th>
                <th
                  style={{
                    border: "1px solid black",
                    backgroundColor: "green",
                    color: "white",
                  }}
                >
                  የይዞታው አገልግሎት
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid black" }}>{index + 1}</td>
                  <td style={{ border: "1px solid black" }}>
                    {record.PropertyOwnerName}
                  </td>
                  <td style={{ border: "1px solid black" }}>{record.UPIN}</td>
                  <td style={{ border: "1px solid black" }}>{record.kebele}</td>
                  <td style={{ border: "1px solid black" }}>
                    {record.placeLevel}
                  </td>
                  <td style={{ border: "1px solid black" }}>
                    {record.spaceSize}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      backgroundColor: "green",
                      color: "white",
                    }}
                  >
                    {record.ServiceOfEstate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Report2;
