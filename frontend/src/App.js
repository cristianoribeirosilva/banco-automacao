import React, { useState } from 'react';
import Login from './components/Login';
import RecuperarSenha from './components/RecuperarSenha';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Contas from './components/Contas';
import Transferencia from './components/Transferencia';
import Extrato from './components/Extrato';
import Pix from './components/Pix';
import './App.css';

function App() {
  const [clienteLogado, setClienteLogado] = useState(null);
  const [telaAtual, setTelaAtual] = useState('dashboard');
  const [telaAuth, setTelaAuth] = useState('login');

  const aoLogar = (cliente) => setClienteLogado(cliente);
  const aoSair = () => { setClienteLogado(null); setTelaAtual('dashboard'); };

  if (!clienteLogado) {
    if (telaAuth === 'recuperar') {
      return <RecuperarSenha aoVoltar={() => setTelaAuth('login')} />;
    }
    return <Login aoLogar={aoLogar} aoEsqueciSenha={() => setTelaAuth('recuperar')} />;
  }

  const renderizarTela = () => {
    switch (telaAtual) {
      case 'dashboard': return <Dashboard cliente={clienteLogado} onNavegar={setTelaAtual} />;
      case 'contas': return <Contas cliente={clienteLogado} />;
      case 'transferencia': return <Transferencia cliente={clienteLogado} />;
      case 'extrato': return <Extrato cliente={clienteLogado} />;
      case 'pix': return <Pix cliente={clienteLogado} onVoltar={() => setTelaAtual('dashboard')} />;
      default: return <Dashboard cliente={clienteLogado} onNavegar={setTelaAtual} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar telaAtual={telaAtual} aoNavegar={setTelaAtual} aoSair={aoSair} cliente={clienteLogado} />
      <main className="main-content">{renderizarTela()}</main>
    </div>
  );
}

export default App;
