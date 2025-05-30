import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EditFile.css";

export default function EditFile() {
  const [formData, setFormData] = useState(null);
  const [files, setFiles] = useState([]);
  const [upinSearch, setUpinSearch] = useState("");
  const [showFiles, setShowFiles] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  // Amharic field labels mapping
  const amharicLabels = {
    PropertyOwnerName: "የባለቤት ስም",
    UPIN: "ዩፒኤን",
    PhoneNumber: "ስልክ ቁጥር",
    NationalId: "Fayda Number",
    ServiceOfEstate: "የንብረት አገልግሎት",
    placeLevel: "የቦታ ደረጃ",
    possessionStatus: "የይዞታ ሁኔታ",
    spaceSize: "የቦታ መጠን",
    kebele: "ቀበሌ",
    proofOfPossession: "የይዞታ ማረጋገጫ",
    DebtRestriction: "የብድር ገደብ",
    LastTaxPaymtDate: "የመጨረሻ ግብር ክፍያ ቀን",
    lastDatePayPropTax: "የመጨረሻ የንብረት ግብር ክፍያ ቀን",
    EndLeasePayPeriod: "የቅጥያ ክፍያ ዘመን",
    FolderNumber: "የፎልደር ቁጥር",
    Row: "ረድፍ",
    ShelfNumber: "የመደርደሪያ ቁጥር",
    NumberOfPages: "የገፆች ብዛት",
    sortingNumber: "መደርደረያ ቁፕር",
  };

  // Toast handler
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const handleSearch = async () => {
    setSearchError("");
    if (!upinSearch) return;
    try {
      const res = await axios.get(`http://localhost:8000/api/records/search/`, {
        params: { UPIN: upinSearch },
      });

      if (res.data.length) {
        const filteredData = {};
        Object.keys(amharicLabels).forEach((key) => {
          if (res.data[0][key] !== undefined) {
            filteredData[key] = res.data[0][key];
          }
        });
        setFormData(filteredData);
        setShowFiles(false);
        setFiles([]);
        setAdditionalFiles([]);
        setSearchError("");
        fetchFiles(res.data[0].UPIN);
      } else {
        setFormData(null);
        setFiles([]);
        setAdditionalFiles([]);
        setShowFiles(false);
        setSearchError("No record found for this UPIN.");
      }
    } catch (error) {
      setSearchError("Error fetching record.");
    }
    setUpinSearch("");
  };

  const fetchFiles = async (upin) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/records/${upin}/files/`
      );
      setFiles(res.data);
      setShowFiles(true);
    } catch (error) {
      console.error("Error fetching files:", error);
      showToast("Error fetching files.", "error");
    }
  };

  const handleReplaceFile = async (fileId, newFile, upin) => {
    const formData = new FormData();
    formData.append("uploaded_file", newFile);

    try {
      const res = await axios.put(
        `http://localhost:8000/api/files/${fileId}/replace/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.status === 200) {
        // showToast("File replaced successfully.");
        //fetchFiles(formData.UPIN); // Refresh files
        //fetchFiles(upinSearch); // Use `upinSearch` instead of `formData.UPIN`
        // newbelow here
        showToast("File replaced successfully.");
        //const upin = formData?.UPIN || upinSearch || formData?.UPIN; // Ensure UPIN is correctly set
        if (upin) {
          fetchFiles(upin); // Use the explicitly passed UPIN value
        } else {
          showToast("UPIN is missing. Unable to refresh files.", "error");
        }
      } else {
        showToast("Failed to replace file.", "error");
      }
    } catch (error) {
      console.error("Error replacing file:", error);
      showToast("Error replacing file.", "error");
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const res = await axios.delete(
        `http://localhost:8000/api/files/${fileId}/delete/`
      );
      if (res.status === 204) {
        showToast("File deleted successfully.");
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
      } else {
        showToast("Failed to delete file.", "error");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      showToast("Error deleting file.", "error");
    }
  };

  const handleSaveRecord = async () => {
    try {
      // Validate UPIN before proceeding
      if (!formData.UPIN || formData.UPIN.trim() === "") {
        showToast(
          "UPIN is missing. Please search for a record first.",
          "error"
        );
        return;
      }

      // Save record details
      const recordRes = await axios.put(
        `http://localhost:8000/api/records/${formData.UPIN}/`,
        formData
      );

      if (recordRes.status === 200) {
        // Save additional files
        for (const file of additionalFiles) {
          const fileFormData = new FormData();
          fileFormData.append("uploaded_file", file.file);
          fileFormData.append("display_name", file.name);
          fileFormData.append("category", "additional");

          const fileRes = await axios.post(
            `http://localhost:8000/api/files/${formData.UPIN}/upload/`,
            fileFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (fileRes.status !== 201) {
            showToast("Failed to upload additional file.", "error");
          }
        }

        showToast("Record and files saved successfully.");
        resetForm(); // Reset input fields after saving
      } else {
        showToast("Failed to update record.", "error");
      }
    } catch (error) {
      console.error("Error saving record and files:", error);
      showToast("Error saving record and files.", "error");
    }
  };

  const [additionalFile, setAdditionalFile] = useState(null);
  const [additionalFileName, setAdditionalFileName] = useState("");

  const addAdditionalFile = (file, name) => {
    if (!file || !name.trim()) {
      showToast("Please provide a file and a name.", "error");
      return;
    }
    setAdditionalFiles((prevFiles) => [...prevFiles, { file, name }]);
    setAdditionalFile(null); // Reset file input
    setAdditionalFileName(""); // Reset name input
    showToast("Additional File added to the list.");
  };

  const resetForm = () => {
    setFormData(null);
    setFiles([]);
    setAdditionalFiles([]);
    setShowFiles(false);
    setSearchError("");
    setFormErrors({});
  };

  return (
    <div>
      {toast.show && (
        <div
          className={`toast ${toast.type}`}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: toast.type === "success" ? "#d4edda" : "red",
            color: toast.type === "success" ? "#155724" : "white",
            padding: "10px 15px",
            borderRadius: "5px",
            boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
            zIndex: 1000,
            maxWidth: "300px",
            wordWrap: "break-word",
          }}
        >
          {toast.message}
        </div>
      )}
      <div className="edit-file-container">
        <h2>Edit Record and Files</h2>
        <div className="search-bar" style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Enter UPIN"
            value={upinSearch}
            onChange={(e) => setUpinSearch(e.target.value)}
          />
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
          {searchError && (
            <div
              style={{
                position: "absolute",
                top: "110%",
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
              {searchError}
            </div>
          )}
        </div>

        {formData && (
          <>
            <div className="record-details">
              <h3>Record Details</h3>
              {Object.entries(formData).map(([key, value]) => (
                <div key={key}>
                  <label>{amharicLabels[key]}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>

            {showFiles && (
              <div className="files-uploaded-section">
                <h4>Attached Files</h4>
                {files.length === 0 ? (
                  <div>No files found for this record.</div>
                ) : (
                  <ul className="file-list">
                    {files.map((file) => (
                      <li key={file.id}>
                        <span className="file-name">
                          {file.display_name ||
                            file.uploaded_file.split("/").pop()}
                        </span>
                        <span className="file-category">{file.category}</span>
                        <a
                          className="file-view-link"
                          href={`http://localhost:8000${file.uploaded_file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                        <input
                          type="file"
                          onChange={(e) =>
                            handleReplaceFile(
                              file.id,
                              e.target.files[0],
                              formData.UPIN
                            )
                          }
                        />
                        {file.category !== "required" && (
                          <button
                            className="delete-file-btn"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            Delete
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="additional-file-upload-section">
              <h4>Upload Additional Files</h4>
              <input
                type="text"
                placeholder="Enter file name"
                value={additionalFileName}
                onChange={(e) => setAdditionalFileName(e.target.value)} // Update file name state
              />
              <input
                type="file"
                onChange={(e) => setAdditionalFile(e.target.files[0])} // Update file state
              />
              <button
                onClick={() =>
                  addAdditionalFile(additionalFile, additionalFileName)
                } // Pass file and name to handler
              >
                Add File
              </button>
            </div>

            <button className="save-record-btn" onClick={handleSaveRecord}>
              Save Record
            </button>
          </>
        )}
      </div>
    </div>
  );
}
