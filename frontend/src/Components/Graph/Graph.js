import React from "react";
import ServiceOfEstatePieChart from "./ServiceOfEstatePieChart";
import ProofOfPossessionPieChart from "./ProofOfPossessionPieChart";
import "./Graph.css"; //  a CSS file for styling

const Graph = () => {
  return (
    <div>
      <div className="graph-container">
        <div className="graph-1">
          <h2>የይዞታው አገልግሎት ግራፍ</h2>
          <ServiceOfEstatePieChart />
        </div>
        <div className="graph-2">
          <h2>የይዞታ ማራጋገጫ ግራፍ</h2>
          <ProofOfPossessionPieChart />
        </div>
      </div>
    </div>
  );
};
export default Graph;
