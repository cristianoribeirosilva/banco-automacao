import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

function formatarCPF(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);
  return numeros
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
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

function Login({ aoLogar, aoEsqueciSenha }) {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [cpfTocado, setCpfTocado] = useState(false);
  const [senhaTocada, setSenhaTocada] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleChangeCPF = (e) => {
    setCpf(formatarCPF(e.target.value));
    setErro('');
  };

  const handleChangeSenha = (e) => {
    const valor = e.target.value.replace(/\D/g, '').slice(0, 8);
    setSenha(valor);
    setErro('');
  };

  const cpfValido = cpf.replace(/\D/g, '').length === 11 && validarCPF(cpf);
  const senhaValida = senha.length === 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cpfValido) {
      setErro('CPF inválido');
      return;
    }
    if (!senhaValida) {
      setErro('A senha deve ter 8 dígitos');
      return;
    }
    setCarregando(true);
    setErro('');
    try {
      const response = await axios.post(`${API_URL}/clientes/login`, { cpf, senha });
      aoLogar(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setErro('Usuário/Senha inválidos');
      } else {
        setErro('Erro ao conectar com o servidor');
      }
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">&#x1F3E6;</div>
          <h1>Banco Automação</h1>
          <p>Sistema Bancário</p>
        </div>
        <form onSubmit={handleSubmit}>
          {erro && <div className="mensagem erro">{erro}</div>}
          <div className="form-group">
            <label>CPF</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={handleChangeCPF}
              onBlur={() => setCpfTocado(true)}
              maxLength={14}
              required
            />
            {cpfTocado && cpf.length > 0 && !cpfValido && (
              <span className="campo-erro">CPF inválido</span>
            )}
          </div>
          <div className="form-group">
            <label>Senha</label>
            <div className="senha-container">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Digite 8 dígitos"
                value={senha}
                onChange={handleChangeSenha}
                onBlur={() => setSenhaTocada(true)}
                maxLength={8}
                required
              />
              <button
                type="button"
                className="btn-toggle-senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                tabIndex={-1}
              >
                {mostrarSenha ? '\u{1F441}' : '\u{1F441}\u{200D}\u{1F5E8}'}
              </button>
            </div>
            {senhaTocada && senha.length > 0 && !senhaValida && (
              <span className="campo-erro">A senha deve ter 8 dígitos</span>
            )}
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={carregando || !cpfValido || !senhaValida}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <button className="link-esqueci" onClick={aoEsqueciSenha}>
          Esqueci minha senha
        </button>
        <p className="login-info">Sistema de gerenciamento bancário</p>
      </div>
    </div>
  );
}

export default Login;
