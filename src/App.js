import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './v2let/Home';
import V2lettercard from './v2let/v2lettercard';


function Main() {
  return (
    <Router basename="/games/wsletters">
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<V2lettercard />} />
      </Routes>
    </Router>
  );
}

export default Main;
