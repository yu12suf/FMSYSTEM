// FilesPage.js

import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "@fortawesome/fontawesome-free/css/all.min.css";

import { useEffect } from "react";
import TaxForm from "./TaxForm";

const ViewFile = () => {
  const [records, setRecords] = useState([]);
  const [searchFileCode, setSearchFileCode] = useState("");
  const [searchUPIN, setSearchUPIN] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    PropertyOwnerName: "",
    ExistingArchiveCode: "",
    UPIN: "",
    ServiceOfEstate: "",
    placeLevel: "",
    possessionStatus: "",
    spaceSize: "",
    kebele: "",
    proofOfPossession: "",
    DebtRestriction: "",
    LastTaxPaymtDate: "",
    unpaidTaxDebt: "",
    InvoiceNumber: "",
    lastDatePayPropTax: "",
    unpaidPropTaxDebt: "",
    InvoiceNumber2: "",
    uploadedFile: null,
    filePath: "",
    EndLeasePayPeriod: "",
    unpaidLeaseDebt: "",
    InvoiceNumber3: "",
    FolderNumber: "",
    Row: "",
    ShelfNumber: "",
    NumberOfPages: 0,
  });

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get("/api/records");
        setRecords(response.data);
      } catch (error) {
        console.error("Failed to fetch records:", error);
      }
    };
    fetchRecords();
  }, []);

  const handleFileCodeSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/records/search`,
        {
          params: { ExistingArchiveCode: searchFileCode },
        }
      );
      console.log("File Code Search Response:", response.data); // Log the response
      if (response.data?.length > 0) {
        setFormData(response.data[0]);
      } else {
        console.warn("No record found for the given file code.");
        alert("No record found for the given file code.");
      }
    } catch (error) {
      console.error("Error searching by file code:", error);
    } finally {
      setSearchFileCode(""); // Reset search input
    }
  };

  const handleUPISearch = async () => {
    console.log("Searching for UPIN:", searchUPIN); // Add this line

    try {
      const response = await axios.get(
        `http://localhost:8000/api/records/search`,
        {
          params: { UPIN: searchUPIN },
        }
      );
      if (response.data?.length > 0) {
        setFormData(response.data[0]);
      } else {
        console.warn("No record found for the given UPIN.");
        alert("No record found for the given UPIN.");
      }
    } catch (error) {
      console.error("Error searching by UPIN:", error);
    }
    setSearchUPIN(""); // Reset search input
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleResetForm = () => {
    setFormData({
      PropertyOwnerName: "",
      ExistingArchiveCode: "",
      UPIN: "",
      ServiceOfEstate: "",
      placeLevel: "",
      possessionStatus: "",
      spaceSize: "",
      kebele: "",
      proofOfPossession: "",
      DebtRestriction: "",
      LastTaxPaymtDate: "",
      unpaidTaxDebt: "",
      InvoiceNumber: "",
      lastDatePayPropTax: "",
      unpaidPropTaxDebt: "",
      InvoiceNumber2: "",
      uploadedFile: null,
      filePath: "",
      EndLeasePayPeriod: "",
      unpaidLeaseDebt: "",
      InvoiceNumber3: "",
      FolderNumber: "",
      Row: "",
      ShelfNumber: "",
      NumberOfPages: 0,
    });
  };

  // name handling

  const handleBlurName = (event) => {
    const { name, value } = event.target;

    if (name === "PropertyOwnerName") {
      const characterOnlyRegex = /^[A-Za-z\u1200-\u135A\s]*$/;

      if (!characterOnlyRegex.test(value)) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          PropertyOwnerName: "Enter only characters please!",
        }));
      } else {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          PropertyOwnerName: "",
        }));
      }
    }
  };

  const calculateUnpaidDebt = (year) => {
    const parsed = parseInt(year, 10);
    const ethiopianYear = new Date().getFullYear() - 8;

    if (!isNaN(parsed) && parsed >= 1950 && parsed <= ethiopianYear) {
      return ethiopianYear - parsed;
    }

    return null;
  };

  // function for unpaid debt
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const parsed = parseInt(value, 10);
    const ethiopianYear = new Date().getFullYear() - 8;

    if (!value || isNaN(parsed) || parsed < 1950 || parsed > ethiopianYear) {
      alert(`Please insert a value between 1950 and ${ethiopianYear}`);

      // Clear the value and its related debt
      setFormData((prev) => {
        const updated = { ...prev, [name]: "" };

        if (name === "LastTaxPaymtDate") {
          updated.unpaidTaxDebt = "";
        } else if (name === "lastDatePayPropTax") {
          updated.unpaidPropTaxDebt = "";
        } else if (name === "EndLeasePayPeriod") {
          updated.unpaidLeaseDebt = "";
        }

        return updated;
      });

      return; // stop here
    }

    const unpaid = calculateUnpaidDebt(value);

    setFormData((prev) => {
      const updates = { [name]: value };

      if (name === "LastTaxPaymtDate") {
        updates.unpaidTaxDebt = unpaid;
      } else if (name === "lastDatePayPropTax") {
        updates.unpaidPropTaxDebt = unpaid;
      } else if (name === "EndLeasePayPeriod") {
        updates.unpaidLeaseDebt = unpaid;
      }

      return { ...prev, ...updates };
    });
  };

  return (
    <div>
      <div
        className="cont-container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          gap: "1rem",
        }}
      >
        {/* Search by File Code */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: "700",
            fontSize: "1rem",
            color: "orange",
          }}
        >
          <label style={{ marginRight: "0.5rem", whiteSpace: "nowrap" }}>
            Search by File Code
          </label>
          <div style={{ position: "relative", width: "200px" }}>
            <input
              type="text"
              placeholder="Search by File Code"
              value={searchFileCode}
              onChange={(e) => setSearchFileCode(e.target.value)}
              style={{
                width: "100%",
                height: "2rem",
                paddingRight: "2.5rem",
                boxSizing: "border-box",
                borderRadius: "6px",
                border: "2px solid #ccc",
                fontSize: "0.9rem",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                transition: "border 0.2s ease-in-out",
              }}
            />
            <button
              onClick={handleFileCodeSearch}
              style={{
                position: "absolute",
                top: "50%",
                right: "0.5rem",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                height: "1.5rem",
                width: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <i
                className="fas fa-search"
                style={{ fontSize: "1rem", color: "#555" }}
              ></i>
            </button>
          </div>
        </div>

        {/* Search by UPIN */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: "700",
            fontSize: "1rem",
            color: "orange",
          }}
        >
          <label style={{ marginRight: "0.5rem", whiteSpace: "nowrap" }}>
            Search by UPIN
          </label>
          <div style={{ position: "relative", width: "200px" }}>
            <input
              type="text"
              placeholder="Search by UPIN"
              value={searchUPIN}
              onChange={(e) => setSearchUPIN(e.target.value)}
              style={{
                width: "100%",
                height: "2rem",
                paddingRight: "2.5rem",
                boxSizing: "border-box",

                borderRadius: "6px",
                border: "2px solid #ccc",
                fontSize: "0.9rem",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                transition: "border 0.2s ease-in-out",
              }}
            />
            <button
              onClick={handleUPISearch}
              style={{
                position: "absolute",
                top: "50%",
                right: "0.5rem",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                height: "1.5rem",
                width: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <i
                className="fas fa-search"
                style={{ fontSize: "1rem", color: "#555" }}
              ></i>
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="form-1">
        {/* Column 1 */}
        <div className="form-column-1">
          <h3 className="uniq-title">Unique information</h3>
          <div className="form-group-1">
            <label>ይዞታው ባለቤት ስም</label>
            <input
              type="text"
              name="PropertyOwnerName"
              value={formData.PropertyOwnerName}
              onChange={handleChange}
              onBlur={handleBlurName}
            />
            {formErrors.PropertyOwnerName && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  backgroundColor: "#fff4f4",
                  color: "#cc0000",
                  padding: "4px 8px",
                  fontSize: "0.85em",
                  border: "1px solid #cc0000",
                  borderRadius: "4px",
                  marginTop: "4px",
                  whiteSpace: "nowrap",
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
                  zIndex: 100,
                }}
              >
                {formErrors.PropertyOwnerName}
              </div>
            )}
          </div>
          <div className="form-group-1">
            <label>የነባር የማህደር ኮደ</label>
            <input
              type="text"
              name="ExistingArchiveCode"
              value={formData.ExistingArchiveCode}
              onChange={handleChange}
            />
          </div>
          <div className="form-group-1">
            <label>UPIN</label>
            <input
              type="text"
              name="UPIN"
              value={formData.UPIN}
              onChange={handleChange}
            />
          </div>

          <h3 className="uniq-title">የፋይሉ አድራሻ</h3>
          <div className="form-group-1">
            <label>አቃፊ ቁጥር</label>
            <input
              type="number"
              name="FolderNumber"
              value={formData.FolderNumber}
              onChange={handleChange}
            />
          </div>
          <div className="form-group-1">
            <label>የሼልፍ ቁጥር</label>
            <input
              type="number"
              name="ShelfNumber"
              value={formData.ShelfNumber}
              onChange={handleChange}
            />
          </div>
          <div className="form-group-1">
            <label>የስነድ የገፅ ብዛት</label>
            <input
              type="number"
              name="NumberOfPages"
              value={formData.NumberOfPages}
              onChange={handleChange}
            />
          </div>
          <div className="form-group-1">
            <label>መደርደረያ ቁፕር</label>
            <input
              type="number"
              name="sortingNumber"
              value={formData.sortingNumber}
              onChange={handleChange}
            />
          </div>

          <div className="form-group-1">
            <label>አቃፊ ቁጥር</label>
            <input
              type="number"
              name="FolderNumber"
              value={formData.FolderNumber}
              onChange={handleChange}
            />
          </div>
          <div className="form-group-1">
            <label>የሼልፍ ቁጥር</label>
            <input
              type="number"
              name="ShelfNumber"
              value={formData.ShelfNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Column 2 */}
        <div className="form-column-2">
          <h3 className="uniq-title">የክፍያ መረጃ</h3>
          <div className="form-group">
            <label>እዳና እገዳ</label>
            <select
              name="DebtRestriction"
              value={formData.DebtRestriction}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option>እዳ</option>
              <option>እገዳ</option>
              <option>ነፃ</option>
            </select>
          </div>
          <div className="form-group">
            <label>የግብር የመጨረሻ የተከፈለበት ዘመን</label>
            <input
              type="text"
              name="LastTaxPaymtDate"
              value={formData.LastTaxPaymtDate}
              onChange={handleChange}
              onBlur={handleBlur} // alert triggers on blur
              min="1950"
              max={new Date().getFullYear() - 8}
              placeholder="e.g., 2015"
            />
            <TaxForm debt={formData.unpaidTaxDebt} />
          </div>
          <div className="form-group" style={{ marginRight: "60px" }}>
            <label>ደረሰኝ ቁጥር</label>
            <input
              type="number"
              name="InvoiceNumber"
              value={formData.InvoiceNumber}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>የንብረት ግብር የመጨረሻ የተከፈለበት ዘመን</label>
            <input
              type="text"
              name="lastDatePayPropTax"
              value={formData.lastDatePayPropTax}
              onChange={handleChange}
              onBlur={handleBlur} // 👈 alert triggers on blur
              min="1950"
              max={new Date().getFullYear() - 8}
              placeholder="e.g., 2015"
            />

            <TaxForm debt={formData.unpaidPropTaxDebt} />
          </div>
          <div className="form-group" style={{ marginRight: "60px" }}>
            <label>ደረሰኝ ቁጥር</label>
            <input
              type="number"
              name="InvoiceNumber2"
              value={formData.InvoiceNumber2}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>የሊዝ መጨረሻ የተከፈለበት ዘመን</label>
            <input
              type="text"
              name="EndLeasePayPeriod"
              value={formData.EndLeasePayPeriod}
              onChange={handleChange}
              onBlur={handleBlur} //  alert triggers on blur
              min="1950"
              max={new Date().getFullYear() - 8}
              placeholder="e.g., 2015"
            />
            <TaxForm debt={formData.unpaidLeaseDebt} />
          </div>
          <div className="form-group" style={{ marginRight: "60px" }}>
            <label>ደረሰኝ ቁጥር</label>
            <input
              type="number"
              name="InvoiceNumber3"
              value={formData.InvoiceNumber3}
              onChange={handleChange}
            />
          </div>
        </div>
        {/* Column 3 */}
        <div className="form-column-3">
          <h3 className="uniq-title">የይዞታ መረጃ</h3>
          <div className="form-group">
            <label>የይዞታው አገልግሎት</label>
            <select
              name="ServiceOfEstate"
              value={formData.ServiceOfEstate}
              onChange={handleChange}
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
          </div>
          <div className="form-group">
            <label>የቦታው ደረጃ</label>
            <select
              name="placeLevel"
              value={formData.placeLevel}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option>1ኛ</option>
              <option>2ኛ</option>
              <option>3ኛ</option>
              <option>4ኛ</option>
            </select>
          </div>
          <div className="form-group">
            <label>የይዞታየተገኘበት ሁኔታ</label>
            <select
              name="possessionStatus"
              value={formData.possessionStatus}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option>ነባር</option>
              <option>ሊዝ</option>
            </select>
          </div>

          <div className="form-group" style={{ marginLeft: "14px" }}>
            <label>የቦታ ስፋት</label>
            <input
              type="number"
              name="spaceSize"
              value={formData.spaceSize}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>የይዞታ ማራጋገጫ</label>
            <select
              name="proofOfPossession"
              value={formData.proofOfPossession}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option>ካርታ</option>
              <option>ሰነድ አልባ</option>
              <option>ህገ-ውፕ</option>
              <option>ምንም የሌለው</option>
            </select>
          </div>
          <div className="form-group">
            <label>ቀበሌ</label>
            <select
              name="kebele"
              value={formData.kebele}
              onChange={handleChange}
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
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center", // or 'space-between' or 'flex-end'
              gap: "1rem",
              marginTop: "4rem",
            }}
          >
            <button
              onClick={handleResetForm}
              className="reset-button"
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#f44336", // red or any color you want
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Column 4 */}
      </div>
    </div>
  );
};

export default ViewFile;
