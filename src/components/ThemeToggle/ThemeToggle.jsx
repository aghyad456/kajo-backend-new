import React, { useEffect, useState } from 'react';
import lightBulb from "../../assets/light.svg";
import darkBulb from "../../assets/dark.svg";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="cursor-pointer" onClick={toggleTheme}>
      <img 
        src={theme === "light" ? darkBulb : lightBulb} 
        alt="Toggle Theme" 
        className="h-20 w-full transition-transform active:scale-90 hover:scale-110" 
      />
    </div>
  );
}