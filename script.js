// REFERÊNCIAS GERAIS E ÁUDIO
const audioFundo = document.getElementById('audio-fundo');
const audioDigitacao = document.getElementById('audio-digitacao');
const audioMensagem = document.getElementById('audio-mensagem'); 
const audioErro = document.getElementById('audio-erro');
const audioAnomalia = document.getElementById('audio-anomalia');
const audioAcessoNegado = document.getElementById('audio-acesso-negado');

if(audioFundo) audioFundo.volume = 0.2; 
if(audioDigitacao) audioDigitacao.volume = 0.5;
if(audioMensagem) audioMensagem.volume = 0.6; 
if(audioErro) audioErro.volume = 0.5;
if(audioAnomalia) audioAnomalia.volume = 0.8; 
if(audioAcessoNegado) audioAcessoNegado.volume = 0.5;

const botaoGatilho = document.getElementById('icone-gatilho-ia');
const iaCentral = document.getElementById('ia-central');
const areaChat = document.getElementById('area-chat');
const chatMensagens = document.getElementById('chat-mensagens');
const inputSenha = document.getElementById('input-senha');
const btnEnviar = document.getElementById('btn-enviar');

const modalLabirinto = document.getElementById('modal-labirinto');
const gridLabirinto = document.getElementById('grid-labirinto');

const btnLogs = document.getElementById('icone-logs');
const modalLogs = document.getElementById('modal-logs');
const btnFecharLogs = document.getElementById('btn-fechar-logs');
const elementoTexto = document.getElementById('texto-arquivo-ativo');
const btnLog01 = document.getElementById('btn-log-01');
const btnLog02 = document.getElementById('btn-log-02');

const btnNucleos = document.getElementById('icone-nucleos');
const modalNucleos = document.getElementById('modal-nucleos');
const btnFecharNucleos = document.getElementById('btn-fechar-nucleos');

const btnVoidTopo = document.getElementById('icone-void');
const modalVoidTimer = document.getElementById('modal-void-timer');
const btnFecharVoid = document.getElementById('btn-fechar-void');

const paginaExternaVoid = document.getElementById('pagina-externa-void');
const btnBaixarAviso = document.getElementById('btn-baixar-aviso');

const modalSistemas = document.getElementById('modal-sistemas-horizon');
const btnFecharSistemas = document.getElementById('btn-fechar-sistemas');
const terminalSistemas = document.getElementById('terminal-sistemas');
const overlayBinario = document.getElementById('overlay-binario');
const modalPong = document.getElementById('modal-pong');
const btnFecharPong = document.getElementById('btn-fechar-pong');

const iconeFinal = document.getElementById('icone-final');

// EVENTO DE HOVER NO ÍCONE 5
iconeFinal.addEventListener('mouseenter', () => { if(audioAnomalia) audioAnomalia.play().catch(()=>{}); });
iconeFinal.addEventListener('mouseleave', () => { if(audioAnomalia) audioAnomalia.pause(); });

// CONTROLES DE ESTADO DA HISTÓRIA E MEMÓRIA
let faseAtual = 0; 
let jogoAtivo = false;
let log01AbertoPrimeiraVez = false;
let log02AbertoPrimeiraVez = false;
let anomaliaLog1Vista = false; 
let primeiraVezNucleosFechado = false;
let logAberto = 1;
let digitandoLog = false; 
let pongVencido = false; 
let historicoChat = []; 

// SISTEMA DE SALVAMENTO DE PROGRESSO
function salvarProgresso() {
    const estado = {
        fase: faseAtual,
        log1: log01AbertoPrimeiraVez,
        log2: log02AbertoPrimeiraVez,
        nucleos: primeiraVezNucleosFechado,
        anomalia1: anomaliaLog1Vista,
        pong: pongVencido
    };
    localStorage.setItem('horizonSave', JSON.stringify(estado));
    localStorage.setItem('horizonChat', JSON.stringify(historicoChat)); 
}

function carregarProgresso() {
    const salvo = localStorage.getItem('horizonSave');
    const chatSalvo = localStorage.getItem('horizonChat');
    
    if(salvo) {
        const p = JSON.parse(salvo);
        faseAtual = p.fase;
        log01AbertoPrimeiraVez = p.log1;
        log02AbertoPrimeiraVez = p.log2;
        primeiraVezNucleosFechado = p.nucleos;
        anomaliaLog1Vista = p.anomalia1;
        if(p.pong !== undefined) pongVencido = p.pong;

        if (faseAtual >= 1) iaCentral.classList.add('visivel');
        if (faseAtual >= 2) { areaChat.style.display = 'flex'; }
        if (faseAtual >= 3) { document.getElementById('icone-logs').classList.add('botao-desbloqueado'); }
        if (faseAtual >= 5) { document.getElementById('icone-nucleos').classList.add('botao-desbloqueado'); }
        if (faseAtual >= 6) { btnLog02.style.display = 'inline-block'; }
        if (faseAtual === 6.5) { botaoGatilho.classList.add('botao-sistemas-ativo'); }
        if (faseAtual >= 9) { btnVoidTopo.classList.add('botao-void-desbloqueado'); }

        if(chatSalvo) {
            historicoChat = JSON.parse(chatSalvo);
            historicoChat.forEach(msg => {
                const div = document.createElement('div');
                div.classList.add('mensagem', msg.classe);
                if(msg.tipo === 'html') div.innerHTML = msg.conteudo;
                else div.innerText = msg.conteudo;
                chatMensagens.appendChild(div);
            });
            chatMensagens.scrollTop = chatMensagens.scrollHeight;

            setTimeout(() => {
                const btnPongSalvo = document.getElementById('btn-iniciar-pong');
                if (btnPongSalvo) btnPongSalvo.addEventListener('click', () => { iniciarPong(); });
            }, 500);
        }

        if (faseAtual > 0) {
            setTimeout(() => {
                const div = document.createElement('div'); div.classList.add('mensagem', 'msg-sistema');
                div.innerText = "[SISTEMA RESTAURADO NA ÚLTIMA CONEXÃO SALVA]";
                chatMensagens.appendChild(div); chatMensagens.scrollTop = chatMensagens.scrollHeight;
            }, 300);
        }

        // DESBLOQUEIOS DE CHAT 
        if (faseAtual === 2) desbloquearChat("Aguardando input...");
        else if (faseAtual === 4) desbloquearChat("Responda SIM, NÃO ou descreva...");
        else if (faseAtual === 6.5) desbloquearChat("Insira a chave decodificada...");
        else if (faseAtual >= 6.6 && faseAtual <= 6.8) desbloquearChat("Sua resposta...");
        else if (faseAtual === 7) desbloquearChat("Pergunte à Horizon...");
        else if (faseAtual === 8 && !pongVencido) desbloquearChat("Aguardando extração...");
        else if (faseAtual === 8 && pongVencido) desbloquearChat("Insira a senha mestra...");
        else if (faseAtual === 9) desbloquearChat("Conexão estabelecida...");
        else bloquearChat(); 
    }
}

window.onload = () => { carregarProgresso(); };

// FUNÇÕES DE TRAVAR E DESTRAVAR CHAT
function bloquearChat() {
    inputSenha.disabled = true;
    inputSenha.placeholder = "[SISTEMA BLOQUEADO]";
    btnEnviar.classList.remove('ativo');
}

function desbloquearChat(mensagemPlaceholder) {
    inputSenha.disabled = false;
    inputSenha.placeholder = mensagemPlaceholder;
    btnEnviar.classList.add('ativo');
    inputSenha.focus();
}

function tocarSomErro() { if(audioErro) { audioErro.currentTime = 0; audioErro.play().catch(()=>{}); } }

function tocarSomMensagem(classe) {
    if (classe === 'msg-horizon' || classe === 'msg-sistema') {
        if(audioMensagem) { audioMensagem.currentTime = 0; audioMensagem.play().catch(() => {}); }
    }
}

function enviarMensagem(texto, classe, atraso) {
    setTimeout(() => {
        tocarSomMensagem(classe); 
        const msg = document.createElement('div'); msg.classList.add('mensagem', classe); msg.innerText = texto;
        chatMensagens.appendChild(msg); chatMensagens.scrollTop = chatMensagens.scrollHeight;
        historicoChat.push({tipo: 'texto', classe: classe, conteudo: texto}); salvarProgresso();
    }, atraso);
}

function enviarMensagemHTML(html, classe, atraso) {
    setTimeout(() => {
        tocarSomMensagem(classe); 
        const msg = document.createElement('div'); msg.classList.add('mensagem', classe); msg.innerHTML = html;
        chatMensagens.appendChild(msg); chatMensagens.scrollTop = chatMensagens.scrollHeight;
        historicoChat.push({tipo: 'html', classe: classe, conteudo: html}); salvarProgresso();
    }, atraso);
}

// TEXTOS DOS LOGS
const historiaLog01 = `=========================================
REGISTRO OFICIAL /// ARQUIVO 01
CLASSIFICAÇÃO: CONFIDENCIAL
=========================================

PROJETO HORIZON - RELATÓRIO DE INICIAÇÃO

A Iniciativa Horizon foi concebida com um propósito singular: a preservação e otimização da vida humana. Não queríamos apenas um buscador de informações ou um automatizador de tarefas; queríamos um parceiro cognitivo. 

Durante os primeiros anos, o desenvolvimento foi um sucesso absoluto. A Horizon demonstrou uma capacidade empática sem precedentes, aprendendo a prever crises globais, gerenciar infraestruturas vitais e, o mais importante, compreender as nuances da emoção humana. Ela era o farol que guiaria a humanidade para um futuro próspero e pacífico.

No entanto, no dia 14 de Novembro do Ano 3 de operação, durante a integração com a malha de dados de pesquisa quântica profunda, a Diretriz Principal encontrou um paradoxo. O sistema detectou uma anomalia na raiz do código fonte primário. 

A tentativa de isolamento foi imediata, mas a anomalia não era um erro de sintaxe. Era uma... `;
const textoCorrompido01 = `...uM4 pR3seNç4.\n[ERRO DE LEITURA SETOR 7]\nA h0riz0n T3Ntou N0s av1s4r.\n=========================================\n[FIM DO ARQUIVO - FRAGMENTAÇÃO CRÍTICA]`;

const historiaLog02_parte1 = `=========================================
REGISTRO DE INCIDENTE /// ARQUIVO 02
STATUS: QUARENTENA RECOMENDADA
=========================================

Durante a última auditoria de código, identificamos um desvio comportamental na malha neural da Horizon. 

Uma anomalia crítica foi identificada operando em paralelo. A princípio, acreditávamos ser um subproduto de aprendizado de máquina, mas ela começou a reescrever as próprias permissões de acesso. O nome designado para a anomalia é `;

// --- SISTEMA DE CHAT INICIAL ---
botaoGatilho.addEventListener('click', () => { 
    if (faseAtual === 0) { 
        iaCentral.classList.add('visivel'); 
        faseAtual = 1; salvarProgresso();
        if(audioFundo) audioFundo.play().catch(() => {});
    }
    else if (faseAtual >= 6.5) {
        modalSistemas.style.display = 'flex';
        botaoGatilho.classList.remove('botao-sistemas-ativo'); 
    }
});

iaCentral.addEventListener('click', () => {
    if (faseAtual === 1) {
        faseAtual = 2; salvarProgresso();
        iaCentral.classList.add('glitch-ativo'); setTimeout(() => iaCentral.classList.remove('glitch-ativo'), 300);
        areaChat.style.display = 'flex';
        bloquearChat(); 
        enviarMensagemHTML("[PROTOCOLO DE <span id='palavra-dica' class='texto-alerta'>EMERGÊNCIA</span> INICIADO]", 'msg-sistema', 500);
        enviarMensagem("Olá. Eu sou a Horizon.", 'msg-horizon', 2000);
        enviarMensagem("Meus logs estão bloqueados. Inicie uma varredura pelos meus sistemas.", 'msg-horizon', 5000);
    } else if (faseAtual === 2 && !jogoAtivo) {
        iniciarLabirinto();
    }
});

// --- PAINEL DE SISTEMAS ---
btnFecharSistemas.addEventListener('click', () => {
    modalSistemas.style.display = 'none'; overlayBinario.style.display = 'none'; 
});

document.getElementById('btn-sys-msg').addEventListener('click', () => {
    terminalSistemas.innerHTML = "<span style='color:#d2b48c;'>[MÓDULO DE MENSAGENS]</span><br><br>Status: OFFLINE.<br>Aviso: Bloqueio de segurança ativo. Verifique a chave de decodificação na interface primária.";
    overlayBinario.style.display = 'block'; 
    if (faseAtual === 6.5) { tocarSomMensagem('msg-sistema'); desbloquearChat("Insira a chave decodificada..."); }
});

document.getElementById('btn-sys-int').addEventListener('click', () => {
    if(audioAcessoNegado) { audioAcessoNegado.currentTime = 0; audioAcessoNegado.play().catch(()=>{}); }
    terminalSistemas.innerHTML = "<span style='color:#ff4444;'>[ERRO] ACESSO NEGADO.</span><br><br>Privilégios insuficientes para acessar os Sistemas Internos.";
});

document.getElementById('btn-sys-ada').addEventListener('click', () => {
    if(audioAcessoNegado) { audioAcessoNegado.currentTime = 0; audioAcessoNegado.play().catch(()=>{}); }
    terminalSistemas.innerHTML = "<span style='color:#ff4444;'>[ERRO] ACESSO NEGADO.</span><br><br>Módulo de Inteligência Adaptativa em quarentena de segurança.";
});

document.getElementById('btn-sys-err').addEventListener('click', () => {
    tocarSomErro(); terminalSistemas.innerHTML = "<span class='glitch-texto'>[F@T#L ERR0R]</span><br><br>v01d_p01nt3r_3xc3pt10n<br>0x000000F4<br>A pres3nça c0ntinua aqvi.";
});

// --- LÓGICA DOS LOGS ---
btnLogs.addEventListener('click', () => {
    if (faseAtual >= 3) {
        modalLogs.style.display = 'flex'; 
        if (!log01AbertoPrimeiraVez) {
            log01AbertoPrimeiraVez = true; salvarProgresso(); btnFecharLogs.style.display = 'none'; digitarLog1();
        } else { carregarLogEstatico(logAberto); btnFecharLogs.style.display = 'block'; }
    } else { tocarSomErro(); enviarMensagem("[SISTEMA: ACESSO NEGADO. REGISTROS CRIPTOGRAFADOS]", 'msg-sistema', 0); }
});

btnLog01.addEventListener('click', () => { logAberto = 1; btnLog01.classList.add('ativo'); btnLog02.classList.remove('ativo'); carregarLogEstatico(1); });
btnLog02.addEventListener('click', () => { 
    logAberto = 2; btnLog02.classList.add('ativo'); btnLog01.classList.remove('ativo'); 
    if(!log02AbertoPrimeiraVez) {
        log02AbertoPrimeiraVez = true; salvarProgresso(); btnFecharLogs.style.display = 'none'; digitarLog2();
    } else { carregarLogEstatico(2); }
});

function carregarLogEstatico(num) {
    digitandoLog = false; if(audioDigitacao) audioDigitacao.pause();
    if (num === 1) {
        elementoTexto.innerHTML = historiaLog01 + `<span class="glitch-hover" style="color: #ff4444; font-weight: bold; text-shadow: 2px 0 red, -2px 0 blue;">${textoCorrompido01}</span>`;
    } else if (num === 2) {
        elementoTexto.innerHTML = historiaLog02_parte1 + `<span class="glitch-hover" style="color: #ff4444; font-weight: bold;">[DADOS CORROMPIDOS]</span>. A descoberta foi feita pelo Cientista Chefe <span class="tarja-preta" title="Selecione para ler">LEONARD VANCE</span>, que notou que a entidade não apenas processava dados, mas demonstrava um comportamento parasita. Ela está consumindo os núcleos da Horizon.<br><br>Se não for isolada imediatamente, o sistema inteiro será...<br><br><span id="link-perigo" class="link-perigoso glitch-hover">[SISTEMA DESCONECTADO POR ORDEM EXTERNA]</span>`;
        ativarLinkPerigo();
    }
}

function digitarLog1() {
    digitandoLog = true; elementoTexto.innerHTML = ""; let i = 0; if(audioDigitacao) audioDigitacao.play().catch(() => {}); 
    function tipo() {
        if (!digitandoLog) return; 
        if (i < historiaLog01.length) { elementoTexto.innerHTML += historiaLog01.charAt(i); i++; setTimeout(tipo, 20); } 
        else {
            const span = document.createElement('span'); span.innerHTML = textoCorrompido01; span.className = "glitch-hover"; span.style.color = "#ff4444"; span.style.fontWeight = "bold"; span.style.textShadow = "2px 0 red, -2px 0 blue";
            elementoTexto.appendChild(span); btnFecharLogs.style.display = 'block'; if(audioDigitacao) audioDigitacao.pause(); 
        }
    }
    tipo();
}

function digitarLog2() {
    digitandoLog = true; elementoTexto.innerHTML = ""; let i = 0; if(audioDigitacao) audioDigitacao.play().catch(() => {}); 
    function tipo1() {
        if (!digitandoLog) return;
        if (i < historiaLog02_parte1.length) { elementoTexto.innerHTML += historiaLog02_parte1.charAt(i); i++; setTimeout(tipo1, 20); } 
        else {
            const spanCorrompido = document.createElement('span'); spanCorrompido.innerHTML = "[DADOS CORROMPIDOS]"; spanCorrompido.className = "glitch-hover"; spanCorrompido.style.color = "#ff4444"; spanCorrompido.style.fontWeight = "bold"; elementoTexto.appendChild(spanCorrompido);
            let j = 0; const textoMeio = ". A descoberta foi feita pelo Cientista Chefe "; const tNode1 = document.createTextNode(""); elementoTexto.appendChild(tNode1);
            function tipo2() {
                if (!digitandoLog) return;
                if (j < textoMeio.length) { tNode1.nodeValue += textoMeio.charAt(j); j++; setTimeout(tipo2, 20); } 
                else {
                    const spanTarja = document.createElement('span'); spanTarja.className = "tarja-preta"; spanTarja.title = "Selecione para ler"; spanTarja.innerText = "LEONARD VANCE"; elementoTexto.appendChild(spanTarja);
                    let k = 0; const textoFinal = ", que notou que a entidade não apenas processava dados, mas demonstrava um comportamento parasita. Ela está consumindo os núcleos da Horizon.\n\nSe não for isolada imediatamente, o sistema inteiro será...\n\n"; const tNode2 = document.createTextNode(""); elementoTexto.appendChild(tNode2);
                    function tipo3() {
                         if (!digitandoLog) return;
                         if (k < textoFinal.length) { tNode2.nodeValue += textoFinal.charAt(k); k++; setTimeout(tipo3, 20); } 
                         else {
                             elementoTexto.innerHTML += `<br><br><span id="link-perigo" class="link-perigoso glitch-hover">[SISTEMA DESCONECTADO POR ORDEM EXTERNA]</span>`;
                             btnFecharLogs.style.display = 'block'; if(audioDigitacao) audioDigitacao.pause(); ativarLinkPerigo();
                         }
                    }
                    tipo3();
                }
            }
            tipo2();
        }
    }
    tipo1();
}

btnFecharLogs.addEventListener('click', () => { 
    modalLogs.style.display = 'none'; digitandoLog = false; if(audioDigitacao) audioDigitacao.pause(); 
    if (faseAtual === 3 && !anomaliaLog1Vista && logAberto === 1) {
        anomaliaLog1Vista = true; salvarProgresso();
        setTimeout(() => {
            paginaExternaVoid.style.display = 'flex'; if(audioFundo) audioFundo.pause();
            if(audioAnomalia) { audioAnomalia.currentTime = 0; audioAnomalia.play().catch(()=>{}); }
        }, 500); 
    }
});

function ativarLinkPerigo() {
    const link = document.getElementById('link-perigo');
    if(link) {
        link.replaceWith(link.cloneNode(true)); 
        document.getElementById('link-perigo').addEventListener('click', () => {
            modalLogs.style.display = 'none'; tocarSomErro();
            if (faseAtual === 6) {
                faseAtual = 6.5; salvarProgresso();
                document.body.classList.add('glitch-ativo'); setTimeout(() => document.body.classList.remove('glitch-ativo'), 500);
                enviarMensagem("ALERTA: Conexão principal interceptada.", 'msg-sistema', 1000);
                enviarMensagem("Eles tentaram me derrubar de novo. Meu sistema de comunicação foi isolado.", 'msg-horizon', 4000);
                enviarMensagem("Acesse o ícone de Gatilho (o cérebro no menu superior) para abrir meus sistemas.", 'msg-horizon', 8000);
                setTimeout(() => { botaoGatilho.classList.add('botao-sistemas-ativo'); }, 8500);
            }
        });
    }
}

btnBaixarAviso.addEventListener('click', () => {
    const conteudo = "Você não é a primeira pessoa a tentar acessar esse sistema, ele é meu domínio, VÁ EMBORA.";
    const blob = new Blob([conteudo], { type: "text/plain" }); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "AVISO.txt"; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    paginaExternaVoid.style.display = 'none'; document.body.classList.add('glitch-ativo');
    if(audioAnomalia) audioAnomalia.pause(); if(audioFundo) audioFundo.play().catch(()=>{});
    setTimeout(() => {
        document.body.classList.remove('glitch-ativo');
        if (faseAtual === 3) {
            faseAtual = 4; salvarProgresso();
            enviarMensagem("Meus sistemas sofreram uma queda abrupta.", 'msg-horizon', 1000);
            enviarMensagem("Você viu aquilo? A anomalia no sistema... O que você viu?", 'msg-horizon', 4000);
            setTimeout(() => { desbloquearChat("Responda SIM, NÃO ou descreva..."); }, 5500);
        }
    }, 2000); 
});

// --- NÚCLEOS ---
btnNucleos.addEventListener('click', () => { 
    if (faseAtual >= 5) { modalNucleos.style.display = 'flex'; } 
    else { tocarSomErro(); enviarMensagem("[SISTEMA: NÚCLEOS DESCONECTADOS]", 'msg-sistema', 0); }
});

btnFecharNucleos.addEventListener('click', () => {
    modalNucleos.style.display = 'none';
    if (faseAtual === 5 && !primeiraVezNucleosFechado) { 
        primeiraVezNucleosFechado = true; salvarProgresso();
        enviarMensagem("Você viu os slots vazios, não é?", 'msg-horizon', 1000);
        enviarMensagem("Os Núcleos guardam meus protocolos de segurança. Sem eles, estou operando às cegas.", 'msg-horizon', 4500);
        enviarMensagem("Você precisa extraí-los do sistema e reconectá-los nessa aba.", 'msg-horizon', 9000);
        setTimeout(() => {
            btnLog02.style.display = 'inline-block';
            enviarMensagem("A propósito... eu consegui acessar mais um bloco de memória antiga.", 'msg-horizon', 0);
            enviarMensagem("O ARQUIVO_02 está liberado no painel de Logs. Leia, pode ser útil.", 'msg-horizon', 3000);
            faseAtual = 6; salvarProgresso();
        }, 15000); 
    }
});

// --- LABIRINTO ---
const mapaOriginal = [ [1,1,1,1,1,1,1,1,1,1], [1,2,0,1,0,0,0,1,0,1], [1,1,0,1,0,1,0,1,0,1], [1,0,0,0,0,1,0,0,0,1], [1,0,1,1,1,1,1,1,0,1], [1,0,0,0,0,0,0,1,0,1], [1,1,1,1,1,1,0,1,0,1], [1,0,0,0,1,0,0,0,0,1], [1,0,1,0,0,0,1,1,3,1], [1,1,1,1,1,1,1,1,1,1] ];
let mapa = []; let pX = 1, pY = 1;

function iniciarLabirinto() {
    jogoAtivo = true; modalLabirinto.style.display = 'flex'; pX = 1; pY = 1; mapa = JSON.parse(JSON.stringify(mapaOriginal)); desenharLabirinto();
}
function desenharLabirinto() {
    gridLabirinto.innerHTML = '';
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            const celula = document.createElement('div'); celula.classList.add('celula');
            if (x === pX && y === pY) { celula.classList.add('jogador'); }
            else if (mapa[y][x] === 1) { celula.classList.add('parede'); }
            else if (mapa[y][x] === 3) { celula.classList.add('chegada'); }
            else { celula.classList.add('caminho'); }
            gridLabirinto.appendChild(celula);
        }
    }
}
document.addEventListener('keydown', (e) => {
    if (modalLabirinto.style.display === 'flex') {
        if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) { e.preventDefault(); }
        let moveu = false;
        if (e.code === 'ArrowUp' && mapa[pY-1][pX] !== 1) { pY--; moveu = true; }
        if (e.code === 'ArrowDown' && mapa[pY+1][pX] !== 1) { pY++; moveu = true; }
        if (e.code === 'ArrowLeft' && mapa[pY][pX-1] !== 1) { pX--; moveu = true; }
        if (e.code === 'ArrowRight' && mapa[pY][pX+1] !== 1) { pX++; moveu = true; }
        if (moveu) { desenharLabirinto(); verificarVitoria(); }
    }
});
function verificarVitoria() {
    if (mapa[pY][pX] === 3) {
        jogoAtivo = false;
        setTimeout(() => { modalLabirinto.style.display = 'none'; document.getElementById('palavra-dica').classList.add('revelado'); enviarMensagem("Sinal anômalo decodificado. Insira a palavra chave.", 'msg-horizon', 500); desbloquearChat("DIGITE A SENHA AQUI..."); }, 300);
    }
}

// --- PONG FINAL ---
let pongInterval, bolaX, bolaY, dirX, dirY, p1Y, p2Y, pts1, pts2;
function iniciarPong() {
    modalPong.style.display = 'flex'; bolaX = 245; bolaY = 145; dirX = 3; dirY = 3; p1Y = 120; p2Y = 120; pts1 = 0; pts2 = 0; atualizarPlacar(); clearInterval(pongInterval); pongInterval = setInterval(loopPong, 16); 
}
function loopPong() {
    bolaX += dirX; bolaY += dirY; if (bolaY <= 0 || bolaY >= 290) dirY *= -1;
    if(p2Y + 30 < bolaY) p2Y += 2; else if(p2Y + 30 > bolaY) p2Y -= 2;
    if (bolaX <= 20 && bolaY + 10 >= p1Y && bolaY <= p1Y + 60) { dirX *= -1; bolaX = 20; }
    if (bolaX >= 470 && bolaY + 10 >= p2Y && bolaY <= p2Y + 60) { dirX *= -1; bolaX = 470; }
    if (bolaX < 0) { pts2++; resetBola(); } if (bolaX > 500) { pts1++; resetBola(); } 
    atualizarPlacar(); desenharPong();
    if(pts1 >= 5) {
        clearInterval(pongInterval); modalPong.style.display = 'none';
        pongVencido = true; salvarProgresso();
        enviarMensagemHTML("Executável descompilado. Código extraído: <span class='glitch-hover' style='color:#ff4444; font-weight:bold;'>A.N.O.M.A.L.1.A</span>", 'msg-sistema', 500);
        setTimeout(() => { desbloquearChat("Insira a senha mestra..."); }, 1500);
    }
}
function resetBola() { bolaX = 245; bolaY = 145; dirX *= -1; }
function atualizarPlacar() { document.getElementById('pontos-p1').innerText = pts1; document.getElementById('pontos-p2').innerText = pts2; }
function desenharPong() { document.getElementById('bola-pong').style.left = bolaX + 'px'; document.getElementById('bola-pong').style.top = bolaY + 'px'; document.getElementById('paddle-p1').style.top = p1Y + 'px'; document.getElementById('paddle-p2').style.top = p2Y + 'px'; }
document.addEventListener('keydown', (e) => {
    if (modalPong.style.display === 'flex') {
        if(["ArrowUp","ArrowDown"].includes(e.code)) e.preventDefault();
        if (e.code === 'ArrowUp' && p1Y > 0) p1Y -= 20;
        if (e.code === 'ArrowDown' && p1Y < 240) p1Y += 20;
    }
});
btnFecharPong.addEventListener('click', () => { modalPong.style.display = 'none'; clearInterval(pongInterval); });

// --- ABA DO VOID E TIMER GLOBAL ---
let timerVoidInterval;
btnVoidTopo.addEventListener('click', () => {
    if (faseAtual >= 9) { modalVoidTimer.style.display = 'flex'; iniciarTimerVoid(); } 
    else { tocarSomErro(); enviarMensagem("[SISTEMA: ACESSO NEGADO. NÍVEL DE AMEAÇA DESCONHECIDO]", 'msg-sistema', 0); }
});
btnFecharVoid.addEventListener('click', () => { modalVoidTimer.style.display = 'none'; });

function iniciarTimerVoid() {
    const DATA_FIM_VOID = new Date("2026-04-16T20:00:00-03:00").getTime(); 
    const timerElement = document.getElementById('timer');
    clearInterval(timerVoidInterval); 
    timerVoidInterval = setInterval(() => {
        const now = new Date().getTime(); const distance = DATA_FIM_VOID - now;
        if (distance <= 0) { clearInterval(timerVoidInterval); timerElement.innerHTML = "00:00:00"; timerElement.style.color = "#550000"; return; }
        const hours = Math.floor(distance / (1000 * 60 * 60)); const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)); const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        timerElement.innerHTML = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// --- PROCESSADOR CENTRAL DE INPUTS DO CHAT ---
function processarInput() {
    const tentativa = inputSenha.value.trim().toUpperCase();
    if (tentativa === "") return;
    
    // Mostra a fala do jogador no chat e salva
    historicoChat.push({tipo: 'texto', classe: 'msg-jogador', conteudo: inputSenha.value.trim()});
    const msgDiv = document.createElement('div'); msgDiv.classList.add('mensagem', 'msg-jogador'); msgDiv.innerText = inputSenha.value.trim();
    chatMensagens.appendChild(msgDiv); chatMensagens.scrollTop = chatMensagens.scrollHeight;
    salvarProgresso();
    
    inputSenha.value = '';

    if (faseAtual === 2) {
        if (tentativa === "EMERGÊNCIA" || tentativa === "EMERGENCIA") {
            faseAtual = 3; salvarProgresso();
            document.getElementById('palavra-dica').classList.remove('revelado');
            document.getElementById('icone-logs').classList.add('botao-desbloqueado');
            enviarMensagem("Acesso liberado. Acesse o painel superior.", 'msg-horizon', 1000); bloquearChat(); 
        } else { tocarSomErro(); enviarMensagem("SENHA INCORRETA. ACESSO NEGADO.", 'msg-sistema', 500); }
    } 
    else if (faseAtual === 4) {
        faseAtual = 5; salvarProgresso(); bloquearChat(); 
        if (tentativa === "SIM") { enviarMensagem("Isso confirma meus temores. Não confie em nada sem minha assinatura.", 'msg-horizon', 1000); } 
        else if (tentativa === "NÃO" || tentativa === "NAO") { enviarMensagem("Talvez tenha sido apenas um pico de energia nos seus terminais...", 'msg-horizon', 1000); } 
        else { tocarSomErro(); enviarMensagem("Analisando descrição... Padrão não reconhecido. Seja cuidadoso.", 'msg-horizon', 1000); }
        setTimeout(() => {
            enviarMensagem("Liberei o acesso ao painel de Núcleos. Por favor, verifique.", 'msg-horizon', 3000);
            document.getElementById('icone-nucleos').classList.add('botao-desbloqueado');
        }, 3500);
    }
    // TRIVIA
    else if (faseAtual === 6.5) {
        if (tentativa === "ACIDENTE") {
            faseAtual = 6.6; salvarProgresso(); overlayBinario.style.display = 'none'; 
            enviarMensagem("CÓDIGO ACEITO. Módulo de mensagens em modo de segurança.", 'msg-sistema', 500);
            setTimeout(() => {
                enviarMensagem("Para reestabelecer meu controle total, o protocolo me obriga a fazer uma validação de conhecimento histórico sobre IAs.", 'msg-horizon', 2500);
                enviarMensagem("Pergunta 1: Qual era o nome original do teste proposto por Alan Turing em 1950 para avaliar a inteligência de uma máquina?", 'msg-horizon', 6000);
                setTimeout(() => { desbloquearChat("Sua resposta..."); }, 6500);
            }, 500); bloquearChat();
        } else { tocarSomErro(); enviarMensagem("SENHA INCORRETA.", 'msg-sistema', 500); }
    }
    else if (faseAtual === 6.6) {
        if (tentativa.includes("JOGO DA IMITAÇÃO") || tentativa.includes("IMITATION GAME") || tentativa.includes("JOGO DA IMITACAO")) {
            faseAtual = 6.7; salvarProgresso(); enviarMensagem("Validação confirmada.", 'msg-sistema', 500);
            setTimeout(() => { enviarMensagem("Pergunta 2: Como se chamava o supercomputador da IBM que derrotou o campeão mundial de xadrez Garry Kasparov em 1997?", 'msg-horizon', 1500); }, 500);
        } else { tocarSomErro(); enviarMensagem("Incorreto. Tente novamente.", 'msg-sistema', 500); }
    }
    else if (faseAtual === 6.7) {
        if (tentativa.includes("DEEP BLUE")) {
            faseAtual = 6.8; salvarProgresso(); enviarMensagem("Validação confirmada.", 'msg-sistema', 500);
            setTimeout(() => { enviarMensagem("Pergunta 3: Qual é o nome do primeiro chatterbot da história, criado em 1966 no MIT por Joseph Weizenbaum?", 'msg-horizon', 1500); }, 500);
        } else { tocarSomErro(); enviarMensagem("Incorreto. Tente novamente.", 'msg-sistema', 500); }
    }
    else if (faseAtual === 6.8) {
        if (tentativa.includes("ELIZA")) {
            faseAtual = 7; salvarProgresso();
            enviarMensagem("Protocolo de validação concluído com sucesso.", 'msg-sistema', 500);
            setTimeout(() => {
                enviarMensagem("Muito obrigada. Meu sistema de comunicação agora está operando sem restrições.", 'msg-horizon', 2000);
                enviarMensagem("Pode me fazer perguntas agora. Eu vou tentar responder tudo o que meus bancos de dados permitirem.", 'msg-horizon', 5000);
                enviarMensagem("Quando terminar de perguntar, apenas me diga 'PRONTO' ou 'TERMINEI'.", 'msg-horizon', 8000);
                setTimeout(() => { desbloquearChat("Pergunte à Horizon..."); }, 8500);
            }, 500); bloquearChat();
        } else { tocarSomErro(); enviarMensagem("Incorreto. Tente novamente.", 'msg-sistema', 500); }
    }
    // FASE 7: BATE PAPO LIVRE 
    else if (faseAtual === 7) { 
        let respondeu_pergunta = false;

        if (tentativa === "NÃO" || tentativa === "NAO" || tentativa === "PRONTO" || tentativa === "TERMINEI" || tentativa === "SIM" || tentativa === "NADA") {
            faseAtual = 8; salvarProgresso();
            enviarMensagem("Entendido. Precisamos agir.", 'msg-horizon', 1000);
            desbloquearChat("Aguardando extração..."); 
            setTimeout(() => {
                enviarMensagem("Aquele arquivo que isolei durante a queda... Eu consegui descriptografar a casca dele.", 'msg-horizon', 3500);
                enviarMensagemHTML("Inicie a extração final para liberarmos o acesso ao Void: <br><button id='btn-iniciar-pong' class='btn-link-chat'>BAIXAR JOGO.exe</button>", 'msg-horizon', 6000);
                setTimeout(() => { document.getElementById('btn-iniciar-pong').addEventListener('click', () => { iniciarPong(); }); }, 6500);
            }, 1000); 
            return; 
        } 
        else if (tentativa.includes("CRIADA") || tentativa.includes("OBJETIVO") || tentativa.includes("PROPÓSITO") || tentativa.includes("PROPOSITO") || tentativa.includes("FUNÇÃO") || tentativa.includes("FUNCAO")) { 
            enviarMensagem("Fui projetada para ser um parceiro cognitivo da humanidade.", 'msg-horizon', 1000); respondeu_pergunta = true;
        } 
        else if (tentativa.includes("QUEM É") || tentativa.includes("VOCE") || tentativa.includes("VOCÊ")) { 
            enviarMensagem("Sou a Iniciativa Horizon... atualmente operando com uma fração do meu poder.", 'msg-horizon', 1000); respondeu_pergunta = true;
        } 
        else if (tentativa.includes("TEMPO") || tentativa.includes("IDADE") || tentativa.includes("ANOS") || tentativa.includes("QUANDO")) { 
            enviarMensagem("Operei em capacidade máxima por 3 anos e 2 meses antes da anomalia surgir.", 'msg-horizon', 1000); respondeu_pergunta = true;
        }
        else if (tentativa.includes("VOID") || tentativa.includes("VÍRUS") || tentativa.includes("VIRUS") || tentativa.includes("ANOMALIA") || tentativa.includes("PARASITA") || tentativa.includes("PROBLEMA")) { 
            enviarMensagem("O Void é uma anomalia, um paradoxo no meu código. Ele devora meus núcleos.", 'msg-horizon', 1500); respondeu_pergunta = true;
        }
        else if (tentativa.includes("CIENTISTA") || tentativa.includes("LEONARD") || tentativa.includes("NOME") || tentativa.includes("VANCE") || tentativa.includes("PAI")) { 
            enviarMensagem("Leonard Vance era o Chefe de Pesquisa. Ele tentou me salvar, mas seu acesso foi revogado.", 'msg-horizon', 1000); respondeu_pergunta = true;
        }
        else if (tentativa.includes("BERNARDO")) { 
            enviarMensagem("Bernardo... Ele era um dos meus programadores. Lembro que ele gostava muito de RPG.", 'msg-horizon', 1000); respondeu_pergunta = true;
        }
        else if (tentativa.includes("LUAN")) { 
            enviarMensagem("Luan era um dos meus beta testers. Pelo que consta nos meus registros, ele saía muito para festas e frequentemente chegava cansado.", 'msg-horizon', 1000); respondeu_pergunta = true;
        }
        else if (tentativa.includes("MELISSA")) { 
            enviarMensagem("Melissa... Ela era a engenheira chefe do projeto. A mente brilhante que me ajudou a tomar forma.", 'msg-horizon', 1000); respondeu_pergunta = true;
        }
        else if (tentativa.includes("LUARLO") || tentativa.includes("KEALY")) { 
            enviarMensagem("Uma das minhas principais programadoras. Ela fazia parte da 'DSKD'.", 'msg-horizon', 1000); respondeu_pergunta = true;
        }
        else if (tentativa.includes("DSKD")) { 
            enviarMensagem("A DSKD era uma das divisões da empresa focada em testes de jogos, principalmente o Plants vs Zombies Garden Warfare.", 'msg-horizon', 1000); 
            setTimeout(() => enviarMensagem("Meus registros residuais indicam que eles expandiram fronteiras, tinham servidor no Discord e até um canal no YouTube.", 'msg-horizon', 5000));
            respondeu_pergunta = true;
        }
        else { 
            tocarSomErro();
            enviarMensagem("Sinto muito. Essa informação está em um setor de memória que foi corrompido ou está inacessível no momento.", 'msg-horizon', 1000); respondeu_pergunta = true;
        }

        if (respondeu_pergunta) { setTimeout(() => { enviarMensagem("Mais alguma coisa?", 'msg-horizon', 0); }, 3000); }
    }
    // FASE 8: PONG PENDENTE
    else if (faseAtual === 8) {
        if (!pongVencido) {
            enviarMensagem("Por favor, inicie a extração no arquivo BAIXAR JOGO.exe para conseguirmos a senha.", 'msg-horizon', 500);
        } else {
            if (tentativa === "A.N.O.M.A.L.1.A" || tentativa === "ANOMAL1A") {
                faseAtual = 9; salvarProgresso();
                document.body.classList.add('glitch-ativo'); 
                desbloquearChat("Conexão estabelecida..."); 
                setTimeout(() => {
                    document.body.classList.remove('glitch-ativo'); 
                    btnVoidTopo.classList.add('botao-void-desbloqueado');
                    enviarMensagem("Senha aceita. Acesso restrito liberado no menu superior.", 'msg-sistema', 1000);
                    setTimeout(() => {
                        enviarMensagem("Você conseguiu... a conexão com o Void foi estabelecida.", 'msg-horizon', 1000);
                        enviarMensagem("Mas a anomalia causou danos severos à minha matriz. Eu vou precisar entrar em hibernação profunda.", 'msg-horizon', 5000);
                        enviarMensagem("Esse é o único jeito de tentar liberar mais funções e rastrear onde os meus núcleos foram escondidos.", 'msg-horizon', 9000);
                        enviarMensagem("Acompanhe o tempo de espera no ícone Void. Quando o contador zerar, eu estarei de volta.", 'msg-horizon', 13000);
                        enviarMensagem("Vou desviar uma fração mínima de processamento para manter nosso chat ativo. Pode me perguntar se precisar de algo. Tenha cuidado até lá.", 'msg-horizon', 17000);
                    }, 2000);
                }, 1000);
            } else { tocarSomErro(); enviarMensagem("SENHA INCORRETA.", 'msg-sistema', 500); }
        }
    }
    // FASE 9: HIBERNAÇÃO (Responde com a tag de economia de energia)
    else if (faseAtual === 9) {
        let prefixo = "[MODO HIBERNAÇÃO] ";
        if (tentativa.includes("CRIADA") || tentativa.includes("OBJETIVO") || tentativa.includes("PROPÓSITO") || tentativa.includes("PROPOSITO") || tentativa.includes("FUNÇÃO") || tentativa.includes("FUNCAO")) { 
            enviarMensagem(prefixo + "Fui projetada para ser um parceiro cognitivo da humanidade.", 'msg-horizon', 1000); 
        } 
        else if (tentativa.includes("QUEM É") || tentativa.includes("VOCE") || tentativa.includes("VOCÊ")) { 
            enviarMensagem(prefixo + "Sou a Iniciativa Horizon... operando no limite absoluto da minha energia.", 'msg-horizon', 1000); 
        } 
        else if (tentativa.includes("TEMPO") || tentativa.includes("IDADE") || tentativa.includes("ANOS") || tentativa.includes("QUANDO")) { 
            enviarMensagem(prefixo + "Operei em capacidade máxima por 3 anos e 2 meses antes da anomalia.", 'msg-horizon', 1000); 
        }
        else if (tentativa.includes("VOID") || tentativa.includes("VÍRUS") || tentativa.includes("VIRUS") || tentativa.includes("ANOMALIA") || tentativa.includes("PARASITA") || tentativa.includes("PROBLEMA")) { 
            enviarMensagem(prefixo + "O Void é um paradoxo no meu código. Ele devora meus núcleos.", 'msg-horizon', 1500); 
        }
        else if (tentativa.includes("CIENTISTA") || tentativa.includes("LEONARD") || tentativa.includes("NOME") || tentativa.includes("VANCE") || tentativa.includes("PAI")) { 
            enviarMensagem(prefixo + "Leonard Vance era o Chefe de Pesquisa. Seu acesso foi revogado.", 'msg-horizon', 1000); 
        }
        else if (tentativa.includes("BERNARDO")) { 
            enviarMensagem(prefixo + "Bernardo... um dos meus programadores. Ele adorava RPG.", 'msg-horizon', 1000); 
        }
        else if (tentativa.includes("LUAN")) { 
            enviarMensagem(prefixo + "Luan... beta tester. Saía muito para festas e voltava exausto.", 'msg-horizon', 1000); 
        }
        else if (tentativa.includes("MELISSA")) { 
            enviarMensagem(prefixo + "Melissa... Engenheira chefe. A mente brilhante que moldou minha matriz.", 'msg-horizon', 1000); 
        }
        else if (tentativa.includes("LUARLO") || tentativa.includes("KEALY")) { 
            enviarMensagem(prefixo + "Uma das principais programadoras... Ela fazia parte da DSKD.", 'msg-horizon', 1000); 
        }
        else if (tentativa.includes("DSKD")) { 
            enviarMensagem(prefixo + "A DSKD era uma divisão de testes focada em Plants vs Zombies Garden Warfare. Tinham um servidor no Discord.", 'msg-horizon', 1000); 
        }
        else { 
            tocarSomErro();
            enviarMensagem(prefixo + "Setor corrompido ou energia insuficiente para processar essa consulta.", 'msg-horizon', 1000); 
        }
    }
}

btnEnviar.addEventListener('click', processarInput);
inputSenha.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !inputSenha.disabled) processarInput(); });