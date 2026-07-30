USE railway;

-- Clientes
INSERT INTO clientes (id, nome, cpf, email, telefone, endereco, senha) VALUES
(1, 'Maria Oliveira', '529.982.247-25', 'maria@email.com', '(11) 98765-4321', 'Rua das Flores, 100', '12345678'),
(2, 'Carlos Santos', '347.861.500-37', 'carlos@email.com', '(21) 99876-5432', 'Av. Brasil, 200', '87654321'),
(3, 'Ana Ferreira', '847.293.610-40', 'ana@email.com', '(31) 97654-3210', 'Rua da Paz, 300', '11223344');

-- Contas
INSERT INTO contas (id, cliente_id, numero, agencia, tipo, saldo) VALUES
(1, 1, '854232', '0001', 'corrente', 9999.98),
(2, 2, '284574', '0001', 'corrente', 10000.02),
(3, 3, '594102', '0001', 'poupanca', 10000.00);

-- Chaves Pix
INSERT INTO chaves_pix (id, cliente_id, chave, tipo) VALUES
(3, 1, '529.982.247-25', 'cpf'),
(4, 1, 'maria@email.com', 'email'),
(5, 1, '(11) 98765-4321', 'celular'),
(7, 2, 'carlos@email.com', 'email'),
(8, 2, '(21) 99876-5432', 'celular'),
(9, 2, '347.861.500-37', 'cpf'),
(10, 3, 'ana@email.com', 'email'),
(11, 3, '(31) 97654-3210', 'celular'),
(12, 3, '847.293.610-40', 'cpf');

-- Transacoes
INSERT INTO transacoes (id, conta_origem_id, conta_destino_id, tipo, valor, descricao) VALUES
(1, 1, NULL, 'deposito', 10000.00, 'Deposito'),
(2, 2, NULL, 'deposito', 10000.00, 'Deposito'),
(3, 3, NULL, 'deposito', 10000.00, 'Deposito'),
(4, 1, 2, 'transferencia', 0.02, 'Transferencia para conta 284574');
