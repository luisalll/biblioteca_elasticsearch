const readline = require('readline');
const { Client } = require('@elastic/elasticsearch');

// Conexão com o Elasticsearch
const client = new Client({
  node: 'https://localhost:9200',
  auth: {
    // Substitua pela sua senha e userame
    username: 'elastic',
    password: '8wDtos1MeNzCiw2jOTAk'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Interface readline para terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//Função ask para facilitar interação no terminal
function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

//Função para cadastro de livro
async function cadastrarLivro() {
  const id = await ask('ID do livro: ');
  const titulo = await ask('Título: ');
  const autor = await ask('Autor: ');
  const ano = parseInt(await ask('Ano: '));
  const genero = await ask('Gênero: ');
  const disponivel = true;

  await client.index({
    index: 'livros',
    id,
    document: { titulo, autor, ano, genero, disponivel }
  });

  console.log('Livro cadastrado com sucesso!');
}

//Função para remoção de livro
async function removerLivro() {
  const id = await ask('ID do livro a remover: ');

  try {
    await client.delete({
      index: 'livros',
      id
    });
    console.log('Livro removido com sucesso!');
  } catch (e) {
    console.log('Livro não encontrado.');
  }
}

//Função para cadastro de usuário
async function cadastrarUsuario() {
  const id = await ask('ID do usuário: ');
  const nome = await ask('Nome: ');
  const email = await ask('Email: ');

  await client.index({
    index: 'usuarios',
    id,
    document: { nome, email }
  });

  console.log('Usuário cadastrado com sucesso!');
}

//Função para registro de locação
async function realizarLocacao() {
  const usuario_id = await ask('ID do usuário: ');
  const livro_id = await ask('ID do livro: ');

  // Verifica se os índices existem
  const livrosExists = await client.indices.exists({ index: 'livros' });
  const locacoesExists = await client.indices.exists({ index: 'locacoes' });

  if (!livrosExists) {
    console.log('Livro não encontrado.');
    return;
  }

  if (!locacoesExists) {
    console.log('Usuário não encontrado.');
    return;
  }

  // Registra a locação
  await client.index({
    index: 'locacoes',
    document: {
      usuario_id,
      livro_id
    }
  });

  // Atualiza a disponibilidade do livro
  await client.update({
    index: 'livros',
    id: livro_id,
    doc: { disponivel: false }
  });

  console.log('Locação registrada com sucesso!');
}

async function removerLocacao() {
  const id = await ask('ID da locação a remover: ');

  // Busca a locação
  let locacao;
  try {
    const response = await client.get({ index: 'locacoes', id });
    locacao = response._source;
  } catch (e) {
    console.log('Locação não encontrada.');
    return;
  }

  // Atualiza o livro para disponível
  await client.update({
    index: 'livros',
    id: locacao.livro_id,
    doc: { disponivel: true }
  });

  // Remove a locação
  await client.delete({ index: 'locacoes', id });

  console.log('Locação removida.');
}

// 🔍 Pesquisa de livros
async function pesquisarLivros() {
  const termo = await ask('Digite o termo para buscar (título, autor ou gênero): ');

  const resultado = await client.search({
  index: 'livros',
  query: {
    bool: {
      should: [
        {
          multi_match: {
            query: termo,
            fields: ['titulo', 'autor', 'genero'],
            fuzziness: 'AUTO'
          }
        },
        {
          multi_match: {
            query: termo,
            fields: ['titulo', 'autor', 'genero'],
            type: 'phrase_prefix'
          }
        }
      ]
    }
  }
});

  const livros = resultado.hits.hits;

  if (livros.length === 0) {
    console.log('Nenhum livro compatível com a busca.');
  } else {
    console.log(`(${livros.length}) livros encontrados :\n`);
    livros.forEach((doc, i) => {
      const l = doc._source;
      let disponibilidade = '';
      if (l.disponivel) {
        disponibilidade = 'Sim'; 
      }else{
        disponibilidade = 'Não';
      }
      console.log(`${i + 1}. ${l.titulo} | ${l.autor} | ${l.genero} | ${l.ano} | Disponível: ${disponibilidade}`);
    });
  }
}

// Função para Listagem de livros disponíveis
async function listarLivrosDisponiveis() {
  const resultado = await client.search({
    index: 'livros',
    query: {
      term: { disponivel: true }
    },
    size: 100
  });

  const livros = resultado.hits.hits;

  if (livros.length === 0) {
    console.log('Nenhum livro disponível no momento.');
  } else {
    console.log(`(${livros.length}) livros disponíveis:\n`);
    livros.forEach((doc, i) => {
      const l = doc._source;
      console.log(`${i + 1}. ${l.titulo} | ${l.autor} | ${l.genero} | ${l.ano}`);
    });
  }
}

//Menu principal
async function main() {
  console.log('\n📚 Sistema de Biblioteca\n');

  while (true) {
    console.log('\n=== Menu ===');
    console.log('1. Cadastrar Livro');
    console.log('2. Remover Livro');
    console.log('3. Cadastrar Usuário');
    console.log('4. Realizar Locação');
    console.log('5. Remover Locação');
    console.log('6. Pesquisar Livros');
    console.log('7. Listar livros disponíveis');
    console.log('0. Sair');

    const escolha = await ask('\nEscolha uma opção: ');

    switch (escolha) {
      case '1':
        await cadastrarLivro();
        break;
      case '2':
        await removerLivro();
        break;
      case '3':
        await cadastrarUsuario();
        break;
      case '4':
        await realizarLocacao();
        break;
      case '5':
        await removerLocacao();
        break;
      case '6':
        await pesquisarLivros();
        break;
      case '7':
        await listarLivrosDisponiveis();
        break;
      case '0':
        rl.close();
        console.log('Finalizando programa');
        process.exit(0);
      default:
        console.log('Opção inválida! Tente Outra');
    }
  }
}

main().catch(console.error);
