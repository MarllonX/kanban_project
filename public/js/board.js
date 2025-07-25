const token = localStorage.getItem('token');
const params = new URLSearchParams(window.location.search);
const boardId = params.get('id');

const listColorOptions = [
  'bg-light-blue',
  'bg-light-green',
  'bg-light-red',
  'bg-light-yellow',
  'bg-light-gray'
];


if (!token || !boardId) {
window.location.href = '/';
}

const boardContainer = document.getElementById('boardContainer');
const listForm = document.getElementById('listForm');
const listTitleInput = document.getElementById('listTitle');

const listColors = [
'bg-light-blue',
'bg-light-green',
'bg-light-red',
'bg-light-yellow',
'bg-light-gray'
];

function showToast(message) {
const toastEl = document.getElementById('toastMessage');
toastEl.querySelector('.toast-body').textContent = message;
new bootstrap.Toast(toastEl).show();
}

function getRandomColorClass() {
return listColors[Math.floor(Math.random() * listColors.length)];
}

function updateNavbarColors(color) {
const colorClass = color ? `bg-${color}` : '';
const textClass = ['yellow', 'light', 'white'].includes(color) ? 'text-whitedark' : 'text-white';

const navbar = document.querySelector('.navbar');
navbar.className = `navbar navbar-expand-lg ${colorClass} ${textClass} rounded shadow-sm mb-4 px-3`;

const boardTitleEl = document.getElementById('boardTitle');
boardTitleEl.textContent = '';
boardTitleEl.textContent = document.title;
boardTitleEl.className = textClass;

const backBtn = navbar.querySelector('a.btn');
if (backBtn) {
    backBtn.className = `btn btn-sm ${textClass === 'text-white' ? 'btn-outline-light' : 'btn-outline-dark'}`;
}
}

async function fetchBoard() {
try {
    const res = await fetch(`/api/boards/${boardId}`, {
    headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Erro ao carregar board');

    updateNavbarColors(data.color);
    document.getElementById('boardTitle').innerHTML = `<i class="bi bi-clipboard-heart-fill"></i> ${data.title}`;
    renderLists(data.lists);
} catch (err) {
    alert(err.message);
    window.location.href = '/';
}
}

function createCardElement(card) {
const cardDiv = document.createElement('div');
cardDiv.className = 'card-item d-flex justify-content-between align-items-center mb-2 p-2 border rounded';
cardDiv.dataset.cardId = card.id;

cardDiv.innerHTML = `
    <span>${card.title}</span>
    <button class="btn btn-sm btn-danger btn-delete-card card-item-actions" data-card-id="${card.id}"><i class="bi bi-x-lg"></i></button>
`;

cardDiv.querySelector('.btn-delete-card').addEventListener('click', () => deleteCard(card.id, cardDiv));
return cardDiv;
}

async function deleteCard(cardId, cardElement) {
cardElement.style.transition = 'opacity 0.2s ease';
cardElement.style.opacity = '0';

const res = await fetch(`/api/cards/${cardId}`, {
    method: 'DELETE',
    headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    },
});

if (!res.ok) {
    alert('Erro ao excluir card');
    fetchBoard();
    return;
}

cardElement.remove();
showToast('Card Excluído!');
}

async function addCard(listId, title) {
console.log('Enviando card:', { title, listId });
const res = await fetch('/api/cards', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, listId }),
});

if (res.ok) {
    fetchBoard();
} else {
    alert('Erro ao criar card');
}
}

async function deleteList(listId) {
if (!confirm('Deseja realmente excluir esta lista?')) return;

const res = await fetch(`/api/lists/${listId}`, {
    method: 'DELETE',
    headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    },
});

if (res.ok) {
    fetchBoard();
} else {
    alert('Erro ao excluir lista');
}
}

function renderLists(lists) {
  boardContainer.innerHTML = '';

  lists.forEach(list => {
    const listColor = list.color || 'bg-light-gray';

    const listCol = document.createElement('div');
    listCol.className = `list ${listColor} p-3 rounded shadow-sm position-relative`;

    listCol.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="mb-0">${list.title}</h5>
        <div class="dropdown">
          <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
            <i class="bi bi-gear"></i>
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item rename-list" href="#">Renomear</a></li>
            <li><a class="dropdown-item change-color-list" href="#">Alterar Cor</a></li>
            <li><hr class="dropdown-divider" /></li>
            <li><a class="dropdown-item text-danger btn-delete-list" href="#" data-list-id="${list.id}">Excluir</a></li>
          </ul>
        </div>
      </div>
      <div class="cards" id="cards-${list.id}"></div>
      <hr>
      <form data-list="${list.id}" class="cardForm mt-3">
        <input type="text" class="form-control mb-2" placeholder="Novo card..." required />
        <button type="submit" class="btn btn-sm btn-outline-primary w-100"><i class="bi bi-plus-lg"></i> Adicionar</button>
      </form>
    `;

    const cardForm = listCol.querySelector('.cardForm');

    cardForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = cardForm.querySelector('input');
      const title = input.value.trim();
      if (!title) return;

      await addCard(list.id, title);
      input.value = '';
    });

    const cardsContainer = listCol.querySelector('.cards');
    list.cards.forEach(card => {
      cardsContainer.appendChild(createCardElement(card));
    });

    listCol.querySelector('.rename-list').addEventListener('click', () => renameList(list));
    listCol.querySelector('.change-color-list').addEventListener('click', () => changeListColor(list));
    listCol.querySelector('.btn-delete-list').addEventListener('click', () => deleteList(list.id));

    boardContainer.appendChild(listCol);

    new Sortable(cardsContainer, {
      group: 'shared',
      animation: 150,
      onEnd: handleCardReorder,
    });
  });
}

function renameList(list) {
  document.getElementById('renameListInput').value = list.title;
  document.getElementById('renameListId').value = list.id;

  const modal = new bootstrap.Modal(document.getElementById('renameListModal'));
  modal.show();
}

document.getElementById('renameListForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('renameListId').value;
  const title = document.getElementById('renameListInput').value.trim();
  if (!title) return;

  const res = await fetch(`/api/lists/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });

  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById('renameListModal')).hide();
    fetchBoard();
  } else {
    alert('Erro ao renomear');
  }
});

document.getElementById('renameListForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('renameListId').value;
  const title = document.getElementById('renameListInput').value.trim();
  if (!title) return;

  const res = await fetch(`/api/lists/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });

  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById('renameListModal')).hide();
    fetchBoard();
  } else {
    alert('Erro ao renomear');
  }
});

async function handleCardReorder(evt) {
const newListId = evt.to.id.replace('cards-', '');
const cardElements = evt.to.querySelectorAll('.card-item');

const updates = Array.from(cardElements).map((el, i) => ({
    id: el.dataset.cardId,
    order: i + 1,
}));

for (const { id, order } of updates) {
    await fetch(`/api/cards/${id}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ order, listId: newListId }),
    });
}

fetchBoard();
}

listForm.addEventListener('submit', async (e) => {
e.preventDefault();
const title = listTitleInput.value.trim();
if (!title) return;

const res = await fetch('/api/lists', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, boardId }),
});

if (res.ok) {
    listTitleInput.value = '';
    fetchBoard();
} else {
    alert('Erro ao criar lista');
}
});

function changeListColor(list) {
  const modal = new bootstrap.Modal(document.getElementById('colorListModal'));
  const modalBody = document.querySelector('#colorListModal .modal-body');
  modalBody.innerHTML = ''; // limpa opções anteriores

  listColorOptions.forEach(colorClass => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn ${colorClass} border border-dark-subtle`;
    btn.style.width = '40px';
    btn.style.height = '40px';
    btn.title = colorClass;

    btn.addEventListener('click', async () => {
      const res = await fetch(`/api/lists/${list.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ color: colorClass }),
      });

      if (res.ok) {
        modal.hide();
        fetchBoard();
      } else {
        alert('Erro ao alterar cor');
      }
    });

    modalBody.appendChild(btn);
  });

  modal.show();
}

fetchBoard();
