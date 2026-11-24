
const campoTarefa = document.getElementById('tituloTarefa');
const campoImportancia = document.getElementById('importanciaTarefa');
const campoUrgencia = document.getElementById('urgenciaTarefa');
const campoPrazo = document.getElementById('prazoTarefa');
const botaoAdicionar = document.getElementById('btnAdicionar');

const colunas = {
    fazer: document.getElementById('aFazer'),
    andamento: document.getElementById('emAndamento'),
    concluido: document.getElementById('concluido')
};

const quadrantes = {
    fazerAgora: document.getElementById('fazerAgora'),
    planejar: document.getElementById('planejar'),
    delegar: document.getElementById('delegar'),
    reavaliar: document.getElementById('reavaliar')
};

let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];

function salvarTarefas() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

// =================================
// FUNÇÕES DE DATA E PRAZO
// =================================

function obterDataAtual() {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
    if (!data) return '';

    const partes = data.split('-');

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterSituacaoPrazo(tarefa) {
    if (!tarefa.prazo) {
        return 'Sem prazo definido';
    }

    if (tarefa.status === 'concluido') {
        return `Prazo: ${formatarData(tarefa.prazo)}`;
    }

    const hoje = obterDataAtual();

    if (tarefa.prazo < hoje) {
        return `Atrasada! Prazo: ${formatarData(tarefa.prazo)}`;
    }

    if (tarefa.prazo === hoje) {
        return 'Vence hoje!';
    }

    return `No prazo: ${formatarData(tarefa.prazo)}`;
}

// =================================
// PAINEL DE RESUMO
// =================================

function atualizarPainel() {
    document.getElementById('totalTarefas').textContent = tarefas.length;

    document.getElementById('tarefasAndamento').textContent =
        tarefas.filter(tarefa => tarefa.status === 'andamento').length;

    document.getElementById('tarefasConcluidas').textContent =
        tarefas.filter(tarefa => tarefa.status === 'concluido').length;
}

// =================================
// CLASSIFICAÇÃO EISENHOWER
// =================================

function obterClassificacao(tarefa) {
    if (tarefa.importante === 'sim' && tarefa.urgente === 'sim') {
        return 'Importante e urgente — Fazer agora';
    }

    if (tarefa.importante === 'sim' && tarefa.urgente === 'nao') {
        return 'Importante e não urgente — Planejar';
    }

    if (tarefa.importante === 'nao' && tarefa.urgente === 'sim') {
        return 'Não importante e urgente — Delegar';
    }

    return 'Não importante e não urgente — Reavaliar';
}

// =================================
// ATUALIZAR MATRIZ DE EISENHOWER
// =================================

function atualizarMatriz() {
    Object.values(quadrantes).forEach(quadrante => {
        quadrante.innerHTML = '';
    });

    tarefas.forEach(tarefa => {
        if (tarefa.status === 'concluido') return;

        let destino;

        if (tarefa.importante === 'sim' && tarefa.urgente === 'sim') {
            destino = quadrantes.fazerAgora;
        } else if (tarefa.importante === 'sim' && tarefa.urgente === 'nao') {
            destino = quadrantes.planejar;
        } else if (tarefa.importante === 'nao' && tarefa.urgente === 'sim') {
            destino = quadrantes.delegar;
        } else {
            destino = quadrantes.reavaliar;
        }

        const item = document.createElement('div');
        item.className = 'tarefa-matriz';

        const titulo = document.createElement('p');
        titulo.textContent = tarefa.titulo;

        const prazo = document.createElement('small');
        prazo.textContent = obterSituacaoPrazo(tarefa);

        item.appendChild(titulo);
        item.appendChild(prazo);

        destino.appendChild(item);
    });
}

// =================================
// EXIBIÇÃO DAS TAREFAS NO KANBAN
// =================================

function mostrarTarefas() {
    Object.values(colunas).forEach(coluna => {
        coluna.innerHTML = '';
    });

    tarefas.forEach(tarefa => {
        // Compatibilidade com tarefas antigas
        tarefa.prioridade = tarefa.prioridade || 'media';
        tarefa.importante = tarefa.importante || 'nao';
        tarefa.urgente = tarefa.urgente || 'nao';

        const cartao = document.createElement('div');
        cartao.className = 'card-tarefa';

        const titulo = document.createElement('p');
        titulo.textContent = tarefa.titulo;

        const classificacao = document.createElement('p');
        classificacao.textContent = obterClassificacao(tarefa);

        const prazo = document.createElement('p');
        prazo.textContent = obterSituacaoPrazo(tarefa);
        prazo.className = 'informacao-prazo';

        const importancia = document.createElement('select');

        [
            { valor: 'sim', texto: 'Importante' },
            { valor: 'nao', texto: 'Não importante' }
        ].forEach(item => {
            const opcao = document.createElement('option');
            opcao.value = item.valor;
            opcao.textContent = item.texto;
            importancia.appendChild(opcao);
        });

        importancia.value = tarefa.importante;

        importancia.addEventListener('change', () => {
            tarefa.importante = importancia.value;
            salvarTarefas();
            mostrarTarefas();
        });

        const urgencia = document.createElement('select');

        [
            { valor: 'sim', texto: 'Urgente' },
            { valor: 'nao', texto: 'Não urgente' }
        ].forEach(item => {
            const opcao = document.createElement('option');
            opcao.value = item.valor;
            opcao.textContent = item.texto;
            urgencia.appendChild(opcao);
        });

        urgencia.value = tarefa.urgente;

        urgencia.addEventListener('change', () => {
            tarefa.urgente = urgencia.value;
            salvarTarefas();
            mostrarTarefas();
        });

        const prioridade = document.createElement('select');

        const prioridades = [
            { valor: 'alta', texto: '🔴 Alta' },
            { valor: 'media', texto: '🟡 Média' },
            { valor: 'baixa', texto: '🟢 Baixa' }
        ];

        prioridades.forEach(item => {
            const opcao = document.createElement('option');
            opcao.value = item.valor;
            opcao.textContent = item.texto;
            prioridade.appendChild(opcao);
        });

        prioridade.value = tarefa.prioridade;

        prioridade.addEventListener('change', () => {
            tarefa.prioridade = prioridade.value;
            salvarTarefas();
        });

        const selecionar = document.createElement('select');

        const status = [
            { valor: 'fazer', texto: 'A Fazer' },
            { valor: 'andamento', texto: 'Em Andamento' },
            { valor: 'concluido', texto: 'Concluído' }
        ];

        status.forEach(item => {
            const opcao = document.createElement('option');
            opcao.value = item.valor;
            opcao.textContent = item.texto;
            selecionar.appendChild(opcao);
        });

        selecionar.value = tarefa.status;

        selecionar.addEventListener('change', () => {
            tarefa.status = selecionar.value;
            salvarTarefas();
            mostrarTarefas();
        });

        const editar = document.createElement('button');
        editar.textContent = 'Editar';

        editar.addEventListener('click', () => {
            const novoTitulo = prompt(
                'Digite o novo nome da tarefa:',
                tarefa.titulo
            );

            if (novoTitulo === null) return;

            if (novoTitulo.trim() === '') {
                alert('O nome da tarefa não pode ficar vazio!');
                return;
            }

            tarefa.titulo = novoTitulo.trim();

            salvarTarefas();
            mostrarTarefas();
        });

        const excluir = document.createElement('button');
        excluir.textContent = 'Excluir';

        excluir.addEventListener('click', () => {
            tarefas = tarefas.filter(item => item.id !== tarefa.id);
            salvarTarefas();
            mostrarTarefas();
        });

        cartao.appendChild(titulo);
        cartao.appendChild(classificacao);
        cartao.appendChild(prazo);
        cartao.appendChild(importancia);
        cartao.appendChild(urgencia);
        cartao.appendChild(prioridade);
        cartao.appendChild(selecionar);
        cartao.appendChild(editar);
        cartao.appendChild(excluir);

        if (colunas[tarefa.status]) {
            colunas[tarefa.status].appendChild(cartao);
        }
    });

    salvarTarefas();
    atualizarPainel();
    atualizarMatriz();
}

// =================================
// ADICIONAR TAREFAS
// =================================

function adicionarTarefa() {
    const titulo = campoTarefa.value.trim();
    const prazo = campoPrazo.value;

    if (titulo === '') {
        alert('Digite uma tarefa antes de adicionar!');
        return;
    }

    tarefas.push({
        id: Date.now(),
        titulo: titulo,
        status: 'fazer',
        prioridade: 'media',
        importante: campoImportancia.value,
        urgente: campoUrgencia.value,
        prazo: prazo
    });

    campoTarefa.value = '';
    campoPrazo.value = '';

    salvarTarefas();
    mostrarTarefas();
}

botaoAdicionar.addEventListener('click', adicionarTarefa);

campoTarefa.addEventListener('keydown', evento => {
    if (evento.key === 'Enter') {
        adicionarTarefa();
    }
});

mostrarTarefas();

// =================================
// TÉCNICA POMODORO
// =================================

const relogio = document.getElementById('relogio');
const btnIniciar = document.getElementById('btnIniciar');
const btnPausar = document.getElementById('btnPausar');
const btnReiniciar = document.getElementById('btnReiniciar');
const btnDescanso = document.getElementById('btnDescanso');

const TEMPO_FOCO = 25 * 60;
const TEMPO_DESCANSO = 5 * 60;

let tempoRestante = TEMPO_FOCO;
let intervaloPomodoro = null;
let modoPomodoro = 'foco';
let descansoDisponivel = false;

btnDescanso.disabled = true;

function atualizarRelogio() {
    const minutos = Math.floor(tempoRestante / 60);
    const segundos = tempoRestante % 60;

    relogio.textContent =
        String(minutos).padStart(2, '0') + ':' +
        String(segundos).padStart(2, '0');
}

function iniciarContagem() {
    if (intervaloPomodoro !== null) return;

    intervaloPomodoro = setInterval(() => {
        tempoRestante--;

        atualizarRelogio();

        if (tempoRestante <= 0) {
            clearInterval(intervaloPomodoro);
            intervaloPomodoro = null;

            if (modoPomodoro === 'foco') {
                descansoDisponivel = true;
                btnDescanso.disabled = false;

                alert('Parabéns! Você concluiu 25 minutos de foco. Seu descanso está disponível!');
            } else {
                modoPomodoro = 'foco';
                tempoRestante = TEMPO_FOCO;
                descansoDisponivel = false;
                btnDescanso.disabled = true;

                atualizarRelogio();

                alert('Descanso concluído! Hora de voltar ao foco!');
            }
        }
    }, 1000);
}

btnIniciar.addEventListener('click', iniciarContagem);

btnPausar.addEventListener('click', () => {
    clearInterval(intervaloPomodoro);
    intervaloPomodoro = null;
});

btnReiniciar.addEventListener('click', () => {
    clearInterval(intervaloPomodoro);
    intervaloPomodoro = null;

    if (modoPomodoro === 'foco') {
        tempoRestante = TEMPO_FOCO;
    } else {
        tempoRestante = TEMPO_DESCANSO;
    }

    atualizarRelogio();
});

btnDescanso.addEventListener('click', () => {
    if (!descansoDisponivel || intervaloPomodoro !== null) return;

    modoPomodoro = 'descanso';
    tempoRestante = TEMPO_DESCANSO;
    descansoDisponivel = false;

    btnDescanso.disabled = true;

    atualizarRelogio();
    iniciarContagem();
});

atualizarRelogio();
