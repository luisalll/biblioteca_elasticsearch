const readline = require('readline');
const { Client } = require('@elastic/elasticsearch');

// Conexão com o Elasticsearch
const client = new Client({
  node: 'https://localhost:9200',
  auth: {
    username: 'elastic',
    password: '8wDtos1MeNzCiw2jOTAk' // Substituir pela sua senha real
  },
  tls: {
    rejectUnauthorized: false
  }
});

//Criação do índice 'Livros'
async function criarIndiceLivros() {
  const exists = await client.indices.exists({ index: 'livros' });
  if (exists) {
    await client.indices.delete({ index: 'livros' });
    console.log('Índice antigo "livros" apagado.');
  }

  await client.indices.create({
    index: 'livros',
    body: {
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1,
        analysis: {
          filter: {
            portuguese_stemmer: {
              type: 'stemmer',
              language: 'portuguese'
            },
            autocomplete_filter: {
              type: 'edge_ngram',
              min_gram: 2,
              max_gram: 20
            }
          },
          analyzer: {
            meu_analisador_portugues: {
              tokenizer: 'standard',
              filter: ['lowercase', 'asciifolding', 'portuguese_stemmer']
            },
            autocomplete_analyzer: {
              tokenizer: 'standard',
              filter: ['lowercase', 'asciifolding', 'autocomplete_filter']
            }
          }
        }
      },
      mappings: {
        properties: {
          ano: { type: 'integer' },
          autor: {
            type: 'text',
            analyzer: 'autocomplete_analyzer',
            search_analyzer: 'meu_analisador_portugues'
          },
          titulo: {
            type: 'text',
            analyzer: 'autocomplete_analyzer',
            search_analyzer: 'meu_analisador_portugues'
          },
          genero: {
            type: 'text',
            analyzer: 'autocomplete_analyzer',
            search_analyzer: 'meu_analisador_portugues'
          },
          disponivel: { type: 'boolean' }
        }
      }
    }
  });
    
  console.log('Índice "livros" criado com sucesso!');
}

async function criarIndiceUsuarios() {
  const exists = await client.indices.exists({ index: 'usuarios' });
  if (exists) {
    await client.indices.delete({ index: 'usuarios' });
    console.log('Índice antigo "usuarios" apagado.');
  }

  await client.indices.create({
    index: 'usuarios',
    body: {
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1,
        analysis: {
          analyzer: {
            padrao: {
              tokenizer: 'standard',
              filter: ['lowercase', 'asciifolding']
            }
          }
        }
      },
      mappings: {
        properties: {
          nome: {
            type: 'text',
            analyzer: 'padrao'
          },
          email: {
            type: 'keyword' // e-mail geralmente não precisa de análise textual
          }
        }
      }
    }
  });

  console.log('Índice "usuarios" criado com sucesso!');
}

async function criarIndiceLocacoes() {
  const exists = await client.indices.exists({ index: 'locacoes' });
  if (exists) {
    await client.indices.delete({ index: 'locacoes' });
    console.log('Índice antigo "locacoes" apagado.');
  }

  await client.indices.create({
    index: 'locacoes',
    body: {
      settings: {
        number_of_shards: 1,
        number_of_replicas: 1
      },
      mappings: {
        properties: {
          usuario_id: { type: 'keyword' },
          livro_id: { type: 'keyword' },
        }
      }
    }
  });

  console.log('Índice "locacoes" criado com sucesso!');
}

async function main() {
    //Criação dos índices
    await criarIndiceLivros();
    await criarIndiceUsuarios();
    await criarIndiceLocacoes();
}

main().catch(console.error);
