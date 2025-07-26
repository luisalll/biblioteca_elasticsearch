# biblioteca_elasticsearch
\
#Projeto para a disciplina de Banco de dados - 2025.1 \
#Aplicação do banco de dados Elastic Search em um caso de uso integrado a uma lingueaguem de programação (Java Script). \
\
#Instruções para executar a aplicação: \
#1. Executar o Elastic Search e conferir se a porta local do código está correta \
#2. `npm install` \
#3. `node main.js` \
#4. `node index.js` \

#Esse projeto tem como objetivo simular o funcionamento de uma biblioteca, gerindo seus livros e suas locações. Nele, é possível adicionar e deletar livros além de pesquisar-los pelas categorias de nome, autor e gênero. Mesmo com erros de digitação ou pesquisas incompletas, é possível realizar uma pesquisa eficiente. A aplicação também possibilita a criação de usuários e o registro e remoção de locações desses livros por eles. \
#É recomendado a utillização do `https://localhost:9200` (com a porta correta para máquina) no navegador para melhor vizualização dos dados e execução das funções: \
#1. `https://localhost:9200/livros` para vizualizar o index de livros; \
#2. `https://localhost:9200/livros/_search` para vizualizar os livros registrados; \
#3. `https://localhost:9200/ususrios` para vizualizar o index de usuários; \
#4. `https://localhost:9200/usuarios/_search` para vizualizar os usuários registrados; \
#5. `https://localhost:9200/locacoes` para vizualizar o index de locações; \
#6. `https://localhost:9200/locacoes/_search` para vizualizar as locações registradas; \
