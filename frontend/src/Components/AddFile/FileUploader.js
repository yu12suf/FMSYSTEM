import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./FileUploader.css";

const REQUIRED_FILES = [
  "የይዞታ ማረጋገጫ ፋይል",
  "ሊዝ የተከፈለበት ደረሰኝ ፋይል",
  "የንብረት ግብር ደረሰኝ ፋይል",
  "የግብር ደረሰኝ ፋይል",
];

export default function FileUploader() {
  const navigate = useNavigate();
  const location = useLocation();
  const upin = new URLSearchParams(location.search).get("upin");

  // State for required files: { name, file, url, type, date }
  const [requiredFiles, setRequiredFiles] = useState(() => {
    const saved = sessionStorage.getItem("requiredFiles");
    if (saved) return JSON.parse(saved);
    return REQUIRED_FILES.map((name) => ({
      name,
      file: null,
      url: null,
      type: "",
      date: "",
      originalName: "",
    }));
  });

  // State for additional files
  const [files, setFiles] = useState(() => {
    const saved = sessionStorage.getItem("tempFiles");
    return saved ? JSON.parse(saved) : [];
  });

  // Additional file upload state
  const [step, setStep] = useState(1);
  const [newName, setNewName] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState(null);

  // Persist requiredFiles and files to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("requiredFiles", JSON.stringify(requiredFiles));
  }, [requiredFiles]);
  useEffect(() => {
    sessionStorage.setItem("tempFiles", JSON.stringify(files));
  }, [files]);

  // File type/size validation
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const maxSizeMB = 10;

  // Handle required file upload
  const handleRequiredFileChange = (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      alert("This file type is not allowed.");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert("File is too large. Max size is 10MB.");
      return;
    }
    const blobURL = URL.createObjectURL(file);
    const updated = [...requiredFiles];
    updated[idx] = {
      ...updated[idx],
      file,
      url: blobURL,
      type: file.type,
      date: new Date().toLocaleString(),
      originalName: file.name,
    };
    setRequiredFiles(updated);
  };

  // Remove required file
  const handleRemoveRequiredFile = (idx) => {
    const updated = [...requiredFiles];
    if (updated[idx].url) URL.revokeObjectURL(updated[idx].url);
    updated[idx] = {
      ...updated[idx],
      file: null,
      url: null,
      type: "",
      date: "",
      originalName: "",
    };
    setRequiredFiles(updated);
  };

  // Additional file logic (unchanged)
  const handleNext = () => {
    if (newName.trim()) setStep(2);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      alert("This file type is not allowed.");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert("File is too large. Max size is 10MB.");
      return;
    }
    setNewFile(file);
  };

  const handleAddFile = () => {
    if (!newFile || files.length >= 20) return;
    const blobURL = URL.createObjectURL(newFile);
    const entry = {
      name: newName,
      originalName: newFile.name,
      type: newFile.type,
      date: new Date().toLocaleString(),
      file: newFile,
      url: blobURL,
    };
    setFiles((prev) => [...prev, entry]);
    setNewName("");
    setNewFile(null);
    setStep(1);
  };

  const startEdit = (idx) => {
    setEditingIndex(idx);
    setEditName(files[idx].name);
    setEditFile(null);
  };

  const handleEditFileSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!allowedTypes.includes(f.type)) {
      alert("This file type is not allowed.");
      return;
    }
    if (f.size > maxSizeMB * 1024 * 1024) {
      alert("File is too large. Max size is 10MB.");
      return;
    }
    setEditFile(f);
  };

  const handleSaveEdit = () => {
    const updated = [...files];
    const newBlobURL = editFile
      ? URL.createObjectURL(editFile)
      : updated[editingIndex].url;
    updated[editingIndex] = {
      ...updated[editingIndex],
      name: editName,
      originalName: editFile
        ? editFile.name
        : updated[editingIndex].originalName,
      type: editFile ? editFile.type : updated[editingIndex].type,
      date: new Date().toLocaleString(),
      file: editFile || updated[editingIndex].file,
      url: newBlobURL,
    };
    setFiles(updated);
    setEditingIndex(null);
    setEditFile(null);
  };

  const handleDelete = (idx) => {
    const toDelete = files[idx];
    if (toDelete.url) URL.revokeObjectURL(toDelete.url);
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Only allow final save if all required files are present
  const allRequiredUploaded = requiredFiles.every((f) => !!f.file);

  const handleFinalSave = async () => {
    if (!allRequiredUploaded) {
      alert("Please upload all required files before saving.");
      return;
    }
    try {
      if (upin) {
        const formData = new FormData();
        // Attach required files with their names and a category
        requiredFiles.forEach((fileObj, index) => {
          formData.append("files", fileObj.file);
          formData.append(`names[${index}]`, fileObj.name);
          formData.append(`categories[${index}]`, "required");
        });
        // Attach additional files with their names and a category
        files.forEach((file, index) => {
          formData.append("files", file.file);
          formData.append(`names[${index + requiredFiles.length}]`, file.name);
          formData.append(
            `categories[${index + requiredFiles.length}]`,
            "additional"
          );
        });

        await axios.put(
          `http://localhost:5000/api/records/${upin}/files`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }
      // Save all files to sessionStorage for AddFile.js
      const allFiles = [...requiredFiles.filter((f) => !!f.file), ...files];
      sessionStorage.setItem("allUploadedFiles", JSON.stringify(allFiles));

      navigate("/addfile?upin=" + upin);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleSaveAndExit = () => {
    sessionStorage.setItem("requiredFiles", JSON.stringify(requiredFiles));
    sessionStorage.setItem("tempFiles", JSON.stringify(files));
    navigate(-1);
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (files.length > 0 || requiredFiles.some((f) => f.file)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [files, requiredFiles]);

  useEffect(() => {
    const handleReset = () => {
      setFiles([]);
      setRequiredFiles(
        REQUIRED_FILES.map((name) => ({
          name,
          file: null,
          url: null,
          type: "",
          date: "",
          originalName: "",
        }))
      );
      sessionStorage.removeItem("tempFiles");
      sessionStorage.removeItem("requiredFiles");
      sessionStorage.removeItem("allUploadedFiles");
    };
    window.addEventListener("fileUploader:reset", handleReset);
    return () => window.removeEventListener("fileUploader:reset", handleReset);
  }, []);

  return (
    <div className="uploader-container">
      <h1>{upin ? `Upload Files for UPIN: ${upin}` : "Upload Files"}</h1>

      <h3>Required Files</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {requiredFiles.map((f, idx) => (
          <li key={f.name} style={{ marginBottom: "1rem" }}>
            <label style={{ fontWeight: "bold" }}>{f.name}</label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <input
                type="file"
                onChange={(e) => handleRequiredFileChange(idx, e)}
                disabled={!!f.file}
                style={{ marginRight: "1rem" }}
              />
              {f.file && (
                <>
                  <span style={{ color: "#4BB543" }}>
                    {f.originalName} (uploaded)
                  </span>
                  <button
                    className="btn btn-red btn-xs"
                    onClick={() => handleRemoveRequiredFile(idx)}
                    type="button"
                  >
                    Remove
                  </button>
                </>
              )}
              {!f.file && <span style={{ color: "#cc0000" }}>Required</span>}
            </div>
          </li>
        ))}
      </ul>

      <hr />

      <h3>Additional Files</h3>
      {!allRequiredUploaded && (
        <div style={{ color: "#cc0000", marginBottom: "1rem" }}>
          Please upload all required files before adding additional files.
        </div>
      )}

      {/* Additional file upload UI */}
      <div
        style={{
          opacity: allRequiredUploaded ? 1 : 0.5,
          pointerEvents: allRequiredUploaded ? "auto" : "none",
        }}
      >
        {step === 1 && (
          <div>
            <label>
              <span>File Display Name</span>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                className="input-field"
                placeholder="Enter a name"
              />
            </label>
            <button onClick={handleNext} className="btn btn-green">
              Next: Select File
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <input type="file" onChange={handleFileSelect} />
            <div style={{ marginTop: "1rem" }}>
              <button
                onClick={handleAddFile}
                className="btn btn-blue"
                disabled={!newFile}
              >
                Add to List
              </button>
              <button onClick={() => setStep(1)} className="btn btn-gray">
                Back
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Date</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Required files */}
            {requiredFiles.map((f, idx) => (
              <tr key={`required-${f.name}`}>
                <td>{f.name}</td>
                <td>
                  <span style={{ color: "#4BB543", fontWeight: "bold" }}>
                    Required
                  </span>
                </td>
                <td className="text-sm">{f.date}</td>
                <td className="text-sm">{f.type}</td>
                <td>
                  {f.file ? (
                    <>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline ml-2"
                      >
                        View
                      </a>
                      <button
                        className="btn btn-red btn-xs"
                        onClick={() => handleRemoveRequiredFile(idx)}
                        type="button"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <span style={{ color: "#cc0000" }}>Required</span>
                  )}
                </td>
              </tr>
            ))}
            {/* Additional files */}
            {files.map((f, idx) => (
              <tr key={`additional-${idx}`}>
                <td>
                  {editingIndex === idx ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-field"
                    />
                  ) : (
                    f.name
                  )}
                </td>
                <td>
                  <span style={{ color: "#007bff" }}>Additional</span>
                </td>
                <td className="text-sm">{f.date}</td>
                <td className="text-sm">
                  {editingIndex === idx ? (
                    <input type="file" onChange={handleEditFileSelect} />
                  ) : (
                    f.type
                  )}
                </td>
                <td>
                  {editingIndex === idx ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="btn btn-green"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="btn btn-gray"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(idx)}
                        className="btn btn-yellow"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(idx)}
                        className="btn btn-red ml-2"
                      >
                        Delete
                      </button>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline ml-2"
                      >
                        View
                      </a>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: "right" }}>
        <button
          onClick={handleFinalSave}
          className="btn btn-indigo"
          disabled={!allRequiredUploaded}
        >
          {upin ? "Save All Files & Exit" : "Save Temporary Files & Exit"}
        </button>
      </div>
    </div>
  );
}
