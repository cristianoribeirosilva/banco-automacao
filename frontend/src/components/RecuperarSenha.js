import React, { useState, useEffect, useRef } from 'react';
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

function RecuperarSenha({ aoVoltar }) {
  const [etapa, setEtapa] = useState(1);
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [cpfTocado, setCpfTocado] = useState(false);
  const [emailTocado, setEmailTocado] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [novaSenhaTocada, setNovaSenhaTocada] = useState(false);
  const [confirmarTocado, setConfirmarTocado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [contador, setContador] = useState(60);
  const [podeReenviar, setPodeReenviar] = useState(false);
  const timerRef = useRef(null);

  const cpfValido = cpf.replace(/\D/g, '').length === 11 && validarCPF(cpf);
  const novaSenhaValida = /^\d{8}$/.test(novaSenha);
  const codigoValido = /^\d{6}$/.test(codigo);

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const emailValido = validarEmail(email);

  useEffect(() => {
    if (etapa === 3) {
      setContador(60);
      setPodeReenviar(false);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setContador((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setPodeReenviar(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [etapa]);

  const handleBuscarConta = async (e) => {
    e.preventDefault();
    if (!cpfValido) { setErro('CPF inválido'); return; }
    setCarregando(true);
    setErro('');
    try {
      const response = await axios.get(`${API_URL}/clientes`);
      const cliente = response.data.find(c => c.cpf === cpf);
      if (!cliente) {
        setErro('CPF não encontrado no sistema');
        setCarregando(false);
        return;
      }
      setCarregando(false);
      setEtapa(2);
    } catch (err) {
      setErro('Erro ao conectar com o servidor');
      setCarregando(false);
    }
  };

  const handleEnviarEmail = async (e) => {
    e.preventDefault();
    if (!email || !emailValido) { setErro('Informe um email válido'); return; }
    setCarregando(true);
    setErro('');
    try {
      const response = await axios.get(`${API_URL}/clientes`);
      const cliente = response.data.find(c => c.cpf === cpf && c.email === email);
      setCarregando(false);
      if (!cliente) {
        setErro('Email não corresponde ao CPF informado');
        return;
      }
      setSucesso('Código de verificação enviado para seu email!');
      setTimeout(() => { setEtapa(3); setSucesso(''); }, 1500);
    } catch (err) {
      setErro('Erro ao enviar email de verificação');
      setCarregando(false);
    }
  };

  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    if (!codigoValido) { setErro('O código deve ter 6 dígitos'); return; }
    setCarregando(true);
    setErro('');
    try {
      setCarregando(false);
      setSucesso('Código verificado com sucesso!');
      setTimeout(() => { setEtapa(4); setSucesso(''); }, 1500);
    } catch (err) {
      setErro('Erro ao verificar código');
      setCarregando(false);
    }
  };

  const handleReenviarCodigo = async () => {
    if (!podeReenviar) return;
    setPodeReenviar(false);
    setContador(60);
    setErro('');
    setSucesso('Novo código enviado para seu email!');
    setTimeout(() => setSucesso(''), 2000);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setContador((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setPodeReenviar(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    if (!novaSenhaValida) { setErro('A senha deve ter exatamente 8 dígitos numéricos'); return; }
    if (novaSenha !== confirmarSenha) { setErro('As senhas não coincidem'); return; }
    setCarregando(true);
    setErro('');
    try {
      const response = await axios.get(`${API_URL}/clientes`);
      const cliente = response.data.find(c => c.cpf === cpf);
      if (cliente) {
        await axios.put(`${API_URL}/clientes/${cliente.id}`, { senha: novaSenha });
      }
      setSucesso('Senha redefinida com sucesso!');
      setTimeout(() => aoVoltar(), 2000);
    } catch (err) {
      setErro('Erro ao redefinir senha');
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">&#x1F512;</div>
          <h1>Recuperar Senha</h1>
          <p>Etapa {etapa} de 4</p>
        </div>

        <div className="progresso-barra">
          <div className={`progresso-item ${etapa >= 1 ? 'ativo' : ''}`}>1</div>
          <div className={`progresso-linha ${etapa >= 2 ? 'ativa' : ''}`}></div>
          <div className={`progresso-item ${etapa >= 2 ? 'ativo' : ''}`}>2</div>
          <div className={`progresso-linha ${etapa >= 3 ? 'ativa' : ''}`}></div>
          <div className={`progresso-item ${etapa >= 3 ? 'ativo' : ''}`}>3</div>
          <div className={`progresso-linha ${etapa >= 4 ? 'ativa' : ''}`}></div>
          <div className={`progresso-item ${etapa >= 4 ? 'ativo' : ''}`}>4</div>
        </div>

        {erro && <div className="mensagem erro">{erro}</div>}
        {sucesso && <div className="mensagem sucesso">{sucesso}</div>}

        {etapa === 1 && (
          <form onSubmit={handleBuscarConta}>
            <p className="etapa-descricao">Informe seu CPF para localizar sua conta</p>
            <div className="form-group">
              <label>CPF</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => { setCpf(formatarCPF(e.target.value)); setErro(''); }}
                onBlur={() => setCpfTocado(true)}
                maxLength={14}
                required
              />
              {cpfTocado && cpf.length > 0 && !cpfValido && (
                <span className="campo-erro">CPF inválido</span>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={carregando || !cpfValido}>
              {carregando ? 'Buscando...' : 'Continuar'}
            </button>
          </form>
        )}

        {etapa === 2 && (
          <form onSubmit={handleEnviarEmail}>
            <p className="etapa-descricao">Informe o email associado à sua conta</p>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErro(''); }}
                onBlur={() => setEmailTocado(true)}
                required
              />
              {emailTocado && email.length > 0 && !emailValido && (
                <span className="campo-erro">Email inválido</span>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={carregando || !emailValido}>
              {carregando ? 'Enviando...' : 'Enviar Código'}
            </button>
          </form>
        )}

        {etapa === 3 && (
          <form onSubmit={handleVerificarCodigo}>
            <p className="etapa-descricao">Informe o código de 6 dígitos enviado para <strong>{email}</strong></p>
            <div className="form-group">
              <label>Código de Verificação</label>
              <input
                type="text"
                placeholder="000000"
                value={codigo}
                onChange={(e) => { setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6)); setErro(''); }}
                maxLength={6}
                className="input-codigo"
                required
              />
              {codigo.length > 0 && !codigoValido && (
                <span className="campo-erro">O código deve ter 6 dígitos</span>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={carregando || !codigoValido}>
              {carregando ? 'Verificando...' : 'Verificar Código'}
            </button>
            <div className="reenviar-container">
              {podeReenviar ? (
                <button type="button" className="link-esqueci" onClick={handleReenviarCodigo}>
                  Reenviar código
                </button>
              ) : (
                <p className="contador-texto">Reenviar código em <strong>{contador}s</strong></p>
              )}
            </div>
          </form>
        )}

        {etapa === 4 && (
          <form onSubmit={handleRedefinirSenha}>
            <p className="etapa-descricao">Crie uma nova senha para sua conta</p>
            <div className="form-group">
              <label>Nova Senha</label>
              <div className="senha-container">
                <input
                  type={mostrarNovaSenha ? 'text' : 'password'}
                  placeholder="Digite 8 dígitos"
                  value={novaSenha}
                  onChange={(e) => { setNovaSenha(e.target.value.replace(/\D/g, '').slice(0, 8)); setErro(''); }}
                  onBlur={() => setNovaSenhaTocada(true)}
                  maxLength={8}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-senha"
                  onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                  tabIndex={-1}
                >
                  {mostrarNovaSenha ? '\u{1F441}' : '\u{1F441}\u{200D}\u{1F5E8}'}
                </button>
              </div>
              {novaSenhaTocada && novaSenha.length > 0 && !novaSenhaValida && (
                <span className="campo-erro">A senha deve ter 8 dígitos</span>
              )}
            </div>
            <div className="form-group">
              <label>Confirmar Senha</label>
              <div className="senha-container">
                <input
                  type={mostrarConfirmar ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  value={confirmarSenha}
                  onChange={(e) => { setConfirmarSenha(e.target.value.replace(/\D/g, '').slice(0, 8)); setErro(''); }}
                  onBlur={() => setConfirmarTocado(true)}
                  maxLength={8}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-senha"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  tabIndex={-1}
                >
                  {mostrarConfirmar ? '\u{1F441}' : '\u{1F441}\u{200D}\u{1F5E8}'}
                </button>
              </div>
              {confirmarTocado && confirmarSenha.length > 0 && confirmarSenha !== novaSenha && (
                <span className="campo-erro">As senhas não coincidem</span>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={carregando || !novaSenhaValida || confirmarSenha !== novaSenha}>
              {carregando ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
        )}

        <button className="link-esqueci" onClick={aoVoltar}>
          Voltar ao login
        </button>
      </div>
    </div>
  );
}

export default RecuperarSenha;
