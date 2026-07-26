import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/clientes';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [form, setForm] = useState({ nome: '', cpf: '', email: '', telefone: '', endereco: '', senha: '' });

  const carregarClientes = async () => {
    try {
      const response = await axios.get(API_URL);
      setClientes(response.data);
    } catch (err) {
      mostrarMensagem('Erro ao carregar clientes', 'erro');
    }
  };

  useEffect(() => { carregarClientes(); }, []);

  const mostrarMensagem = (texto, tipo = 'sucesso') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(''), 3000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (clienteEditando) {
        await axios.put(`${API_URL}/${clienteEditando.id}`, form);
        mostrarMensagem('Cliente atualizado com sucesso!');
      } else {
        await axios.post(API_URL, form);
        mostrarMensagem('Cliente cadastrado com sucesso!');
      }
      setClienteEditando(null);
      setForm({ nome: '', cpf: '', email: '', telefone: '', endereco: '', senha: '' });
      carregarClientes();
    } catch (err) {
      mostrarMensagem(err.response?.data?.error || 'Erro ao salvar cliente', 'erro');
    }
  };

  const editar = (cliente) => {
    setClienteEditando(cliente);
    setForm({ nome: cliente.nome, cpf: cliente.cpf, email: cliente.email, telefone: cliente.telefone || '', endereco: cliente.endereco || '', senha: '' });
  };

  const excluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      mostrarMensagem('Cliente excluído com sucesso!');
      carregarClientes();
    } catch (err) {
      mostrarMensagem('Erro ao excluir cliente', 'erro');
    }
  };

  return (
    <div className="clientes-page">
      <h1>Clientes</h1>
      <p className="subtitle">Gerenciamento de clientes</p>

      {mensagem && <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>}

      <div className="card">
        <h2>{clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nome *</label>
              <input type="text" name="nome" value={form.nome} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>CPF *</label>
              <input type="text" name="cpf" value={form.cpf} onChange={handleChange} required disabled={!!clienteEditando} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input type="text" name="telefone" value={form.telefone} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Endereço</label>
            <input type="text" name="endereco" value={form.endereco} onChange={handleChange} />
          </div>
          {!clienteEditando && (
            <div className="form-group">
              <label>Senha *</label>
              <input type="password" name="senha" value={form.senha} onChange={handleChange} required />
            </div>
          )}
          <div className="botoes">
            <button type="submit" className="btn btn-primary">{clienteEditando ? 'Atualizar' : 'Cadastrar'}</button>
            {clienteEditando && <button type="button" className="btn btn-secondary" onClick={() => { setClienteEditando(null); setForm({ nome: '', cpf: '', email: '', telefone: '', endereco: '', senha: '' }); }}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Clientes Cadastrados ({clientes.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nome}</td>
                <td>{cliente.cpf}</td>
                <td>{cliente.email}</td>
                <td>{cliente.telefone || '-'}</td>
                <td className="acoes">
                  <button className="btn btn-edit" onClick={() => editar(cliente)}>Editar</button>
                  <button className="btn btn-delete" onClick={() => excluir(cliente.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Clientes;
