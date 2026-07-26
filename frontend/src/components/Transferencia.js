import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function Transferencia({ cliente }) {
  const [contas, setContas] = useState([]);
  const [contaOrigemId, setContaOrigemId] = useState('');
  const [contaDestino, setContaDestino] = useState('');
  const [valor, setValor] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const carregarContas = async () => {
      try {
        const response = await axios.get(`${API_URL}/contas/cliente/${cliente.id}`);
        setContas(response.data);
        if (response.data.length > 0) setContaOrigemId(response.data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    carregarContas();
  }, [cliente.id]);

  const mostrarMensagem = (texto, tipo = 'sucesso') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(''), 4000);
  };

  const transferir = async (e) => {
    e.preventDefault();
    if (!contaOrigemId || !contaDestino || !valor) {
      return mostrarMensagem('Preencha todos os campos', 'erro');
    }
    if (contaOrigemId === contaDestino) {
      return mostrarMensagem('Contas de origem e destino devem ser diferentes', 'erro');
    }
    try {
      await axios.post(`${API_URL}/contas/transferir`, {
        conta_origem_id: parseInt(contaOrigemId),
        conta_destino_numero: contaDestino,
        valor: parseFloat(valor)
      });
      mostrarMensagem('Transferência realizada com sucesso!');
      setContaDestino('');
      setValor('');
    } catch (err) {
      mostrarMensagem(err.response?.data?.error || 'Erro ao transferir', 'erro');
    }
  };

  return (
    <div className="transferencia-page">
      <h1>Transferir</h1>
      <p className="subtitle">Realize transferências entre contas</p>

      {mensagem && <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>}

      <div className="card">
        <form onSubmit={transferir}>
          <div className="form-group">
            <label>Conta de Origem</label>
            <select value={contaOrigemId} onChange={(e) => setContaOrigemId(e.target.value)}>
              <option value="">Selecione uma conta</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tipo === 'corrente' ? 'Corrente' : 'Poupança'} - Nº {c.numero} (R$ {parseFloat(c.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Número da Conta de Destino</label>
            <input type="text" placeholder="Digite o número da conta" value={contaDestino} onChange={(e) => setContaDestino(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Valor (R$)</label>
            <input type="number" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} min="0.01" step="0.01" />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Transferir</button>
        </form>
      </div>
    </div>
  );
}

export default Transferencia;
