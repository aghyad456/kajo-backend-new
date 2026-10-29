import React from "react";
import loadingImg from "../../assets/Loading2.svg";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 z-999 w-full h-auto overflow-hidden bg-white dark:bg-[#101828]">
      
      <img 
        src={loadingImg} 
        alt="Loading..." 
        className="w-full h-full object-cover shadow-2xl transition-opacity duration-500"
      />

    </div>
  );
}