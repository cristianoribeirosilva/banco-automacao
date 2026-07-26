USE railway;

-- Clientes (senha: 12345678 para todos)
INSERT INTO clientes (nome, cpf, email, telefone, endereco, senha) VALUES
('João Silva', '123.456.789-09', 'joao.silva@email.com', '(11) 99999-1234', 'Rua das Flores, 123 - São Paulo, SP', '12345678'),
('Maria Santos', '987.654.321-00', 'maria.santos@email.com', '(21) 98888-5678', 'Av. Brasil, 456 - Rio de Janeiro, RJ', '12345678'),
('Pedro Oliveira', '456.789.123-09', 'pedro.oliveira@email.com', '(31) 97777-9012', 'Rua da Paz, 789 - Belo Horizonte, MG', '12345678');

-- Contas (saldo R$ 10.000,00 para cada)
INSERT INTO contas (cliente_id, numero, agencia, tipo, saldo) VALUES
(1, '0001-0001', '0001', 'corrente', 10000.00),
(2, '0001-0002', '0001', 'corrente', 10000.00),
(3, '0001-0003', '0001', 'corrente', 10000.00);

-- Chaves Pix (cada cliente tem 3 chaves: email, telefone e CPF)
INSERT INTO chaves_pix (cliente_id, chave, tipo) VALUES
(1, 'joao.silva@email.com', 'email'),
(1, '(11) 99999-1234', 'celular'),
(1, '123.456.789-09', 'cpf'),
(2, 'maria.santos@email.com', 'email'),
(2, '(21) 98888-5678', 'celular'),
(2, '987.654.321-00', 'cpf'),
(3, 'pedro.oliveira@email.com', 'email'),
(3, '(31) 97777-9012', 'celular'),
(3, '456.789.123-09', 'cpf');
