import React from "react";
import ServiceOfEstatePieChart from "./ServiceOfEstatePieChart";
import ProofOfPossessionPieChart from "./ProofOfPossessionPieChart";
import "./Graph.css";

const Graph = () => {
  return (
    <div>
      <div className="graph-container">
        {/* Render Graph1 */}
        <div className="graph-1">
          <h2>የይዞታው አገልግሎት ግራፍ</h2>
          <ServiceOfEstatePieChart />
        </div>

        {/* Render Graph2 */}
        <div className="graph-2">
          <h2>የይዞታ ማረጋገጫ ግራፍ</h2>
          <ProofOfPossessionPieChart />
        </div>
      </div>
    </div>
  );
};

export default Graph;
