import React, { useState } from 'react';
import MinhasChavesPix from './MinhasChavesPix';
import FazerPix from './FazerPix';

function Pix({ cliente, onVoltar }) {
  const [tela, setTela] = useState('menu');

  const operacoes = [
    { id: 'fazer', label: 'Fazer Pix', icon: '&#x1F4B8;' },
    { id: 'receber', label: 'Receber Pix', icon: '&#x1F4E5;' },
    { id: 'qrcode', label: 'Pix com QR Code', icon: '&#x1F4F1;' },
    { id: 'parcelado', label: 'Pix Parcelado', icon: '&#x1F4C5;' },
    { id: 'automatico', label: 'Pix Automático', icon: '&#x2699;' },
  ];

  const configuracoes = [
    { id: 'dispositivos', label: 'Meus dispositivos', icon: '&#x1F4F1;' },
    { id: 'agendamentos', label: 'Meus agendamentos', icon: '&#x1F4C5;' },
    { id: 'chaves', label: 'Minhas chaves Pix', icon: '&#x1F511;' },
    { id: 'extrato', label: 'Extrato Pix e Devoluções', icon: '&#x1F4CB;' },
    { id: 'limites', label: 'Meus Limites Pix', icon: '&#x1F4CF;' },
    { id: 'contestar', label: 'Contestar Pix', icon: '&#x2696;' },
    { id: 'reclamacoes', label: 'Reclamações', icon: '&#x1F4AC;' },
  ];

  if (tela === 'fazer') {
    return <FazerPix cliente={cliente} onVoltar={() => setTela('menu')} />;
  }

  if (tela === 'chaves') {
    return <MinhasChavesPix cliente={cliente} onVoltar={() => setTela('menu')} />;
  }

  return (
    <div className="pix-page">
      <div className="pix-header">
        <button className="btn-voltar" onClick={onVoltar}>
          &#x2190; Voltar
        </button>
        <h1>Área Pix</h1>
      </div>
      <p className="subtitle">Escolha uma opção abaixo</p>

      <div className="card">
        <h2>Operações Pix</h2>
        <div className="pix-grid">
          {operacoes.map((item) => (
            <button
              key={item.id}
              className="pix-btn"
              onClick={() => {
                if (item.id === 'fazer') setTela('fazer');
              }}
            >
              <span className="pix-btn-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
              <span className="pix-btn-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Configurações Pix</h2>
        <div className="pix-grid">
          {configuracoes.map((item) => (
            <button
              key={item.id}
              className="pix-btn"
              onClick={() => {
                if (item.id === 'chaves') setTela('chaves');
              }}
            >
              <span className="pix-btn-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
              <span className="pix-btn-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pix;
