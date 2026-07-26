import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

function Contas({ cliente }) {
  const [contas, setContas] = useState([]);
  const [tipo, setTipo] = useState('corrente');
  const [depositoContaId, setDepositoContaId] = useState(null);
  const [depositoValor, setDepositoValor] = useState('');
  const [saqueContaId, setSaqueContaId] = useState(null);
  const [saqueValor, setSaqueValor] = useState('');
  const [mensagem, setMensagem] = useState('');

  const carregarContas = async () => {
    try {
      const response = await axios.get(`${API_URL}/contas/cliente/${cliente.id}`);
      setContas(response.data);
    } catch (err) {
      mostrarMensagem('Erro ao carregar contas', 'erro');
    }
  };

  useEffect(() => { carregarContas(); }, [cliente.id]);

  const mostrarMensagem = (texto, tipo = 'sucesso') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(''), 3000);
  };

  const criarConta = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/contas`, { cliente_id: cliente.id, tipo });
      mostrarMensagem('Conta criada com sucesso!');
      carregarContas();
    } catch (err) {
      mostrarMensagem(err.response?.data?.error || 'Erro ao criar conta', 'erro');
    }
  };

  const depositar = async (contaId) => {
    if (!depositoValor || depositoValor <= 0) return mostrarMensagem('Informe um valor válido', 'erro');
    try {
      await axios.post(`${API_URL}/contas/${contaId}/depositar`, { valor: parseFloat(depositoValor) });
      mostrarMensagem('Depósito realizado com sucesso!');
      setDepositoValor('');
      setDepositoContaId(null);
      carregarContas();
    } catch (err) {
      mostrarMensagem(err.response?.data?.error || 'Erro ao depositar', 'erro');
    }
  };

  const sacar = async (contaId) => {
    if (!saqueValor || saqueValor <= 0) return mostrarMensagem('Informe um valor válido', 'erro');
    try {
      await axios.post(`${API_URL}/contas/${contaId}/sacar`, { valor: parseFloat(saqueValor) });
      mostrarMensagem('Saque realizado com sucesso!');
      setSaqueValor('');
      setSaqueContaId(null);
      carregarContas();
    } catch (err) {
      mostrarMensagem(err.response?.data?.error || 'Erro ao sacar', 'erro');
    }
  };

  return (
    <div className="contas-page">
      <h1>Minhas Contas</h1>
      <p className="subtitle">Gerencie suas contas bancárias</p>

      {mensagem && <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>}

      <div className="card">
        <h2>Nova Conta</h2>
        <form onSubmit={criarConta} className="form-inline">
          <div className="form-group">
            <label>Tipo de Conta</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="corrente">Corrente</option>
              <option value="poupanca">Poupança</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Criar Conta</button>
        </form>
      </div>

      {contas.length > 0 ? (
        <div className="contas-grid">
          {contas.map((conta) => (
            <div key={conta.id} className="conta-card-detalhe">
              <div className="conta-card-header">
                <div>
                  <span className={`conta-tipo-badge ${conta.tipo}`}>
                    {conta.tipo === 'corrente' ? 'Conta Corrente' : 'Poupança'}
                  </span>
                </div>
                <span className="conta-agencia">Ag. {conta.agencia}</span>
              </div>
              <p className="conta-numero-grande">Nº {conta.numero}</p>
              <p className="conta-saldo-grande">R$ {parseFloat(conta.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>

              <div className="conta-acoes">
                {depositoContaId === conta.id ? (
                  <div className="acao-inline">
                    <input type="number" placeholder="Valor" value={depositoValor} onChange={(e) => setDepositoValor(e.target.value)} min="0.01" step="0.01" />
                    <button className="btn btn-primary btn-sm" onClick={() => depositar(conta.id)}>Confirmar</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setDepositoContaId(null); setDepositoValor(''); }}>Cancelar</button>
                  </div>
                ) : saqueContaId === conta.id ? (
                  <div className="acao-inline">
                    <input type="number" placeholder="Valor" value={saqueValor} onChange={(e) => setSaqueValor(e.target.value)} min="0.01" step="0.01" />
                    <button className="btn btn-primary btn-sm" onClick={() => sacar(conta.id)}>Confirmar</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setSaqueContaId(null); setSaqueValor(''); }}>Cancelar</button>
                  </div>
                ) : (
                  <div className="acao-inline">
                    <button className="btn btn-deposito" onClick={() => setDepositoContaId(conta.id)}>Depositar</button>
                    <button className="btn btn-saque" onClick={() => setSaqueContaId(conta.id)}>Sacar</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card"><p className="vazio">Nenhuma conta encontrada. Crie sua primeira conta acima.</p></div>
      )}
    </div>
  );
}

export default Contas;
