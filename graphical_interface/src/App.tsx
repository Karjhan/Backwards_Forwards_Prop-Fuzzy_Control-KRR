import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import FuzzyControlContent from './components/FuzzyControlContent/FuzzyControlContent';

function App() {
  const [openBasic, setOpenBasic] = useState<boolean>(false); 
  const links = [
    { name: 'Backwards-Forwards-Chaining', href: '/backwards-forwards-chaining' },
    { name: 'Fuzzy-Control', href: '/fuzzy-control' },
    { name: 'Home', href: '/' },
  ];

  return (
    <BrowserRouter>
      <div className="container w-100 p-0 m-0 mw-100 d-flex flex-col" style={{flexWrap:"wrap", alignContent: "flex-start"}}>
        <div className="row w-100 p-0 m-0">
          <div className="col p-0">
            <Navbar openBasic={openBasic} setOpenBasic={setOpenBasic} links={links} brandName="Project1-KRR" />
          </div>
        </div>
        <div className="row w-100 p-0 m-0 h-100">
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/fuzzy-control" element={<FuzzyControlContent/>} />
          </Routes>
        </div>
       
      </div>
    </BrowserRouter>
  )
}

export default App
