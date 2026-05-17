import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

let resolvedBucket = 'Projetos_modulos_blindados';
let resolvedBasePath = 'projetos/projetos';

const PROJECT_META_TABLE = 'modulos_projetos';

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

function sanitizeToken(value) {
    return (value || '')
        .toString()
        .trim()
        .replace(/[^a-zA-Z0-9À-ÿ.\s_-]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function sanitizeFileNamePart(value) {
    return (value || '')
        .toString()
        .trim()
        .replace(/[\\/:*?"<>|]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function buildDownloadFileName(meta) {
    const nomeProjeto = sanitizeFileNamePart(meta.nomeProjeto);
    const tipoSubestacao = sanitizeFileNamePart(meta.tipoSubestacao);
    const modeloProjeto = sanitizeFileNamePart(meta.modeloProjeto);
    const nivelTensao = sanitizeFileNamePart(meta.nivelTensao);
    const modalidadeProjeto = sanitizeFileNamePart(meta.modalidadeProjeto);
    const aplicacaoProjeto = sanitizeFileNamePart(meta.aplicacaoProjeto);
    const versaoProjeto = sanitizeFileNamePart(meta.versaoProjeto);

    const parts = [
        nomeProjeto,
        tipoSubestacao ? `SE-${tipoSubestacao}` : '',
        modeloProjeto ? `MODELO-${modeloProjeto}` : '',
        nivelTensao ? `NT-${nivelTensao}` : '',
        modalidadeProjeto ? `MODALIDADE-${modalidadeProjeto}` : '',
        aplicacaoProjeto ? `APLICACAO-${aplicacaoProjeto}` : '',
        versaoProjeto ? `VERSAO-${versaoProjeto}` : ''
    ].filter(Boolean);

    const joined = parts.join('__');
    return `${joined || 'projeto'}.pdf`;
}

async function downloadProjectFile(publicUrl, downloadName) {
    try {
        const response = await fetch(publicUrl);
        if (!response.ok) {
            throw new Error(`Falha no download: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = downloadName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Erro ao baixar arquivo:', error);
        window.open(publicUrl, '_blank', 'noopener');
    }
}

function decodeProjectFilename(fileName) {
    const semExtensao = fileName.replace(/\.[^.]+$/, '');
    const semTimestamp = semExtensao.replace(/(?:[_-]\d{6,})$/, '');
    const partes = semTimestamp.split('__');
    const nomeProjeto = (partes[0] || '').replace(/_/g, ' ').trim();

    const metadata = {
        nomeProjeto,
        tipoSubestacao: '',
        modeloProjeto: '',
        nivelTensao: '',
        modalidadeProjeto: '',
        aplicacaoProjeto: '',
        versaoProjeto: ''
    };

    for (const parte of partes.slice(1)) {
        if (!parte.includes('-')) continue;
        const idx = parte.indexOf('-');
        const chave = parte.slice(0, idx);
        const valor = parte.slice(idx + 1);
        const decodificado = valor === 'na' ? '' : valor.replace(/_/g, ' ').trim();

        if (chave === 'se') metadata.tipoSubestacao = decodificado;
        if (chave === 'mod') metadata.modeloProjeto = decodificado;
        if (chave === 'nt') metadata.nivelTensao = decodificado;
        if (chave === 'md') metadata.modalidadeProjeto = decodificado;
        if (chave === 'ap') metadata.aplicacaoProjeto = decodificado;
        if (chave === 'ver') metadata.versaoProjeto = decodificado;
    }

    return metadata;
}

function textoBusca(value) {
    return (value || '').toString().toLowerCase().trim();
}

function montarFiltro(inputFiltro = '*') {
    if (typeof inputFiltro === 'string') {
        return {
            nomeProjeto: inputFiltro,
            tipoSubestacao: '',
            modeloProjeto: '',
            nivelTensao: '',
            modalidadeProjeto: '',
            aplicacaoProjeto: '',
            versaoProjeto: ''
        };
    }

    return {
        nomeProjeto: inputFiltro?.nomeProjeto || '*',
        tipoSubestacao: inputFiltro?.tipoSubestacao || '',
        modeloProjeto: inputFiltro?.modeloProjeto || '',
        nivelTensao: inputFiltro?.nivelTensao || '',
        modalidadeProjeto: inputFiltro?.modalidadeProjeto || '',
        aplicacaoProjeto: inputFiltro?.aplicacaoProjeto || '',
        versaoProjeto: inputFiltro?.versaoProjeto || ''
    };
}

function matchesFilter(meta, filtro) {
    const nomeBusca = textoBusca(filtro.nomeProjeto);
    const modeloBusca = textoBusca(filtro.modeloProjeto);
    const versaoBusca = textoBusca(filtro.versaoProjeto);

    const nomeProjeto = textoBusca(meta.nomeProjeto).replace(/\s+/g, '_');
    const modeloProjeto = textoBusca(meta.modeloProjeto);
    const versaoProjeto = textoBusca(meta.versaoProjeto);
    const tipoSubestacao = textoBusca(meta.tipoSubestacao);
    const nivelTensao = textoBusca(meta.nivelTensao);
    const modalidadeProjeto = textoBusca(meta.modalidadeProjeto);
    const aplicacaoProjeto = textoBusca(meta.aplicacaoProjeto);

    const nomeOk = !nomeBusca || nomeBusca === '*' || nomeProjeto.includes(nomeBusca.replace(/\s+/g, '_'));
    const tipoOk = !filtro.tipoSubestacao || tipoSubestacao === textoBusca(filtro.tipoSubestacao);
    const modeloOk = !modeloBusca || modeloProjeto.includes(modeloBusca);
    const nivelOk = !filtro.nivelTensao || nivelTensao === textoBusca(filtro.nivelTensao);
    const modalidadeOk = !filtro.modalidadeProjeto || modalidadeProjeto === textoBusca(filtro.modalidadeProjeto);
    const aplicacaoOk = !filtro.aplicacaoProjeto || aplicacaoProjeto === textoBusca(filtro.aplicacaoProjeto);
    const versaoOk = !versaoBusca || versaoProjeto.includes(versaoBusca);

    return nomeOk && tipoOk && modeloOk && nivelOk && modalidadeOk && aplicacaoOk && versaoOk;
}

function storagePrefix() {
    return resolvedBasePath ? `${resolvedBasePath}/` : '';
}

async function fetchMetadataMap(storagePaths) {
    if (!storagePaths.length) {
        return new Map();
    }

    const { data, error } = await supabase
        .from(PROJECT_META_TABLE)
        .select('storage_path,nome_projeto,tipo_subestacao,modelo,nivel_tensao,modalidade,aplicacao,versao')
        .in('storage_path', storagePaths);

    if (error) {
        console.warn('Tabela de metadados indisponivel. Usando fallback por nome de arquivo.', error.message);
        return new Map();
    }

    const map = new Map();
    for (const row of data || []) {
        map.set(row.storage_path, {
            nomeProjeto: row.nome_projeto || '',
            tipoSubestacao: row.tipo_subestacao || '',
            modeloProjeto: row.modelo || '',
            nivelTensao: row.nivel_tensao || '',
            modalidadeProjeto: row.modalidade || '',
            aplicacaoProjeto: row.aplicacao || '',
            versaoProjeto: row.versao || ''
        });
    }

    return map;
}

async function upsertMetadata(payload) {
    const { error } = await supabase
        .from(PROJECT_META_TABLE)
        .upsert(payload, { onConflict: 'storage_path' });

    if (error) {
        console.warn('Nao foi possivel salvar metadados na tabela.', error.message);
    }
}

async function deleteMetadata(storagePath) {
    const { error } = await supabase
        .from(PROJECT_META_TABLE)
        .delete()
        .eq('storage_path', storagePath);

    if (error) {
        console.warn('Nao foi possivel remover metadados da tabela.', error.message);
    }
}

async function descobrirBucketECaminho() {
    let data = [];

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
                resolvedBucket = bucket;
                resolvedBasePath = path;
                break;
            }
        }

        if (data.length > 0) {
            break;
        }
    }

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

    return data;
}

async function listarProjetos(filtro = '*') {
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = '';
    resultado.style.display = 'none';

    const filtroNormalizado = montarFiltro(filtro);

    try {
        const data = await descobrirBucketECaminho();

        if (!data || data.length === 0) {
            resultado.innerHTML = '<p>Nenhum arquivo encontrado. Verifique as permissoes RLS no Supabase.</p>';
            resultado.style.display = 'block';
            return;
        }

        const arquivos = data.filter(item => item.name && !item.id?.endsWith('/'));
        const prefixo = storagePrefix();

        const registros = arquivos.map(item => {
            const storagePath = `${prefixo}${item.name}`;
            return {
                item,
                storagePath,
                fallbackMeta: decodeProjectFilename(item.name)
            };
        });

        const metadataMap = await fetchMetadataMap(registros.map(r => r.storagePath));
        const registrosCompletos = registros.map(registro => ({
            ...registro,
            meta: metadataMap.get(registro.storagePath) || registro.fallbackMeta
        }));

        const projetos = registrosCompletos.filter(r => matchesFilter(r.meta, filtroNormalizado));

        const collator = new Intl.Collator('pt', { sensitivity: 'base', numeric: false });
        projetos.sort((a, b) => collator.compare(a.meta.nomeProjeto || a.item.name, b.meta.nomeProjeto || b.item.name));

        if (!projetos.length) {
            resultado.innerHTML = `<p>Nenhum projeto encontrado. (Arquivos: ${arquivos.length})</p>`;
            resultado.style.display = 'block';
            return;
        }

        const userCategoria = sessionStorage.getItem('userCategoria');
        const isUsuario = userCategoria === 'usuario';

        resultado.innerHTML = `
            <table class="tabela-modulos">
              <thead>
                <tr>
                  <th>Nome do Projeto</th>
                  <th>Tipo Subestacao</th>
                  <th>Modelo</th>
                  <th>Nivel de Tensao</th>
                  <th>Modalidade</th>
                  <th>Aplicacao</th>
                  <th>Versao</th>
                  <th>Link para PDF</th>
                  <th id="th-acoes-modulos">Acoes</th>
                </tr>
              </thead>
              <tbody id="tabelaProjetos"></tbody>
            </table>
        `;
        resultado.style.display = 'block';

        const thAcoes = document.getElementById('th-acoes-modulos');
        if (thAcoes) {
            thAcoes.style.display = isUsuario ? 'none' : '';
        }

        const corpoTabela = document.getElementById('tabelaProjetos');

        corpoTabela.addEventListener('click', async (event) => {
            const link = event.target.closest('.download-projeto');
            if (!link) return;

            event.preventDefault();
            const publicUrl = link.dataset.url;
            const downloadName = link.dataset.filename || 'projeto.pdf';
            await downloadProjectFile(publicUrl, downloadName);
        });

        for (const registro of projetos) {
            const { data: urlData } = supabase.storage
                .from(resolvedBucket)
                .getPublicUrl(registro.storagePath);

            const meta = registro.meta;
            const linha = document.createElement('tr');
            const downloadName = buildDownloadFileName(meta);

            const baseCells = `
                <td>${meta.nomeProjeto || '-'}</td>
                <td>${meta.tipoSubestacao || '-'}</td>
                <td>${meta.modeloProjeto || '-'}</td>
                <td>${meta.nivelTensao || '-'}</td>
                <td>${meta.modalidadeProjeto || '-'}</td>
                <td>${meta.aplicacaoProjeto || '-'}</td>
                <td>${meta.versaoProjeto || '-'}</td>
                <td><a href="#" class="download-projeto" data-url="${urlData.publicUrl}" data-filename="${downloadName}">Visualizar PDF</a></td>
            `;

            if (isUsuario) {
                linha.innerHTML = baseCells;
            } else {
                linha.innerHTML = `${baseCells}<td><button class="excluir" onclick="excluirProjeto('${registro.storagePath}')">Excluir</button></td>`;
            }

            corpoTabela.appendChild(linha);
        }
    } catch (error) {
        resultado.innerHTML = `<p>Erro ao processar: ${error.message}</p>`;
        resultado.style.display = 'block';
        console.error('Erro:', error);
    }
}

window.excluirProjeto = async function (storagePath) {
    const confirmar = confirm('Tem certeza que deseja excluir este projeto?');
    if (!confirmar) return;

    let { error } = await supabase.storage
        .from(resolvedBucket)
        .remove([storagePath]);

    if (error && resolvedBucket !== 'Projetos_modulos_blindados') {
        const fallbackDelete = await supabase.storage
            .from('Projetos_modulos_blindados')
            .remove([storagePath]);
        error = fallbackDelete.error;
    }

    if (error) {
        alert('Erro ao excluir o projeto.');
        console.error(error);
        return;
    }

    await deleteMetadata(storagePath);

    alert('Projeto excluido com sucesso!');
    listarProjetos();
};

function coletarFiltroDaTela() {
    return {
        nomeProjeto: document.getElementById('buscaProjeto').value.trim() || '*',
        tipoSubestacao: document.getElementById('buscaTipoSubestacao').value,
        modeloProjeto: document.getElementById('buscaModeloProjeto').value.trim(),
        nivelTensao: document.getElementById('buscaNivelTensao').value,
        modalidadeProjeto: document.getElementById('buscaModalidadeProjeto').value,
        aplicacaoProjeto: document.getElementById('buscaAplicacaoProjeto').value,
        versaoProjeto: document.getElementById('buscaVersaoProjeto').value.trim()
    };
}

document.getElementById('formProjeto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nomeProjeto = document.getElementById('nomeProjeto').value.trim();
    const tipoSubestacao = document.getElementById('tipoSubestacao').value;
    const modeloProjeto = document.getElementById('modeloProjeto').value.trim();
    const nivelTensao = document.getElementById('nivelTensao').value;
    const modalidadeProjeto = document.getElementById('modalidadeProjeto').value;
    const aplicacaoProjeto = document.getElementById('aplicacaoProjeto').value;
    const versaoProjeto = document.getElementById('versaoProjeto').value.trim();
    const arquivo = document.getElementById('arquivoPDF').files[0];

    if (!nomeProjeto || !arquivo) {
        alert('Preencha o Nome do Projeto e selecione o PDF.');
        return;
    }

    const nomeBase = sanitizeToken(nomeProjeto) || `projeto_${Date.now()}`;
    const filename = `${nomeBase}.pdf`;

    const uploadBasePath = resolvedBasePath || 'projetos';
    const storagePath = uploadBasePath ? `${uploadBasePath}/${filename}` : filename;

    const { error: uploadError } = await supabase.storage
        .from(resolvedBucket)
        .upload(storagePath, arquivo, { upsert: true });

    if (uploadError) {
        alert('Erro ao enviar o PDF');
        console.error('uploadError', uploadError);
        return;
    }

    await upsertMetadata({
        storage_path: storagePath,
        nome_projeto: nomeProjeto,
        tipo_subestacao: tipoSubestacao || null,
        modelo: modeloProjeto || null,
        nivel_tensao: nivelTensao || null,
        modalidade: modalidadeProjeto || null,
        aplicacao: aplicacaoProjeto || null,
        versao: versaoProjeto || null
    });

    alert('Projeto cadastrado com sucesso!');
    document.getElementById('formProjeto').reset();
    listarProjetos();
});

document.getElementById('btnBuscar').addEventListener('click', () => {
    listarProjetos(coletarFiltroDaTela());
});

document.getElementById('buscaProjeto').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        listarProjetos(coletarFiltroDaTela());
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const userCategoria = sessionStorage.getItem('userCategoria');
    if (userCategoria === 'usuario') {
        const formCadastro = document.getElementById('formularioCadastro');
        if (formCadastro) {
            formCadastro.style.display = 'none';
        }
    }

    const resultado = document.getElementById('resultado');
    if (resultado) {
        resultado.innerHTML = '';
        resultado.style.display = 'none';
    }
});
