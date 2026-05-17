// 🔐 Substitua com os dados do seu projeto Supabase
const supabaseUrl = 'https://nelzhukmxrgdoarsxcek.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbHpodWtteHJnZG9hcnN4Y2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMDIxNzUsImV4cCI6MjA3MTU3ODE3NX0.KHvfJHVimKwiraEzbyZWyLnTO5P5VEvM86GlyE7y09k';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let editingLinkId = null;

function escapeHtml(value) {
    return (value || '')
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function updateFormMode() {
    const btnSalvar = document.getElementById('btnSalvarLink');
    const btnCancelar = document.getElementById('btnCancelarEdicao');

    if (!btnSalvar || !btnCancelar) return;

    if (editingLinkId) {
        btnSalvar.textContent = 'Salvar Edição';
        btnCancelar.style.display = 'inline-block';
    } else {
        btnSalvar.textContent = 'Adicionar Link';
        btnCancelar.style.display = 'none';
    }
}

window.startEditLink = function (id, titleEncoded, urlEncoded) {
    editingLinkId = id;
    document.getElementById('title').value = decodeURIComponent(titleEncoded || '');
    document.getElementById('url').value = decodeURIComponent(urlEncoded || '');
    updateFormMode();
    document.getElementById('title').focus();
};

window.cancelEdit = function () {
    editingLinkId = null;
    document.getElementById('title').value = '';
    document.getElementById('url').value = '';
    updateFormMode();
};

// 🔄 Carrega os links da tabela
async function loadLinks() {
    const { data, error } = await supabaseClient.from('links').select('*').order('title', { ascending: true });
    const table = document.getElementById('linkTable');
    table.innerHTML = '';

    if (error) {
        console.error('Erro ao carregar links:', error.message);
        return;
    }

    const userCategoria = sessionStorage.getItem('userCategoria');
    const isUsuario = userCategoria === 'usuario';

    // Ocultar cabeçalho da coluna Ações para usuario
    const thAcoes = document.getElementById('th-acoes');
    if (thAcoes) {
        thAcoes.style.display = isUsuario ? 'none' : '';
    }

    data.forEach(link => {
        const row = document.createElement('tr');
        const titleSafe = escapeHtml(link.title);
        const urlSafe = escapeHtml(link.url);
        const titleEncoded = encodeURIComponent(link.title || '');
        const urlEncoded = encodeURIComponent(link.url || '');

        if (isUsuario) {
            row.innerHTML = `
            <td>${titleSafe}</td>
            <td><a href="${urlSafe}" target="_blank">${urlSafe}</a></td>
            `;
        } else {
            row.innerHTML = `
            <td>${titleSafe}</td>
            <td><a href="${urlSafe}" target="_blank">${urlSafe}</a></td>
            <td>
                <button class="editar" onclick="startEditLink('${link.id}','${titleEncoded}','${urlEncoded}')">Editar</button>
                <button class="excluir" onclick="deleteLink('${link.id}')">Excluir</button>
            </td>
            `;
        }
        table.appendChild(row);
    });
}

// ➕ Adiciona um novo link
async function addLink() {
    const title = document.getElementById('title').value.trim();
    const url = document.getElementById('url').value.trim();

    if (!title || !url) {
        alert('Preencha os campos de título e URL!');
        return;
    }

    let error;

    if (editingLinkId) {
        const confirmarEdicao = confirm('Deseja salvar as alteracoes deste link?');
        if (!confirmarEdicao) {
            return;
        }

        const updateResult = await supabaseClient
            .from('links')
            .update({ title, url })
            .eq('id', editingLinkId);
        error = updateResult.error;
    } else {
        const insertResult = await supabaseClient
            .from('links')
            .insert([{ title, url }]);
        error = insertResult.error;
    }

    if (error) {
        alert('Erro ao salvar link: ' + error.message);
        return;
    }

    if (editingLinkId) {
        alert('Link atualizado com sucesso!');
    }

    cancelEdit();
    loadLinks();
}

// ❌ Exclui um link pelo ID
async function deleteLink(id) {
    const { error } = await supabaseClient.from('links').delete().eq('id', id);

    if (error) {
        alert('Erro ao excluir link: ' + error.message);
        return;
    }

    if (editingLinkId === id) {
        cancelEdit();
    }

    loadLinks();
}

// 🚀 Inicializa a tabela ao carregar a página
loadLinks();
updateFormMode();

// Ocultar formulário de adicionar links para usuario
document.addEventListener('DOMContentLoaded', () => {
    const userCategoria = sessionStorage.getItem('userCategoria');
    if (userCategoria === 'usuario') {
        const formAdicionar = document.getElementById('form-adicionar-link');
        if (formAdicionar) {
            formAdicionar.style.display = 'none';
        }
    }
});