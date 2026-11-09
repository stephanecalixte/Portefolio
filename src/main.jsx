import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import "./fonts.css";

import Navbar from "./components/navbar/Navbar.jsx";
import Footer from "./components/footer/footer.jsx";
import Home from "./Home.jsx";
import Projects from "./pages/project/Projects.jsx";
import About from "./pages/about/About.jsx";



createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>
);