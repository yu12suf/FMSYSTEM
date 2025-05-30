import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import FileUploader from "./Components/FileUploader/FileUploader";
import Layout from "./Components/Layout/Layout";
import AddFile from "./Components/AddFile/AddFile";
import Graph from "./Components/Graph/Graph";
import ViewFile from "./Components/ViewFile/ViewFile";
import Report from "./Components/Report/Report";
import EditFiles from "./Components/EditFile/EditFile";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<FileUploader />} />
          <Route path="/addfile" element={<AddFile />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/files" element={<ViewFile />} />
          <Route path="/report" element={<Report />} />
          <Route path="/editfile" element={<EditFiles />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
