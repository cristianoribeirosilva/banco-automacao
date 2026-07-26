import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

function Extrato({ cliente }) {
  const [contas, setContas] = useState([]);
  const [contaSelecionada, setContaSelecionada] = useState('');
  const [transacoes, setTransacoes] = useState([]);

  useEffect(() => {
    const carregarContas = async () => {
      try {
        const response = await axios.get(`${API_URL}/contas/cliente/${cliente.id}`);
        setContas(response.data);
        if (response.data.length > 0) setContaSelecionada(response.data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    carregarContas();
  }, [cliente.id]);

  useEffect(() => {
    if (!contaSelecionada) return;
    const carregarTransacoes = async () => {
      try {
        const response = await axios.get(`${API_URL}/transacoes/conta/${contaSelecionada}`);
        setTransacoes(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    carregarTransacoes();
  }, [contaSelecionada]);

  const contaAtual = contas.find(c => c.id === parseInt(contaSelecionada));

  return (
    <div className="extrato-page">
      <h1>Extrato</h1>
      <p className="subtitle">Histórico de movimentações</p>

      <div className="card">
        <div className="form-group">
          <label>Selecione a conta</label>
          <select value={contaSelecionada} onChange={(e) => setContaSelecionada(e.target.value)}>
            <option value="">Selecione uma conta</option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tipo === 'corrente' ? 'Corrente' : 'Poupança'} - Nº {c.numero}
              </option>
            ))}
          </select>
        </div>

        {contaAtual && (
          <div className="extrato-saldo">
            <span>Saldo atual:</span>
            <span className="saldo-valor">R$ {parseFloat(contaAtual.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>

      {transacoes.length > 0 ? (
        <div className="card">
          <h2>Movimentações</h2>
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.map((t) => {
                const ehOrigem = t.conta_origem_id === parseInt(contaSelecionada);
                const ehDeposito = t.tipo === 'deposito';
                return (
                  <tr key={t.id}>
                    <td>{new Date(t.created_at).toLocaleString('pt-BR')}</td>
                    <td><span className={`badge badge-${t.tipo}`}>{t.tipo}</span></td>
                    <td>{t.descricao || '-'}</td>
                    <td className={ehOrigem && !ehDeposito ? 'valor-negativo' : 'valor-positivo'}>
                      {ehOrigem && !ehDeposito ? '-' : '+'} R$ {parseFloat(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : contaSelecionada ? (
        <div className="card"><p className="vazio">Nenhuma movimentação encontrada para esta conta.</p></div>
      ) : (
        <div className="card"><p className="vazio">Selecione uma conta para ver o extrato.</p></div>
      )}
    </div>
  );
}

export default Extrato;
