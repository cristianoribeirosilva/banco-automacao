import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function FazerPix({ cliente, onVoltar }) {
  const [chave, setChave] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [chaveTocada, setChaveTocada] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [chaveEncontrada, setChaveEncontrada] = useState(null);
  const [buscandoChave, setBuscandoChave] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const mostrarMsg = (texto, tipo = 'erro') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(''), 4000);
  };

  const buscarChave = async () => {
    if (!chave) return;
    setBuscandoChave(true);
    setChaveEncontrada(null);
    try {
      const response = await axios.get(`${API_URL}/chaves-pix/cliente/${cliente.id}`);
      const minhaChave = response.data.find(c => c.chave === chave);
      if (minhaChave) {
        mostrarMsg('Você não pode fazer Pix para sua própria chave');
        setBuscandoChave(false);
        return;
      }

      const allChaves = await axios.get(`${API_URL}/chaves-pix/buscar`, { params: { chave } });
      if (allChaves.data.length === 0) {
        mostrarMsg('Chave Pix não encontrada');
        setChaveEncontrada(null);
      } else {
        setChaveEncontrada(allChaves.data[0]);
      }
    } catch (err) {
      mostrarMsg('Erro ao buscar chave Pix');
    }
    setBuscandoChave(false);
  };

  const handleBlurChave = () => {
    setChaveTocada(true);
    if (chave) buscarChave();
  };

  const valorNumerico = parseFloat(valor) || 0;
  const valorValido = valorNumerico > 0;

  const handleTransferir = async (e) => {
    e.preventDefault();
    if (!chaveEncontrada) { mostrarMsg('Informe uma chave Pix válida'); return; }
    if (!valorValido) { mostrarMsg('Informe um valor válido'); return; }

    setCarregando(true);
    try {
      const contasRes = await axios.get(`${API_URL}/contas/cliente/${cliente.id}`);
      if (contasRes.data.length === 0) {
        mostrarMsg('Você não possui contas cadastradas');
        setCarregando(false);
        return;
      }

      const contaOrigem = contasRes.data[0];
      if (contaOrigem.saldo < valorNumerico) {
        mostrarMsg('Saldo insuficiente');
        setCarregando(false);
        return;
      }

      const destinoRes = await axios.get(`${API_URL}/clientes/${chaveEncontrada.cliente_id}`);
      const contasDestino = await axios.get(`${API_URL}/contas/cliente/${chaveEncontrada.cliente_id}`);
      if (contasDestino.data.length === 0) {
        mostrarMsg('Destinatário não possui contas');
        setCarregando(false);
        return;
      }

      await axios.post(`${API_URL}/contas/transferir`, {
        conta_origem_id: contaOrigem.id,
        conta_destino_numero: contasDestino.data[0].numero,
        valor: valorNumerico
      });

      setSucesso(true);
      setCarregando(false);
    } catch (err) {
      mostrarMsg(err.response?.data?.error || 'Erro ao realizar transferência');
      setCarregando(false);
    }
  };

  if (sucesso) {
    return (
      <div className="pix-page">
        <div className="pix-header">
          <button className="btn-voltar" onClick={onVoltar}>&#x2190; Voltar</button>
          <h1>Fazer Pix</h1>
        </div>
        <div className="card pix-sucesso">
          <div className="sucesso-icon">&#x2705;</div>
          <h2>Pix realizado com sucesso!</h2>
          <p className="sucesso-valor">R$ {valorNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="sucesso-destino">Enviado para: {chaveEncontrada?.chave}</p>
          <button className="btn btn-primary" onClick={onVoltar}>Voltar para Área Pix</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pix-page">
      <div className="pix-header">
        <button className="btn-voltar" onClick={onVoltar}>&#x2190; Voltar</button>
        <h1>Fazer Pix</h1>
      </div>
      <p className="subtitle">Transfira dinheiro usando uma chave Pix</p>

      {mensagem && <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>}

      <div className="card">
        <form onSubmit={handleTransferir}>
          <div className="form-group">
            <label>Chave Pix do destinatário</label>
            <input
              type="text"
              value={chave}
              onChange={(e) => { setChave(e.target.value); setChaveEncontrada(null); setMensagem(''); }}
              onBlur={handleBlurChave}
              placeholder="E-mail, CPF, celular ou chave aleatória"
              required
            />
            {buscandoChave && <span className="campo-info">Buscando chave...</span>}
            {chaveTocada && chaveEncontrada && (
              <div className="chave-encontrada">
                <span>&#x2714; Chave encontrada</span>
                <p>Titular: {chaveEncontrada.cliente_nome || 'Cliente'}</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Valor (R$)</label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição (opcional)</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Pagamento de conta"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={carregando || !chaveEncontrada || !valorValido}
          >
            {carregando ? 'Enviando...' : 'Confirmar Pix'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FazerPix;
