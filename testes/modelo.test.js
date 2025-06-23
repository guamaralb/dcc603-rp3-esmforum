const bd = require('../bd/bd_utils.js');
const modelo = require('../modelo.js');

beforeEach(() => {
  bd.reconfig('./bd/esmforum-teste.db');
  // limpa dados de todas as tabelas
  bd.exec('delete from perguntas', []);
  bd.exec('delete from respostas', []);
});

test('Testando banco de dados vazio', () => {
  expect(modelo.listar_perguntas().length).toBe(0);
});

test('Testando cadastro de três perguntas', () => {
  modelo.cadastrar_pergunta('1 + 1 = ?');
  modelo.cadastrar_pergunta('2 + 2 = ?');
  modelo.cadastrar_pergunta('3 + 3 = ?');
  const perguntas = modelo.listar_perguntas(); 
  expect(perguntas.length).toBe(3);
  expect(perguntas[0].texto).toBe('1 + 1 = ?');
  expect(perguntas[1].texto).toBe('2 + 2 = ?');
  expect(perguntas[2].num_respostas).toBe(0);
  expect(perguntas[1].id_pergunta).toBe(perguntas[2].id_pergunta-1);
});

test('Cadastro de uma nova resposta deve gerar um ID numérico positivo', () => {
  const perguntaId = modelo.cadastrar_pergunta('Como se chama a fêmea do cavalo?');
  const respostaId = modelo.cadastrar_resposta(perguntaId, 'Égua');

  expect(typeof respostaId === 'number').toBe(true);
  expect(respostaId > 0).toBe(true);
});

test('Recuperação da pergunta cadastrada deve retornar o texto correto', () => {
  const texto = '2 + 2 = ?';
  const id = modelo.cadastrar_pergunta(texto);
  const resultado = modelo.get_pergunta(id);

  expect(resultado).toBeDefined();
  expect(resultado.id_pergunta).toBe(id);
  expect(resultado.texto).toBe(texto);
});

test('Listagem de respostas deve retornar todas as associadas à pergunta', () => {
  const id = modelo.cadastrar_pergunta('Quem é o presidente do Brasil?');
  modelo.cadastrar_resposta(id, 'Lula');
  modelo.cadastrar_resposta(id, 'Bolsonaro');

  const respostas = modelo.get_respostas(id);

  expect(respostas.length === 2).toBe(true);
  expect(respostas[0].texto).toEqual('Lula');
  expect(respostas[1].texto).toEqual('Bolsonaro');
});

test('Número de respostas deve refletir a quantidade cadastrada', () => {
  const id = modelo.cadastrar_pergunta('Quem é o "rei do pop"?');

  expect(modelo.get_num_respostas(id)).toEqual(0);

  modelo.cadastrar_resposta(id, 'Michael Jackson');
  expect(modelo.get_num_respostas(id)).toEqual(1);

  modelo.cadastrar_resposta(id, 'Elvis Presley');
  expect(modelo.get_num_respostas(id)).toEqual(2);
});