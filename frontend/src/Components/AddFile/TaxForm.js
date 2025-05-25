import React from "react";

const TaxForm = ({ debt }) => {
  return (
    <table
      style={{
        borderCollapse: "collapse",
        marginLeft: "10px",
        minWidth: "50px",
        textAlign: "center",
        fontSize: "12px",
        height: "50px",
      }}
    >
      <thead>
        <tr>
          <th
            style={{
              border: "1px solid #ccc",
              padding: "3px",
              backgroundColor: "#f2f2f2",
            }}
          >
            ውዝፍ
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td
            style={{
              border: "1px solid #ccc",
              padding: "4px",
              height: "20px",
            }}
          >
            {debt}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default TaxForm;
