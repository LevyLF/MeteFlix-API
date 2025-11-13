# MeTeFlix - API e Site de Filmes/Séries

Um projeto full-stack para gerenciar e explorar filmes e séries, com autenticação de usuários, upload de capas e funcionalidades administrativas. Inspirado em sites de streaming como Netflix.

## 🚀 Funcionalidades

- **Explorar Filmes/Séries**: Visualize uma coleção de itens com capas, títulos, gêneros e descrições.
- **Pesquisa Avançada**: Busque por título, gênero ou ano.
- **Adicionar Itens**: Usuários logados podem adicionar novos filmes/séries com upload de capas.
- **Autenticação**: Registro e login de usuários. Apenas usuários logados podem adicionar itens.
- **Administração**: Super usuários (admins) podem deletar qualquer item.
- **UI Responsivo**: Design cinematográfico, abas interativas e otimizado para mobile.
- **Upload de Imagens**: Capas são salvas localmente (ou podem ser adaptadas para cloud).

## 🛠️ Tecnologias Usadas

- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt, Multer.
- **Frontend**: HTML, CSS (responsivo), JavaScript (vanilla).
- **Outros**: Font Awesome (ícones), dotenv (variáveis de ambiente).

## 📋 Pré-requisitos

- Node.js (v14+)
- MongoDB (local ou Atlas)
- npm ou yarn

## 🔧 Instalação e Execução

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/meteflix.git
   cd meteflix
   Instale as dependências:  



Instale as dependências:
  ```
npm install express mongoose cors multer jsonwebtoken bcryptjs
  ```

Configure o ambiente:
Crie um arquivo .env na raiz:

  ```
MONGO_URI=mongodb://localhost:27017/meteflix  
JWT_SECRET=sua-chave-secreta-aqui
  ```

Crie pastas necessárias:

  ```
mkdir uploads public/images
  ```

Execute o servidor:

  ```
node server.js
  ```
O servidor roda em seu local Host.
Um admin é criado automaticamente: admin@MeteFlix.com / admin123.


## Design e Responsividade
Tema: Preto e Amarelo para um visual cinematográfico.  
Abas Interativas: Transições suaves com ícones.  
Capas: Aspect ratio 16:9, placeholder para itens sem imagem.  
Mobile: Otimizado para telas < 768px (abas empilhadas, grid 1 coluna).  

## Segurança  
Senhas criptografadas com bcrypt.  
Tokens JWT para autenticação.  
Middleware para proteger rotas (apenas logados podem adicionar, apenas admins deletam).  

🚀 Próximos Passos  
[ ] Integração com cloud storage (AWS S3) para imagens.  
[ ] Funcionalidade de editar itens.  
[ ] Avaliações e comentários.  
[ ] Deploy em Heroku/Vercel.  

📄 Licença
Este projeto é open-source sob a licença MIT. 

⭐ Se gostou, dê uma estrela no repositório!


