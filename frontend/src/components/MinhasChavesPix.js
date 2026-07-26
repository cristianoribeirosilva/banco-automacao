import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

function formatarTelefone(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);
  if (numeros.length <= 10) {
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return numeros
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function validarCPF(cpf) {
  const numeros = cpf.replace(/\D/g, '');
  if (numeros.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numeros)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(numeros.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(numeros.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(numeros.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(numeros.charAt(10))) return false;

  return true;
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarTelefone(tel) {
  const numeros = tel.replace(/\D/g, '');
  return numeros.length === 11;
}

function MinhasChavesPix({ cliente, onVoltar }) {
  const [chaves, setChaves] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [mostrarCadastrar, setMostrarCadastrar] = useState(false);
  const [novaChave, setNovaChave] = useState('');
  const [tipoChave, setTipoChave] = useState('email');
  const [chaveTocada, setChaveTocada] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const temChaveCPF = chaves.some(chave => chave.tipo === 'cpf');

  const carregarChaves = async () => {
    try {
      const response = await axios.get(`${API_URL}/chaves-pix/cliente/${cliente.id}`);
      setChaves(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { carregarChaves(); }, [cliente.id]);

  const mostrarMsg = (texto, tipo = 'sucesso') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(''), 3000);
  };

  const chaveValida = () => {
    if (tipoChave === 'aleatoria') return true;
    if (tipoChave === 'cpf') return validarCPF(cliente.cpf);
    if (!novaChave) return false;
    switch (tipoChave) {
      case 'email': return validarEmail(novaChave);
      case 'celular': return validarTelefone(novaChave);
      default: return false;
    }
  };

  const handleChangeChave = (e) => {
    let valor = e.target.value;
    if (tipoChave === 'celular') {
      valor = formatarTelefone(valor);
    }
    setNovaChave(valor);
  };

  const cadastrarChave = async (e) => {
    e.preventDefault();
    const chaveParaEnviar = tipoChave === 'cpf' ? cliente.cpf : novaChave;
    if (!chaveValida()) { mostrarMsg('Chave inválida', 'erro'); return; }
    setCarregando(true);
    try {
      await axios.post(`${API_URL}/chaves-pix`, {
        cliente_id: cliente.id,
        chave: chaveParaEnviar,
        tipo: tipoChave
      });
      mostrarMsg('Chave cadastrada com sucesso!');
      setNovaChave('');
      setMostrarCadastrar(false);
      setChaveTocada(false);
      setTipoChave('email');
      carregarChaves();
    } catch (err) {
      mostrarMsg(err.response?.data?.error || 'Erro ao cadastrar chave', 'erro');
    }
    setCarregando(false);
  };

  const excluirChave = async (id) => {
    if (!window.confirm('Deseja excluir esta chave?')) return;
    try {
      await axios.delete(`${API_URL}/chaves-pix/${id}`);
      mostrarMsg('Chave excluída com sucesso!');
      carregarChaves();
    } catch (err) {
      mostrarMsg('Erro ao excluir chave', 'erro');
    }
  };

  const gerarChaveAleatoria = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let resultado = '';
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) resultado += '-';
      else resultado += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNovaChave(resultado);
    setTipoChave('aleatoria');
    setMostrarCadastrar(true);
    setChaveTocada(false);
  };

  const traduzirTipo = (tipo) => {
    const tipos = { email: 'E-mail', celular: 'Celular', cpf: 'CPF', aleatoria: 'Chave aleatória' };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="pix-page">
      <div className="pix-header">
        <button className="btn-voltar" onClick={onVoltar}>&#x2190; Voltar</button>
        <h1>Minhas chaves Pix</h1>
      </div>

      {mensagem && <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>}

      <div className="chaves-acoes">
        <button className="btn btn-primary" onClick={() => { setMostrarCadastrar(true); setNovaChave(''); setTipoChave('email'); setChaveTocada(false); }}>
          + Cadastrar chave
        </button>
        <button className="btn btn-secondary" onClick={gerarChaveAleatoria}>
          Trazer chave
        </button>
      </div>

      {mostrarCadastrar && (
        <div className="card">
          <h2>Nova Chave Pix</h2>
          <form onSubmit={cadastrarChave}>
            <div className="form-group">
              <label>Tipo da Chave</label>
              <select value={tipoChave} onChange={(e) => { setTipoChave(e.target.value); setNovaChave(''); setChaveTocada(false); }}>
                <option value="email">E-mail</option>
                <option value="celular">Celular</option>
                {!temChaveCPF && <option value="cpf">CPF</option>}
                <option value="aleatoria">Chave aleatória</option>
              </select>
            </div>
            <div className="form-group">
              <label>Chave</label>
              {tipoChave === 'aleatoria' ? (
                <input type="text" value={novaChave} disabled />
              ) : tipoChave === 'cpf' ? (
                <input type="text" value={cliente.cpf} disabled />
              ) : (
                <>
                  <input
                    type="text"
                    value={novaChave}
                    onChange={handleChangeChave}
                    onBlur={() => setChaveTocada(true)}
                    placeholder={
                      tipoChave === 'email' ? 'seu@email.com' :
                      '(00) 00000-0000'
                    }
                    maxLength={tipoChave === 'celular' ? 15 : 100}
                    required
                  />
                  {chaveTocada && novaChave && !chaveValida() && (
                    <span className="campo-erro">
                      {tipoChave === 'email' ? 'Email inválido' : 'Telefone deve ter 11 dígitos'}
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="botoes">
              <button type="submit" className="btn btn-primary" disabled={carregando || !chaveValida()}>
                {carregando ? 'Cadastrando...' : 'Cadastrar'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setMostrarCadastrar(false); setChaveTocada(false); setTipoChave('email'); }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Chaves Cadastradas ({chaves.length})</h2>
        {chaves.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Chave</th>
                <th>Tipo</th>
                <th>Data de Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {chaves.map((chave) => (
                <tr key={chave.id}>
                  <td className="chave-valor">{chave.chave}</td>
                  <td><span className={`badge badge-chave-${chave.tipo}`}>{traduzirTipo(chave.tipo)}</span></td>
                  <td>{new Date(chave.created_at).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <button className="btn btn-delete btn-sm" onClick={() => excluirChave(chave.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="vazio">Nenhuma chave Pix cadastrada.</p>
        )}
      </div>
    </div>
  );
}

export default MinhasChavesPix;
