import React from 'react';

function Sidebar({ telaAtual, aoNavegar, aoSair, cliente }) {
  const itens = [
    { id: 'dashboard', label: 'Home', icon: '&#x1F3E0;' },
    { id: 'contas', label: 'Minhas Contas', icon: '&#x1F4B3;' },
    { id: 'transferencia', label: 'Transferir', icon: '&#x1F4B8;' },
    { id: 'extrato', label: 'Extrato', icon: '&#x1F4CB;' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">&#x1F3E6; Banco Automação</div>
      </div>
      <nav className="sidebar-nav">
        {itens.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${telaAtual === item.id ? 'active' : ''}`}
            onClick={() => aoNavegar(item.id)}
          >
            <span dangerouslySetInnerHTML={{ __html: item.icon }} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="user-icon">&#x1F464;</span>
          <div>
            <p className="user-name">{cliente?.nome}</p>
            <p className="user-cpf">CPF: {cliente?.cpf}</p>
          </div>
        </div>
        <button className="btn-logout" onClick={aoSair}>Sair</button>
      </div>
    </aside>
  );
}

export default Sidebar;
