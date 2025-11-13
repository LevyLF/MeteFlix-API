const API_URL = 'http://localhost:3000/api/itens';
const AUTH_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let userRole = localStorage.getItem('userRole') || null;

// Função para alternar abas
function alternarAba(tabId) {
  if (tabId === 'adicionar' && !token) {
    alert('Você precisa estar logado para adicionar itens!');
    return;
  }
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(`tab-${tabId}`).classList.add('active');
  
  if (tabId === 'todos') {
    carregarItens({}, 'itens-todos');
  }
}

// Eventos para abas
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    alternarAba(button.dataset.tab);
  });
});

// Funções de Auth
function showModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}

function closeModal() {
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

document.getElementById('btn-login').addEventListener('click', () => showModal('modal-login'));
document.getElementById('btn-register').addEventListener('click', () => showModal('modal-register'));
document.querySelectorAll('.close').forEach(c => c.addEventListener('click', closeModal));

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const res = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok) {
    token = data.token;
    userRole = data.user.role;
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', userRole);
    updateUI();
    closeModal();
  } else alert(data.message);
});

document.getElementById('form-register').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const res = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const data = await res.json();
  if (res.ok) {
    alert('Registrado! Faça login.');
    closeModal();
  } else alert(data.message);
});

document.getElementById('btn-logout').addEventListener('click', () => {
  token = null;
  userRole = null;
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  updateUI();
});

function updateUI() {
  const isLoggedIn = !!token;
  const isAdmin = userRole === 'admin';
  document.getElementById('btn-login').style.display = isLoggedIn ? 'none' : 'inline';
  document.getElementById('btn-register').style.display = isLoggedIn ? 'none' : 'inline';
  document.getElementById('btn-logout').style.display = isLoggedIn ? 'inline' : 'none';
  document.getElementById('tab-add').style.display = isLoggedIn ? 'inline' : 'none';
}

// Função para carregar itens (com filtro opcional)
async function carregarItens(filtro = {}, containerId = 'itens-todos') {
  const query = new URLSearchParams(filtro).toString();
  const response = await fetch(`${API_URL}?${query}`);
  const itens = await response.json();
  const container = document.getElementById(containerId);
  container.innerHTML = itens.length ? itens.map(item => `
    <div class="item-card">
      ${item.capa ? `<img src="${item.capa}" alt="${item.titulo}">` : '<p>Sem capa</p>'}
      <h3>${item.titulo} (${item.ano}) - ${item.tipo}</h3>
      <p><strong>Gênero:</strong> ${item.genero}</p>
      <p>${item.descricao}</p>
      ${token ? `<p>Por: ${item.userId?.username || 'Anônimo'}</p>` : ''}
      ${userRole === 'admin' ? `<button class="btn btn-secondary delete-btn" data-id="${item._id}">Deletar</button>` : ''}
    </div>
  `).join('') : '<p class="item-card" style="text-align: center;">Nenhum item encontrado.</p>';
  
  // Eventos para botões de delete
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (confirm('Tem certeza que deseja deletar este item?')) {
        const id = e.target.dataset.id;
        await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        carregarItens(); // Recarrega após delete
      }
    });
  });
}

// Função de busca avançada
document.getElementById('form-busca').addEventListener('submit', async (e) => {
  e.preventDefault();
  const titulo = document.getElementById('busca-titulo').value.trim();
  const genero = document.getElementById('busca-genero').value.trim();
  const ano = document.getElementById('busca-ano').value.trim();
  
  const filtro = {};
  if (titulo) filtro.titulo = titulo;
  if (genero) filtro.genero = genero;
  if (ano) filtro.ano = ano;
  
  carregarItens(filtro, 'itens-pesquisa');
});

// Limpar busca
document.getElementById('btn-limpar-busca').addEventListener('click', () => {
  document.getElementById('form-busca').reset();
  carregarItens({}, 'itens-pesquisa');
});

// Adicionar novo item
document.getElementById('form-item').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('titulo', document.getElementById('titulo').value);
  formData.append('tipo', document.getElementById('tipo').value);
  formData.append('ano', document.getElementById('ano').value);
  formData.append('genero', document.getElementById('genero').value);
  formData.append('descricao', document.getElementById('descricao').value);
  
  const capaFile = document.getElementById('capa').files[0];
  if (capaFile) {
    formData.append('capa', capaFile);
  }
  
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  carregarItens();
  e.target.reset();
  alternarAba('todos');
});

// Inicialização
updateUI();
carregarItens();