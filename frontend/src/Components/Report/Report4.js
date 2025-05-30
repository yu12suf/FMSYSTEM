import React, { useRef, useState } from "react";
import axios from "axios";

const Report4 = () => {
  const [selectedKebele, setSelectedKebele] = useState("");
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState("");
  const printRef = useRef();

  const handlePreview = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/records/search-by-kebele/?kebele=${selectedProof}`
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
        `http://localhost:8000/api/records/search-by-kebele/?kebele=${selectedProof}`
      );
      const fetchedRecords = response.data;
      setRecords(fetchedRecords);

      const tableRows = fetchedRecords
        .map(
          (record, index) => `
        <tr style="background-color: ${
          index % 2 === 0 ? "#f8f9fa" : "#ffffff"
        };">
          <td style="border: 1px solid #dee2e6; padding: 12px 16px;">${
            index + 1
          }</td>
          <td style="border: 1px solid #dee2e6; padding: 12px 16px;">${
            record.PropertyOwnerName
          }</td>
          <td style="border: 1px solid #dee2e6; padding: 12px 16px;">${
            record.UPIN
          }</td>
          <td style="border: 1px solid #dee2e6; padding: 12px 16px;">${
            record.kebele
          }</td>
          <td style="border: 1px solid #dee2e6; padding: 12px 16px;">${
            record.placeLevel
          }</td>
          <td style="border: 1px solid #dee2e6; padding: 12px 16px;">${
            record.spaceSize
          }</td>
          <td style="border: 1px solid #dee2e6; padding: 12px 16px;">${
            record.proofOfPossession
          }</td>
        </tr>
      `
        )
        .join("");

      const printContent = `
      <html>
        <head>
          <title>Print Preview</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
            }
            h2 {
              text-align: center;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              overflow: hidden;
            }
            th {
              background-color: #007bff;
              color: white;
              font-weight: bold;
              padding: 12px 16px;
              text-align: left;
            }
            td {
              padding: 12px 16px;
              border: 1px solid #dee2e6;
              font-size: 1rem;
            }
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
          </style>
        </head>
        <body>
          <h2>የተመረጠው መረጃ (ቀበሌ)</h2>
          <table>
            <thead>
              <tr>
                <th>ተ.ቁ</th>
                <th>ይዞታው ባለቤት ስም</th>
                <th>UPIN</th>
                <th>ቀበሌ</th>
                <th>የቦታው ደረጃ</th>
                <th>የቦታ ስፋት</th>
                <th>የይዞታ ማራጋገጫ</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

      const printWindow = window.open("", "_blank");
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } catch (error) {
      console.error("Error printing records:", error);
    }
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
    },
    tableCell: {
      border: "1px solid #dee2e6",
      padding: "12px 16px",
      textAlign: "left",
      fontSize: "1rem",
    },
    tableRowEven: {
      backgroundColor: "#f8f9fa",
    },
    reportHeader: {
      textAlign: "center",
      fontSize: "1.5rem",
      fontWeight: "700",
      marginBottom: "15px",
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
          onClick={handlePreview}
          style={styles.button}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#0056b3")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#007bff")
          }
        >
          Preview
        </button>
        <button
          onClick={handlePrint}
          style={styles.button}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#0056b3")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#007bff")
          }
        >
          Print
        </button>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} ref={printRef}>
            <button
              style={styles.closeButton}
              onClick={handleClose}
              title="መዝጊያ"
            >
              &times;
            </button>
            <h3 style={styles.reportHeader}>የተመረጠ መረጃ (ቀበሌ)</h3>
            <table style={styles.previewTable}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>ተ.ቁ</th>
                  <th style={styles.tableHeader}>ይዞታው ባለቤት ስም</th>
                  <th style={styles.tableHeader}>UPIN</th>
                  <th style={styles.tableHeader}>ቀበሌ</th>
                  <th style={styles.tableHeader}>የቦታው ደረጃ</th>
                  <th style={styles.tableHeader}>የቦታ ስፋት</th>
                  <th style={styles.tableHeader}>የይዞታ ማራጋገጫ</th>
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? (
                  records.map((record, index) => (
                    <tr
                      key={record.UPIN}
                      style={index % 2 === 0 ? styles.tableRowEven : null}
                    >
                      <td style={styles.tableCell}>{index + 1}</td>
                      <td style={styles.tableCell}>
                        {record.PropertyOwnerName}
                      </td>
                      <td style={styles.tableCell}>{record.UPIN}</td>
                      <td style={styles.tableCell}>{record.kebele}</td>
                      <td style={styles.tableCell}>{record.placeLevel}</td>
                      <td style={styles.tableCell}>{record.spaceSize}</td>
                      <td style={styles.tableCell}>
                        {record.proofOfPossession}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      style={{ ...styles.tableCell, textAlign: "center" }}
                      colSpan={7}
                    >
                      መረጃ አልተገኘም
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report4;
