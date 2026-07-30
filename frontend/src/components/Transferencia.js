import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function formatarMoeda(valor) {
  const apenasNumeros = valor.replace(/\D/g, '');
  if (!apenasNumeros) return '';
  const centavos = parseInt(apenasNumeros, 10);
  const reais = (centavos / 100).toFixed(2);
  return reais.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseMoeda(valorFormatado) {
  const semPonto = valorFormatado.replace(/\./g, '');
  const virgulaPonto = semPonto.replace(',', '.');
  return parseFloat(virgulaPonto) || 0;
}

function Transferencia({ cliente }) {
  const [contas, setContas] = useState([]);
  const [contaOrigemId, setContaOrigemId] = useState('');
  const [contaDestino, setContaDestino] = useState('');
  const [valor, setValor] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleChangeValor = (e) => {
    setValor(formatarMoeda(e.target.value));
  };

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
    const valorNumerico = parseMoeda(valor);
    if (!contaOrigemId || !contaDestino || valorNumerico <= 0) {
      return mostrarMensagem('Preencha todos os campos', 'erro');
    }
    if (contaOrigemId === contaDestino) {
      return mostrarMensagem('Contas de origem e destino devem ser diferentes', 'erro');
    }
    try {
      await axios.post(`${API_URL}/contas/transferir`, {
        conta_origem_id: parseInt(contaOrigemId),
        conta_destino_numero: contaDestino,
        valor: valorNumerico
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
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={valor}
              onChange={handleChangeValor}
              maxLength={15}
            />
            {valor && parseMoeda(valor) > 0 && (
              <span className="campo-info">R$ {valor}</span>
            )}
          </div>
          <button type="submit" className="btn btn-primary btn-full">Transferir</button>
        </form>
      </div>
    </div>
  );
}

export default Transferencia;
