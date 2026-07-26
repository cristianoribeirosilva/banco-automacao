import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function Dashboard({ cliente, onNavegar }) {
  const [contas, setContas] = useState([]);
  const [transacoes, setTransacoes] = useState([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const contasRes = await axios.get(`${API_URL}/contas/cliente/${cliente.id}`);
        setContas(contasRes.data);
        if (contasRes.data.length > 0) {
          const transRes = await axios.get(`${API_URL}/transacoes/conta/${contasRes.data[0].id}`);
          setTransacoes(transRes.data.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      }
    };
    carregarDados();
  }, [cliente.id]);

  const saldoTotal = contas.reduce((acc, c) => acc + parseFloat(c.saldo), 0);
  const faturaAtual = 847.50;

  return (
    <div className="dashboard">
      <h1>Home</h1>
      <p className="subtitle">Bem-vindo(a), {cliente.nome}</p>

      <div className="saldo-card">
        <p className="saldo-label">Saldo da conta</p>
        <p className="saldo-valor-grande">R$ {saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        <p className="saldo-conta">{contas.length > 0 && `Conta ${contas[0].tipo === 'corrente' ? 'Corrente' : 'Poupança'} - Ag. ${contas[0].agencia} / N° ${contas[0].numero}`}</p>
      </div>

      <div className="card">
        <h2>Atalhos</h2>
        <div className="atalhos-grid">
          <button className="atalho-btn" onClick={() => onNavegar('pix')}>
            <span className="atalho-icon">&#x1F4B3;</span>
            <span>Área Pix</span>
          </button>
          <button className="atalho-btn">
            <span className="atalho-icon">&#x1F4C4;</span>
            <span>Boletos</span>
          </button>
          <button className="atalho-btn">
            <span className="atalho-icon">&#x1F4F1;</span>
            <span>Recarga de celular</span>
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Cartão de Crédito</h2>
        <div className="cartao-conteudo">
          <div className="cartao-info">
            <p className="cartao-label">Fatura atual</p>
            <p className="cartao-valor">R$ {faturaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <button className="btn btn-primary">
            <span>&#x1F4B3; Meus cartões</span>
          </button>
        </div>
      </div>

      {transacoes.length > 0 && (
        <div className="card">
          <h2>Últimas Movimentações</h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
                  <td><span className={`badge badge-${t.tipo}`}>{t.tipo}</span></td>
                  <td className={t.conta_origem_id === contas[0]?.id && t.tipo !== 'deposito' ? 'valor-negativo' : 'valor-positivo'}>
                    {t.conta_origem_id === contas[0]?.id && t.tipo !== 'deposito' ? '-' : '+'} R$ {parseFloat(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {contas.length === 0 && (
        <div className="card">
          <p className="vazio">Você ainda não possui contas. Crie uma na aba "Minhas Contas".</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
