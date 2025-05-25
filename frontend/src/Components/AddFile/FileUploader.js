import React, { useState } from "react";
import axios from "axios";
import "./FileUploader.css";
import { useParams } from "react-router-dom";

export default function FileUploader({ onUploadComplete, onRefresh }) {
  const [files, setFiles] = useState([]);
  const [step, setStep] = useState(1);
  const [newName, setNewName] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { upin } = useParams();

  const handleNext = () => {
    if (newName.trim()) setStep(2);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setNewFile(selectedFile);
    }
  };

  const handleAddFile = () => {
    if (!newFile || files.length >= 20) return;
    const entry = {
      name: newName,
      originalName: newFile.name,
      type: newFile.type,
      date: new Date().toLocaleString(),
      file: newFile,
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
    const file = e.target.files[0];
    if (file) setEditFile(file);
  };

  const handleSaveEdit = () => {
    const updated = [...files];
    updated[editingIndex] = {
      ...updated[editingIndex],
      name: editName,
      originalName: editFile
        ? editFile.name
        : updated[editingIndex].originalName,
      type: editFile ? editFile.type : updated[editingIndex].type,
      date: new Date().toLocaleString(),
      file: editFile || updated[editingIndex].file,
    };
    setFiles(updated);
    setEditingIndex(null);
    setEditFile(null);
  };

  const handleDelete = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFinalSave = async () => {
    if (!files.length || isUploading) return;
    setIsUploading(true);

    const uploadedFileList = []; // Collect uploaded files here

    try {
      for (const entry of files) {
        const form = new FormData();
        form.append("uploadedFile", entry.file);
        form.append("ExistingArchiveCode", entry.name);

        // Upload file for each entry
        await axios.post(
          `http://localhost:8000/api/records/${upin}/upload/`,
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        // Collect uploaded files for parent
        uploadedFileList.push(entry.file);
      }

      setFiles([]); // Clear after success
      onUploadComplete(uploadedFileList); // Notify parent of uploaded files
      onRefresh(); // Inform parent to refresh records
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full text-sm">
      <h2 className="text-lg font-semibold mb-3">
        Upload Files for UPIN: {upin}
      </h2>

      {/* Step 1: Enter Name */}
      {step === 1 && (
        <div className="mb-4 space-y-2">
          <label className="block text-gray-700">File Display Name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full border rounded px-2 py-1"
            placeholder="Enter a name"
          />
          <button
            onClick={handleNext}
            className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Next: Select File
          </button>
        </div>
      )}

      {/* Step 2: Choose File */}
      {step === 2 && (
        <div className="mb-4 space-y-2">
          <input type="file" onChange={handleFileSelect} />
          <div className="flex gap-2">
            <button
              onClick={handleAddFile}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
              disabled={!newFile}
            >
              Add to List
            </button>
            <button
              onClick={() => setStep(1)}
              className="px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* File List */}
      <div className="max-h-60 overflow-y-auto mb-4">
        <table className="w-full border text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="p-2">
                  {editingIndex === idx ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border rounded px-1 py-0.5 w-full"
                    />
                  ) : (
                    f.name
                  )}
                </td>
                <td className="p-2 text-gray-600">{f.date}</td>
                <td className="p-2 text-gray-600">
                  {editingIndex === idx ? (
                    <input type="file" onChange={handleEditFileSelect} />
                  ) : (
                    f.type
                  )}
                </td>
                <td className="p-2 text-center space-x-1">
                  {editingIndex === idx ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="px-2 py-1 bg-green-500 text-white rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="px-2 py-1 bg-gray-400 text-white rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(idx)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(idx)}
                        className="px-2 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Final Save */}
      <div className="flex justify-end">
        <button
          onClick={handleFinalSave}
          className="px-4 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50"
          disabled={!files.length || isUploading}
        >
          {isUploading ? "Uploading..." : "Save All & Close"}
        </button>
      </div>
    </div>
  );
}
