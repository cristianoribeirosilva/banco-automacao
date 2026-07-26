import React, { useState, useEffect } from 'react';

function ClienteForm({ aoSalvar, clienteEditando, aoCancelar }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', endereco: '' });

  useEffect(() => {
    if (clienteEditando) {
      setForm({
        nome: clienteEditando.nome || '',
        email: clienteEditando.email || '',
        telefone: clienteEditando.telefone || '',
        endereco: clienteEditando.endereco || ''
      });
    } else {
      setForm({ nome: '', email: '', telefone: '', endereco: '' });
    }
  }, [clienteEditando]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    aoSalvar(form);
    setForm({ nome: '', email: '', telefone: '', endereco: '' });
  };

  return (
    <div className="card">
      <h2>{clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome *</label>
          <input type="text" name="nome" value={form.nome} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Telefone</label>
          <input type="text" name="telefone" value={form.telefone} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Endereço</label>
          <input type="text" name="endereco" value={form.endereco} onChange={handleChange} />
        </div>
        <div className="botoes">
          <button type="submit" className="btn btn-primary">
            {clienteEditando ? 'Atualizar' : 'Cadastrar'}
          </button>
          {clienteEditando && (
            <button type="button" className="btn btn-secondary" onClick={aoCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ClienteForm;
