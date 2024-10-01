import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import ClienteForm from './components/ClienteForm';
import LoginForm from './components/LoginForm';
import Principal from './components/Principal';
import PedidoForm from './components/PedidoForm';
import './App.css';

function App() {
  return (
    <Router>
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/cliente" element={<ClienteForm />} />
        <Route path='/principal' element={<Principal />} />
        <Route path='/pedidos' element={<PedidoForm />} />
      </Routes>
    </div>
    </Router>
  );
}

export default App;
