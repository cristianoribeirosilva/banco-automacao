import React from 'react';

function ClienteList({ clientes, aoEditar, aoExcluir }) {
  if (clientes.length === 0) {
    return (
      <div className="card">
        <h2>Clientes Cadastrados</h2>
        <p className="vazio">Nenhum cliente cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Clientes Cadastrados ({clientes.length})</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Endereço</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.id}</td>
              <td>{cliente.nome}</td>
              <td>{cliente.email}</td>
              <td>{cliente.telefone || '-'}</td>
              <td>{cliente.endereco || '-'}</td>
              <td className="acoes">
                <button className="btn btn-edit" onClick={() => aoEditar(cliente)}>
                  Editar
                </button>
                <button className="btn btn-delete" onClick={() => aoExcluir(cliente.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClienteList;
