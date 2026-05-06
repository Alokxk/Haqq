import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Result from "./pages/Result";

export type Language = "en" | "hi";

function App() {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  return (
    <BrowserRouter>
      <Navbar language={language} onLanguageToggle={toggleLanguage} />
      <Routes>
        <Route path="/" element={<Home language={language} />} />
        <Route path="/result" element={<Result language={language} />} />
        <Route path="/s/:id" element={<Result language={language} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
