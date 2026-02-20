import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
    'https://nelzhukmxrgdoarsxcek.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbHpodWtteHJnZG9hcnN4Y2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMDIxNzUsImV4cCI6MjA3MTU3ODE3NX0.KHvfJHVimKwiraEzbyZWyLnTO5P5VEvM86GlyE7y09k'
);

const bucketCandidates = [
    'Projetos_modulos_blindados',
    'PROJETOS_MODULOS_BLINDADOS',
    'projetos_modulos_blindados'
];

const pathCandidates = [
    '',
    'projetos',
    'projetos/projetos'
];

let resolvedBucket = bucketCandidates[0];
let resolvedBasePath = pathCandidates[0];

async function listarProjetos(filtro = '*') {
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = '';

    try {

        let data = [];
        let error = null;

        resolvedBucket = bucketCandidates[0];
        resolvedBasePath = pathCandidates[0];

        for (const bucket of bucketCandidates) {
            for (const path of pathCandidates) {
                const { data: listData, error: listError } = await supabase.storage
                    .from(bucket)
                    .list(path, {
                        limit: 1000,
                        sortBy: { column: 'name', order: 'asc' }
                    });

                if (listError) {
                    continue;
                }

                if (listData && listData.length > 0) {
                    data = listData;
                    error = null;
                    resolvedBucket = bucket;
                    resolvedBasePath = path;
                    break;
                }
            }

            if (data.length > 0) {
                break;
            }
        }

        if (error) {
            resultado.innerHTML = `<p>Erro ao buscar arquivos: ${error.message}</p>`;
            console.error('Erro:', error);
            return;
        }

        if (!data || data.length === 0) {
            resultado.innerHTML = `<p>Nenhum arquivo encontrado. Verifique as permissões RLS no Supabase.</p>`;
            return;
        }

        // Se a listagem retornou apenas a pasta "projetos", entrar nela
        if (data.length === 1 && data[0]?.name === 'projetos') {
            const nestedPath = resolvedBasePath ? `${resolvedBasePath}/projetos` : 'projetos';
            const { data: nestedData, error: nestedError } = await supabase.storage
                .from(resolvedBucket)
                .list(nestedPath, {
                    limit: 1000,
                    sortBy: { column: 'name', order: 'asc' }
                });

            if (!nestedError && nestedData && nestedData.length > 0) {
                data = nestedData;
                resolvedBasePath = nestedPath;
            }
        }

        // Filtrar apenas arquivos (não pastas)
        const arquivos = data.filter(item => {
            const isFile = item.name && !item.id?.endsWith('/');
            return isFile;
        });

    const userCategoria = sessionStorage.getItem('userCategoria');
    const isUsuario = userCategoria === 'usuario';

    // Busca case-insensitive
    const projetos = filtro === '*' 
        ? arquivos 
        : arquivos.filter(item => item.name.toLowerCase().includes(filtro.toLowerCase()));

    // função que remove sufixo numérico (timestamp) e extensao para ordenar pelo nome "limpo"
    const cleanName = (name) =>
      name
        .replace(/(?:[_-]\d{6,})(?=\.[^.]+$)/g, '') // remove sufixos numéricos (timestamps)
        .replace(/\.[^.]+$/, '')                   // remove extensão (.pdf)
        .toLowerCase()
        .trim();

    // collator para ordenar corretamente em português (case-insensitive)
    const collator = new Intl.Collator('pt', { sensitivity: 'base', numeric: false });

    projetos.sort((a, b) => collator.compare(cleanName(a.name), cleanName(b.name)));
    
    if (!projetos || projetos.length === 0) {
        resultado.innerHTML = `<p>Nenhum projeto encontrado. (Arquivos: ${arquivos.length})</p>`;
        return;
    }

        resultado.innerHTML = `
                <table class="tabela-modulos">
          <thead>
            <tr>
              <th>Nome do Projeto</th>
              <th>Link para PDF</th>
              <th id="th-acoes-modulos">Ações</th>
            </tr>
          </thead>
          <tbody id="tabelaProjetos"></tbody>
        </table>
      `;
    // Ocultar cabeçalho da coluna Ações para usuario
    const thAcoes = document.getElementById('th-acoes-modulos');
    if (thAcoes) {
        thAcoes.style.display = isUsuario ? 'none' : '';
    }
    const corpoTabela = document.getElementById('tabelaProjetos');

for (const item of projetos) {
    const prefixo = resolvedBasePath ? `${resolvedBasePath}/` : '';
    const caminhoCompleto = `${prefixo}${item.name}`;
    const { data: urlData } = supabase.storage
        .from(resolvedBucket)
        .getPublicUrl(caminhoCompleto);

    // remove sufixo _123456... antes da extensão e melhora leitura substituindo _ por espaço
    const displayName = item.name
      .replace(/(?:[_-]\d{13})(?=\.[^.]+$)/, '')   // remove timestamp de 13 dígitos
      .replace(/\s+/g, '_')                       // converte espaços em underscore
      .replace(/__+/g, '_')                       // colapsa underscores duplicados
      .trim();

    const linha = document.createElement('tr');
    if (isUsuario) {
        linha.innerHTML = `
          <td>${displayName}</td>
          <td><a href="${urlData.publicUrl}" target="_blank">Visualizar PDF</a></td>
        `;
    } else {
        linha.innerHTML = `
          <td>${displayName}</td>
          <td><a href="${urlData.publicUrl}" target="_blank">Visualizar PDF</a></td>
          <td><button class="excluir" onclick="excluirProjeto('${caminhoCompleto}')">Excluir</button></td>
        `;
    }
    corpoTabela.appendChild(linha);
}

    } catch (error) {
        resultado.innerHTML = `<p>Erro ao processar: ${error.message}</p>`;
        console.error('Erro:', error);
    }
}

window.excluirProjeto = async function (caminho) {
    const confirmar = confirm('Tem certeza que deseja excluir este projeto?');
    if (!confirmar) return;

    const { error } = await supabase.storage
        .from(resolvedBucket)
        .remove([caminho]);

    if (error) {
        alert('Erro ao excluir o projeto.');
        console.error(error);
        return;
    }

    alert('Projeto excluído com sucesso!');
    listarProjetos();
};


window.addEventListener('DOMContentLoaded', () => listarProjetos());

// ...existing code...
document.getElementById('formProjeto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nomeRaw = document.getElementById('nomeProjeto').value.trim();
    const arquivo = document.getElementById('arquivoPDF').files[0];
    if (!nomeRaw || !arquivo) {
        alert('Preencha todos os campos.');
        return;
    }

const nomeSanitizado = nomeRaw
    .replace(/[^a-zA-Z0-9À-ÿ\s_-]/g, '') // permite letras, números, espaços, underscore e hífen
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

    const filename = `${nomeSanitizado}.pdf`;
    const uploadBasePath = resolvedBasePath || 'projetos';
    const caminho = uploadBasePath ? `${uploadBasePath}/${filename}` : filename;

    // upload com upsert para forçar substituição
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(resolvedBucket)
        .upload(caminho, arquivo, { upsert: true });

    if (uploadError) {
        alert('Erro ao enviar o PDF');
        console.error('uploadError', uploadError);
        return;
    }

    alert('Projeto cadastrado com sucesso!');
    document.getElementById('formProjeto').reset();
    listarProjetos();
});
// ...existing code...

document.getElementById('btnBuscar').addEventListener('click', () => {
    const nomeBusca = document.getElementById('buscaProjeto').value.trim().replace(/\s+/g, '_');
    listarProjetos(nomeBusca || '*');
});

// Buscar ao pressionar Enter no campo de busca
document.getElementById('buscaProjeto').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const nomeBusca = document.getElementById('buscaProjeto').value.trim().replace(/\s+/g, '_');
        listarProjetos(nomeBusca || '*');
    }
});

// Ocultar apenas formulário de cadastro para usuario (manter buscador visível)
document.addEventListener('DOMContentLoaded', () => {
    const userCategoria = sessionStorage.getItem('userCategoria');
    if (userCategoria === 'usuario') {
        const formCadastro = document.getElementById('formularioCadastro');
        if (formCadastro) {
            formCadastro.style.display = 'none';
        }
    }
    
    // Carregar e exibir todos os módulos ao iniciar a página
    listarProjetos('*');
});