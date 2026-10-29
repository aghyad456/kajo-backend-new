import React from "react";
import kajoLoaderImg from "../../assets/loading.svg"; 

export default function KajoLoader() {
  return (
    <div className="fixed inset-0 z-999 flex flex-col items-center justify-center bg-white dark:bg-[#101828] transition-colors duration-500">
      
      <div className="relative">
        <img 
          src={kajoLoaderImg} 
          alt="Loading..." 
          className="w-32 h-32 md:w-40 md:h-40 animate-spin object-contain" 
        />
      </div>

      <p className="mt-8 text-mainColor dark:text-fourthColor text-2xl font-black italic animate-pulse">
        لحظة من فضلك... كاجو عم يجهزلك الغراض 🐾
      </p>
    </div>
  );
}