import React from "react";

export default function GenericTable({ headers, data }) {
  return (
    <div className="w-full overflow-hidden rounded-[50px] border border-gray-500 shadow-sm mb-10" dir="rtl">
   
      <table className="w-full text-center border-separate border-spacing-0 bg-fourthColor">
        <thead>
          <tr className="text-mainColor">
            {headers.map((head, index) => (
              <th 
                key={index} 
                className="p-4 font-bold border-l border-b border-gray-500 last:border-l-0"
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-fourthColor">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-[#FFEFB5] cursor-pointer transition-colors">
              {Object.values(row).map((cell, cellIndex) => (
                <td 
                  key={cellIndex} 
                  className={`p-4 text-[#3F3D56] border-l border-gray-500 last:border-l-0 ${
                    rowIndex !== data.length - 1 ? "border-b" : ""
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}