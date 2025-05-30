import React, { useState, useRef } from "react";
import "./Home.css"; // For styling
import logo from "../../Images/logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddFile from "../AddFile/AddFile";
import EditFile from "../EditFile/EditFile";
import ViewFile from "../ViewFile/ViewFile";
import Report from "../Report/Report";
import { useEffect } from "react";
import Graph from "../Graph/Graph";
import { useLocation } from "react-router-dom";

const Home = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const formRef = useRef(null);
  const navigate = useNavigate();

  const [showAddFile, setShowAddFile] = useState(false);
  const [showEditFile, setshowEditFile] = useState(false);

  const [searchedRecord, setSearchedRecord] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);

  const location = useLocation();

  useEffect(() => {
    // When path is '/', reset states to show home page
    if (location.pathname === "/") {
      setShowAddFile(false);
      setshowEditFile(false);
      setCurrentPage("home");
    }
  }, [location]);

  useEffect(() => {
    const fetchRecentRecords = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/records/recent/"
        );
        setRecentRecords(response.data);
      } catch (error) {
        console.error("Error fetching recent records:", error);
      }
    };

    fetchRecentRecords();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/records/search/?UPIN=${searchQuery}`
      );
      if (response.data && response.data.length > 0) {
        setSearchedRecord(response.data[0]); // Assuming response is an array of matching records
      } else {
        setSearchedRecord(null); // Clear if no match
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchedRecord(null);
    } finally {
      setSearchQuery(""); // ✅ Reset the input field
    }
  };

  const handleRecordAdded = (newRecord) => {
    setSearchedRecord(newRecord); // Update the searchedRecord state
  };

  const renderContent = () => {
    if (showAddFile) {
      return <AddFile onRecordAdded={handleRecordAdded} />; // Pass the callback
    }
    if (showEditFile) {
      return <EditFile />;
    }
    switch (currentPage) {
      case "files":
        return <ViewFile />;

      case "report":
        return <Report />;

      case "graph":
        return <Graph />;

      case "history":
        return (
          <div>
            <h1>History Content</h1>
          </div>
        );

      case "home":
      default:
        return (
          <div ref={formRef}>
            <div className="top-actions">
              <button
                className="action-button"
                onClick={() => setShowAddFile(true)}
              >
                Add New File
              </button>
              <button
                className="action-button"
                onClick={() => setshowEditFile(true)}
              >
                Edit File
              </button>
              <div className="search-container">
                <button className="search-button" onClick={handleSearch}>
                  Search
                </button>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by UPIN"
                  className="search-input"
                />
              </div>
            </div>
            {/* Table Below the Buttons */}
            <table className="data-table">
              <thead>
                <tr>
                  <th>ባለቤት ስም</th>
                  <th>የነባር የማህደር ኮደ</th>
                  <th>UPIN</th>
                  <th>የይዞታው አገልግሎት</th>
                  <th>የቦታው ደረጃ</th>
                  <th>የይዞታየተገኘበት ሁኔታ</th>
                  <th>የቦታ ስፋት</th>
                  <th>ቀበሌ</th>
                  <th>የይዞታ ማራጋገጫ</th>
                  <th>እዳና እገዳ</th>
                </tr>
              </thead>
              <tbody>
                {/* Searched Record in First Row */}
                {searchedRecord && (
                  <tr key="searched">
                    <td>{searchedRecord.PropertyOwnerName}</td>
                    <td>{searchedRecord.ExistingArchiveCode}</td>
                    <td>{searchedRecord.UPIN}</td>
                    <td>{searchedRecord.ServiceOfEstate}</td>
                    <td>{searchedRecord.placeLevel}</td>
                    <td>{searchedRecord.possessionStatus}</td>
                    <td>{searchedRecord.spaceSize}</td>
                    <td>{searchedRecord.kebele}</td>
                    <td>{searchedRecord.proofOfPossession}</td>
                    <td>{searchedRecord.DebtRestriction}</td>
                  </tr>
                )}

                {/* Recent Records in Last Four Rows */}
                {recentRecords.map((record, index) => (
                  <tr key={`recent-${index}`}>
                    <td>{record.PropertyOwnerName}</td>
                    <td>{record.ExistingArchiveCode}</td>
                    <td>{record.UPIN}</td>
                    <td>{record.ServiceOfEstate}</td>
                    <td>{record.placeLevel}</td>
                    <td>{record.possessionStatus}</td>
                    <td>{record.spaceSize}</td>
                    <td>{record.kebele}</td>
                    <td>{record.proofOfPossession}</td>
                    <td>{record.DebtRestriction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };
  return renderContent();
};

export default Home;
