import './App.css';
import { Route , Routes } from 'react-router-dom';
import V2lettercard from './v2let/v2lettercard.js';
import Home from './v2let/Home.js';
function App() {
  return (
    <div className="App">
     
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path="/v2lettercard" element={<V2lettercard/>}/>
        
      </Routes>
        
    </div>
  );
}

export default App;
