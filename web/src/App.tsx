import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
import Result from "./pages/Result";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";


export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/result/:consultationId' element={<Result />} />
        <Route path='/privacy' element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
