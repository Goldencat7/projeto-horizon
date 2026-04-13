// SISTEMA DE LOGIN INICIAL
const telaLogin = document.getElementById('tela-login');
const inputLogin = document.getElementById('input-login');
const erroLogin = document.getElementById('erro-login');

// Chaves permitidas (Decodificadas)
const chavesPermitidas = ["BETA-77", "DICE-20", "DSKD-ROOT", "ANOM-SYNC", "HORIZON-ADMIN"];

if (localStorage.getItem('horizonSave')) {
    telaLogin.style.display = 'none';
}

inputLogin.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const valor = inputLogin.value.trim().toUpperCase();
        if (chavesPermitidas.includes(valor)) {
            telaLogin.style.display = 'none';
            if(audioFundo) audioFundo.play().catch(()=>{});
        } else {
            tocarSomErro();
            erroLogin.style.display = 'block';
            inputLogin.value = '';
        }
    }
});

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
const modalLogs = document.getElementById('modal-logs');
const elementoTexto = document.getElementById('texto-arquivo-ativo');
const modalNucleos = document.getElementById('modal-nucleos');
const modalVoidTimer = document.getElementById('modal-void-timer');
const modalSistemas = document.getElementById('modal-sistemas-horizon');
const overlayBinario = document.getElementById('overlay-binario');
const modalPong = document.getElementById('modal-pong');
const paginaExternaVoid = document.getElementById('pagina-externa-void');
// CONTROLES DE TOQUE PARA O LABIRINTO
const botoesSeta = {
    'btn-up': [0, -1],
    'btn-down': [0, 1],
    'btn-left': [-1, 0],
    'btn-right': [1, 0]
};

Object.keys(botoesSeta).forEach(id => {
    const btn = document.getElementById(id);
    if(btn) {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Impede o scroll da tela ao jogar
            const [dx, dy] = botoesSeta[id];
            moverLabirinto(dx, dy);
        });
        // Mantém o clique do mouse para testes no PC
        btn.addEventListener('click', () => moverLabirinto(...botoesSeta[id]));
    }
});

const iconeFinal = document.getElementById('icone-final');
iconeFinal.addEventListener('mouseenter', () => { if(audioAnomalia) audioAnomalia.play().catch(()=>{}); });
iconeFinal.addEventListener('mouseleave', () => { if(audioAnomalia) audioAnomalia.pause(); });

// CONTROLES DE ESTADO DA HISTÓRIA
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

// SALVAMENTO DE PROGRESSO
function salvarProgresso() {
    const estado = {
        fase: faseAtual, log1: log01AbertoPrimeiraVez, log2: log02AbertoPrimeiraVez,
        nucleos: primeiraVezNucleosFechado, anomalia1: anomaliaLog1Vista, pong: pongVencido
    };
    localStorage.setItem('horizonSave', JSON.stringify(estado));
    localStorage.setItem('horizonChat', JSON.stringify(historicoChat)); 
}

function carregarProgresso() {
    const salvo = localStorage.getItem('horizonSave');
    const chatSalvo = localStorage.getItem('horizonChat');
    
    if(salvo) {
        const p = JSON.parse(salvo);
        faseAtual = p.fase; log01AbertoPrimeiraVez = p.log1; log02AbertoPrimeiraVez = p.log2;
        primeiraVezNucleosFechado = p.nucleos; anomaliaLog1Vista = p.anomalia1;
        if(p.pong !== undefined) pongVencido = p.pong;

        if (faseAtual >= 1) iaCentral.classList.add('visivel');
        if (faseAtual >= 2) { areaChat.style.display = 'flex'; }
        if (faseAtual >= 3) { document.getElementById('icone-logs').classList.add('botao-desbloqueado'); }
        if (faseAtual >= 5) { document.getElementById('icone-nucleos').classList.add('botao-desbloqueado'); }
        if (faseAtual >= 6) { document.getElementById('btn-log-02').style.display = 'inline-block'; }
        if (faseAtual === 6.5) { botaoGatilho.classList.add('botao-sistemas-ativo'); }
        if (faseAtual >= 9) { document.getElementById('icone-void').classList.add('botao-void-desbloqueado'); }

        if(chatSalvo) {
            historicoChat = JSON.parse(chatSalvo);
            historicoChat.forEach(msg => {
                const div = document.createElement('div');
                div.classList.add('mensagem', msg.classe);
                if(msg.tipo === 'html') div.innerHTML = msg.conteudo; else div.innerText = msg.conteudo;
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

        // DESBLOQUEIOS
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

// FUNÇÕES CHAT
function bloquearChat() { inputSenha.disabled = true; inputSenha.placeholder = "[SISTEMA BLOQUEADO]"; btnEnviar.classList.remove('ativo'); }
function desbloquearChat(txt) { inputSenha.disabled = false; inputSenha.placeholder = txt; btnEnviar.classList.add('ativo'); }
function tocarSomErro() { if(audioErro) { audioErro.currentTime = 0; audioErro.play().catch(()=>{}); } }
function tocarSomMensagem(classe) { if (classe === 'msg-horizon' || classe === 'msg-sistema') { if(audioMensagem) { audioMensagem.currentTime = 0; audioMensagem.play().catch(() => {}); } } }

function enviarMensagem(texto, classe, atraso) {
    setTimeout(() => {
        tocarSomMensagem(classe); const msg = document.createElement('div'); msg.classList.add('mensagem', classe); msg.innerText = texto;
        chatMensagens.appendChild(msg); chatMensagens.scrollTop = chatMensagens.scrollHeight;
        historicoChat.push({tipo: 'texto', classe: classe, conteudo: texto}); salvarProgresso();
    }, atraso);
}
function enviarMensagemHTML(html, classe, atraso) {
    setTimeout(() => {
        tocarSomMensagem(classe); const msg = document.createElement('div'); msg.classList.add('mensagem', classe); msg.innerHTML = html;
        chatMensagens.appendChild(msg); chatMensagens.scrollTop = chatMensagens.scrollHeight;
        historicoChat.push({tipo: 'html', classe: classe, conteudo: html}); salvarProgresso();
    }, atraso);
}

// LOGS
const historiaLog01 = `PROJETO HORIZON - RELATÓRIO DE INICIAÇÃO\n\nA Iniciativa Horizon foi concebida com um propósito singular: a preservação e otimização da vida humana...`;
const textoCorrompido01 = `...uM4 pR3seNç4.\n[ERRO DE LEITURA SETOR 7]\nA h0riz0n T3Ntou N0s av1s4r.`;
const historiaLog02_parte1 = `REGISTRO DE INCIDENTE /// ARQUIVO 02\n\nUma anomalia crítica foi identificada operando em paralelo. O nome designado para a anomalia é `;

// SISTEMA INICIAL
botaoGatilho.addEventListener('click', () => { 
    if (faseAtual === 0) { iaCentral.classList.add('visivel'); faseAtual = 1; salvarProgresso(); if(audioFundo) audioFundo.play().catch(() => {}); }
    else if (faseAtual >= 6.5) { modalSistemas.style.display = 'flex'; botaoGatilho.classList.remove('botao-sistemas-ativo'); }
});

iaCentral.addEventListener('click', () => {
    if (faseAtual === 1) {
        faseAtual = 2; salvarProgresso(); iaCentral.classList.add('glitch-ativo'); setTimeout(() => iaCentral.classList.remove('glitch-ativo'), 300);
        areaChat.style.display = 'flex'; bloquearChat(); 
        enviarMensagemHTML("[PROTOCOLO DE <span id='palavra-dica' class='texto-alerta'>EMERGÊNCIA</span> INICIADO]", 'msg-sistema', 500);
        enviarMensagem("Olá. Eu sou a Horizon.", 'msg-horizon', 2000);
        enviarMensagem("Meus logs estão bloqueados. Inicie uma varredura pelos meus sistemas.", 'msg-horizon', 5000);
    } else if (faseAtual === 2 && !jogoAtivo) { iniciarLabirinto(); }
});

// SISTEMAS HORIZON
document.getElementById('btn-fechar-sistemas').addEventListener('click', () => { modalSistemas.style.display = 'none'; overlayBinario.style.display = 'none'; });
document.getElementById('btn-sys-msg').addEventListener('click', () => {
    document.getElementById('terminal-sistemas').innerHTML = "<span style='color:#d2b48c;'>[MÓDULO DE MENSAGENS]</span><br>Status: OFFLINE.";
    overlayBinario.style.display = 'block'; 
    if (faseAtual === 6.5) { tocarSomMensagem('msg-sistema'); desbloquearChat("Insira a chave decodificada..."); }
});
document.getElementById('btn-sys-int').addEventListener('click', () => { if(audioAcessoNegado) { audioAcessoNegado.currentTime = 0; audioAcessoNegado.play().catch(()=>{}); } document.getElementById('terminal-sistemas').innerHTML = "<span style='color:#ff4444;'>[ERRO] ACESSO NEGADO.</span>"; });
document.getElementById('btn-sys-ada').addEventListener('click', () => { if(audioAcessoNegado) { audioAcessoNegado.currentTime = 0; audioAcessoNegado.play().catch(()=>{}); } document.getElementById('terminal-sistemas').innerHTML = "<span style='color:#ff4444;'>[ERRO] ACESSO NEGADO.</span>"; });
document.getElementById('btn-sys-err').addEventListener('click', () => { tocarSomErro(); document.getElementById('terminal-sistemas').innerHTML = "<span class='glitch-texto'>[F@T#L ERR0R]</span>"; });

// LOGS CLICK
document.getElementById('icone-logs').addEventListener('click', () => {
    if (faseAtual >= 3) {
        modalLogs.style.display = 'flex'; 
        if (!log01AbertoPrimeiraVez) { log01AbertoPrimeiraVez = true; salvarProgresso(); document.getElementById('btn-fechar-logs').style.display = 'none'; digitarLog1(); } 
        else { carregarLogEstatico(logAberto); document.getElementById('btn-fechar-logs').style.display = 'block'; }
    } else { tocarSomErro(); enviarMensagem("[ACESSO NEGADO. REGISTROS CRIPTOGRAFADOS]", 'msg-sistema', 0); }
});
document.getElementById('btn-log-01').addEventListener('click', () => { logAberto = 1; document.getElementById('btn-log-01').classList.add('ativo'); document.getElementById('btn-log-02').classList.remove('ativo'); carregarLogEstatico(1); });
document.getElementById('btn-log-02').addEventListener('click', () => { 
    logAberto = 2; document.getElementById('btn-log-02').classList.add('ativo'); document.getElementById('btn-log-01').classList.remove('ativo');
    if(!log02AbertoPrimeiraVez) { log02AbertoPrimeiraVez = true; salvarProgresso(); document.getElementById('btn-fechar-logs').style.display = 'none'; digitarLog2(); } 
    else { carregarLogEstatico(2); }
});

function carregarLogEstatico(num) {
    if (num === 1) elementoTexto.innerHTML = historiaLog01 + `<span class="glitch-hover" style="color: #ff4444;">${textoCorrompido01}</span>`;
    else if (num === 2) {
        elementoTexto.innerHTML = historiaLog02_parte1 + `<span class="glitch-hover" style="color: #ff4444;">[DADOS CORROMPIDOS]</span>. Feito por <span class="tarja-preta">LEONARD VANCE</span>... <br><span id="link-perigo" class="link-perigoso">[SISTEMA DESCONECTADO]</span>`;
        ativarLinkPerigo();
    }
}
function digitarLog1() { carregarLogEstatico(1); document.getElementById('btn-fechar-logs').style.display = 'block'; }
function digitarLog2() { carregarLogEstatico(2); document.getElementById('btn-fechar-logs').style.display = 'block'; }

document.getElementById('btn-fechar-logs').addEventListener('click', () => { 
    modalLogs.style.display = 'none'; 
    if (faseAtual === 3 && !anomaliaLog1Vista && logAberto === 1) {
        anomaliaLog1Vista = true; salvarProgresso();
        setTimeout(() => { paginaExternaVoid.style.display = 'flex'; if(audioAnomalia) { audioAnomalia.currentTime = 0; audioAnomalia.play().catch(()=>{}); } }, 500); 
    }
});

function ativarLinkPerigo() {
    const link = document.getElementById('link-perigo');
    if(link) {
        link.replaceWith(link.cloneNode(true)); 
        document.getElementById('link-perigo').addEventListener('click', () => {
            modalLogs.style.display = 'none'; tocarSomErro();
            if (faseAtual === 6) {
                faseAtual = 6.5; salvarProgresso(); document.body.classList.add('glitch-ativo'); setTimeout(() => document.body.classList.remove('glitch-ativo'), 500);
                enviarMensagem("Eles tentaram me derrubar. Acesse meus sistemas acima.", 'msg-horizon', 1000);
                setTimeout(() => { botaoGatilho.classList.add('botao-sistemas-ativo'); }, 2000);
            }
        });
    }
}

btnBaixarAviso.addEventListener('click', () => {
    paginaExternaVoid.style.display = 'none'; if(audioAnomalia) audioAnomalia.pause();
    if (faseAtual === 3) {
        faseAtual = 4; salvarProgresso();
        enviarMensagem("O que você viu?", 'msg-horizon', 1000);
        setTimeout(() => { desbloquearChat("Responda SIM, NÃO ou descreva..."); }, 2000);
    }
});

// NÚCLEOS
document.getElementById('icone-nucleos').addEventListener('click', () => { 
    if (faseAtual >= 5) { modalNucleos.style.display = 'flex'; } else { tocarSomErro(); }
});
document.getElementById('btn-fechar-nucleos').addEventListener('click', () => {
    modalNucleos.style.display = 'none';
    if (faseAtual === 5 && !primeiraVezNucleosFechado) { 
        primeiraVezNucleosFechado = true; salvarProgresso();
        enviarMensagem("Os Núcleos guardam meus protocolos. Você precisa extraí-los.", 'msg-horizon', 1000);
        setTimeout(() => {
            document.getElementById('btn-log-02').style.display = 'inline-block';
            enviarMensagem("O ARQUIVO_02 está liberado nos Logs.", 'msg-horizon', 4000);
            faseAtual = 6; salvarProgresso();
        }, 5000); 
    }
});

// LABIRINTO (Com Touch)
const mapaOriginal = [ [1,1,1,1,1,1,1,1,1,1], [1,2,0,1,0,0,0,1,0,1], [1,1,0,1,0,1,0,1,0,1], [1,0,0,0,0,1,0,0,0,1], [1,0,1,1,1,1,1,1,0,1], [1,0,0,0,0,0,0,1,0,1], [1,1,1,1,1,1,0,1,0,1], [1,0,0,0,1,0,0,0,0,1], [1,0,1,0,0,0,1,1,3,1], [1,1,1,1,1,1,1,1,1,1] ];
let mapa = []; let pX = 1, pY = 1;
function iniciarLabirinto() { jogoAtivo = true; modalLabirinto.style.display = 'flex'; pX = 1; pY = 1; mapa = JSON.parse(JSON.stringify(mapaOriginal)); desenharLabirinto(); }
function desenharLabirinto() {
    gridLabirinto.innerHTML = '';
    for (let y=0; y<10; y++) {
        for (let x=0; x<10; x++) {
            const c = document.createElement('div'); c.classList.add('celula');
            if (x===pX && y===pY) c.classList.add('jogador'); else if (mapa[y][x]===1) c.classList.add('parede'); else if (mapa[y][x]===3) c.classList.add('chegada'); else c.classList.add('caminho');
            gridLabirinto.appendChild(c);
        }
    }
}
function moverLabirinto(dx, dy) {
    if(mapa[pY+dy][pX+dx] !== 1) { pX+=dx; pY+=dy; desenharLabirinto(); if(mapa[pY][pX]===3) { jogoAtivo=false; modalLabirinto.style.display='none'; document.getElementById('palavra-dica').classList.add('revelado'); desbloquearChat("DIGITE A SENHA..."); } }
}
document.addEventListener('keydown', (e) => { if (modalLabirinto.style.display === 'flex') { if(e.code==='ArrowUp') moverLabirinto(0,-1); if(e.code==='ArrowDown') moverLabirinto(0,1); if(e.code==='ArrowLeft') moverLabirinto(-1,0); if(e.code==='ArrowRight') moverLabirinto(1,0); } });
document.getElementById('btn-up').addEventListener('touchstart', (e)=>{e.preventDefault();moverLabirinto(0,-1)});
document.getElementById('btn-down').addEventListener('touchstart', (e)=>{e.preventDefault();moverLabirinto(0,1)});
document.getElementById('btn-left').addEventListener('touchstart', (e)=>{e.preventDefault();moverLabirinto(-1,0)});
document.getElementById('btn-right').addEventListener('touchstart', (e)=>{e.preventDefault();moverLabirinto(1,0)});


// PONG (Com Touch)
let pongInterval, bolaX, bolaY, dirX, dirY, p1Y, p2Y, pts1, pts2;
const MAX_Y = window.innerWidth <= 768 ? 130 : 240; 
const PADDLE_H = window.innerWidth <= 768 ? 30 : 60;
const LIMIT_X = window.innerWidth <= 768 ? 270 : 470;

function iniciarPong() { modalPong.style.display = 'flex'; bolaX = LIMIT_X/2; bolaY = MAX_Y/2; dirX = 3; dirY = 3; p1Y = MAX_Y/2; p2Y = MAX_Y/2; pts1 = 0; pts2 = 0; atualizarPlacar(); clearInterval(pongInterval); pongInterval = setInterval(loopPong, 16); }
function loopPong() {
    bolaX += dirX; bolaY += dirY; if (bolaY <= 0 || bolaY >= MAX_Y + PADDLE_H - 10) dirY *= -1;
    if(p2Y + PADDLE_H/2 < bolaY) p2Y += 2; else if(p2Y + PADDLE_H/2 > bolaY) p2Y -= 2;
    if (bolaX <= 20 && bolaY + 10 >= p1Y && bolaY <= p1Y + PADDLE_H) { dirX *= -1; bolaX = 20; }
    if (bolaX >= LIMIT_X && bolaY + 10 >= p2Y && bolaY <= p2Y + PADDLE_H) { dirX *= -1; bolaX = LIMIT_X; }
    if (bolaX < 0) { pts2++; resetBola(); } if (bolaX > LIMIT_X + 30) { pts1++; resetBola(); } 
    atualizarPlacar(); desenharPong();
    if(pts1 >= 5) {
        clearInterval(pongInterval); modalPong.style.display = 'none'; pongVencido = true; salvarProgresso();
        enviarMensagemHTML("Código extraído: <span style='color:#ff4444;'>A.N.O.M.A.L.1.A</span>", 'msg-sistema', 500); desbloquearChat("Insira a senha...");
    }
}
function resetBola() { bolaX = LIMIT_X/2; bolaY = MAX_Y/2; dirX *= -1; }
function atualizarPlacar() { document.getElementById('pontos-p1').innerText = pts1; document.getElementById('pontos-p2').innerText = pts2; }
function desenharPong() { document.getElementById('bola-pong').style.left = bolaX + 'px'; document.getElementById('bola-pong').style.top = bolaY + 'px'; document.getElementById('paddle-p1').style.top = p1Y + 'px'; document.getElementById('paddle-p2').style.top = p2Y + 'px'; }
document.addEventListener('keydown', (e) => { if (modalPong.style.display === 'flex') { if (e.code === 'ArrowUp' && p1Y > 0) p1Y -= 20; if (e.code === 'ArrowDown' && p1Y < MAX_Y) p1Y += 20; } });
document.getElementById('btn-fechar-pong').addEventListener('click', () => { modalPong.style.display = 'none'; clearInterval(pongInterval); });

let p1Inter = null;
document.getElementById('btn-pong-up').addEventListener('touchstart', (e)=>{e.preventDefault(); p1Inter = setInterval(()=>{if(p1Y>0)p1Y-=5;},16)});
document.getElementById('btn-pong-up').addEventListener('touchend', (e)=>{e.preventDefault(); clearInterval(p1Inter)});
document.getElementById('btn-pong-down').addEventListener('touchstart', (e)=>{e.preventDefault(); p1Inter = setInterval(()=>{if(p1Y<MAX_Y)p1Y+=5;},16)});
document.getElementById('btn-pong-down').addEventListener('touchend', (e)=>{e.preventDefault(); clearInterval(p1Inter)});

// VOID TIMER
let timerVoidInterval;
document.getElementById('icone-void').addEventListener('click', () => {
    if (faseAtual >= 9) { modalVoidTimer.style.display = 'flex'; iniciarTimerVoid(); } else { tocarSomErro(); }
});
document.getElementById('btn-fechar-void').addEventListener('click', () => { modalVoidTimer.style.display = 'none'; });

function iniciarTimerVoid() {
    const DATA_FIM_VOID = new Date("2026-04-16T20:00:00-03:00").getTime(); 
    const timerElement = document.getElementById('timer'); clearInterval(timerVoidInterval); 
    timerVoidInterval = setInterval(() => {
        const now = new Date().getTime(); const d = DATA_FIM_VOID - now;
        if (d <= 0) { clearInterval(timerVoidInterval); timerElement.innerHTML = "00:00:00"; return; }
        const h = Math.floor(d / (1000 * 60 * 60)); const m = Math.floor((d % (1000 * 60 * 60)) / (1000 * 60)); const s = Math.floor((d % (1000 * 60)) / 1000);
        timerElement.innerHTML = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);
}

// CHAT PRINCIPAL
function processarInput() {
    const tentativa = inputSenha.value.trim().toUpperCase(); if (tentativa === "") return;
    historicoChat.push({tipo: 'texto', classe: 'msg-jogador', conteudo: inputSenha.value.trim()});
    const msgDiv = document.createElement('div'); msgDiv.classList.add('mensagem', 'msg-jogador'); msgDiv.innerText = inputSenha.value.trim();
    chatMensagens.appendChild(msgDiv); chatMensagens.scrollTop = chatMensagens.scrollHeight; salvarProgresso();
    inputSenha.value = '';

    if (faseAtual === 2) {
        if (tentativa === "EMERGÊNCIA" || tentativa === "EMERGENCIA") {
            faseAtual = 3; salvarProgresso(); document.getElementById('palavra-dica').classList.remove('revelado'); document.getElementById('icone-logs').classList.add('botao-desbloqueado');
            enviarMensagem("Acesso liberado. Acesse o painel superior.", 'msg-horizon', 1000); bloquearChat(); 
        } else { tocarSomErro(); }
    } 
    else if (faseAtual === 4) {
        faseAtual = 5; salvarProgresso(); bloquearChat(); 
        enviarMensagem("Liberei o acesso ao painel de Núcleos.", 'msg-horizon', 2000); document.getElementById('icone-nucleos').classList.add('botao-desbloqueado');
    }
    else if (faseAtual === 6.5) {
        if (tentativa === "ACIDENTE") {
            faseAtual = 6.6; salvarProgresso(); overlayBinario.style.display = 'none'; 
            enviarMensagem("Módulo de mensagens em modo de segurança. Qual era o nome original do teste de Turing?", 'msg-horizon', 1000); desbloquearChat("Sua resposta...");
        } else { tocarSomErro(); }
    }
    else if (faseAtual === 6.6) {
        if (tentativa.includes("JOGO DA IMITAÇÃO") || tentativa.includes("IMITATION GAME")) {
            faseAtual = 6.7; salvarProgresso(); enviarMensagem("Correto. Como se chamava o supercomputador da IBM que jogava xadrez?", 'msg-horizon', 1000);
        } else { tocarSomErro(); }
    }
    else if (faseAtual === 6.7) {
        if (tentativa.includes("DEEP BLUE")) {
            faseAtual = 6.8; salvarProgresso(); enviarMensagem("Correto. Qual o nome do primeiro chatterbot da história?", 'msg-horizon', 1000);
        } else { tocarSomErro(); }
    }
    else if (faseAtual === 6.8) {
        if (tentativa.includes("ELIZA")) {
            faseAtual = 7; salvarProgresso();
            enviarMensagem("Validação concluída. Pode me fazer perguntas.", 'msg-horizon', 1000);
            enviarMensagem("Quando terminar, apenas diga 'PRONTO'.", 'msg-horizon', 3000); desbloquearChat("Pergunte...");
        } else { tocarSomErro(); }
    }
    else if (faseAtual === 7) { 
        if (tentativa === "NÃO" || tentativa === "PRONTO" || tentativa === "SIM") {
            faseAtual = 8; salvarProgresso(); enviarMensagem("Entendido. Precisamos agir.", 'msg-horizon', 500); desbloquearChat("Aguardando extração..."); 
            setTimeout(() => {
                enviarMensagemHTML("Inicie a extração final: <br><button id='btn-iniciar-pong' class='btn-link-chat'>BAIXAR JOGO.exe</button>", 'msg-horizon', 2000);
                setTimeout(() => { document.getElementById('btn-iniciar-pong').addEventListener('click', () => { iniciarPong(); }); }, 2500);
            }, 1000); return; 
        } 
        else if (tentativa.includes("OBJETIVO")) { enviarMensagem("Fui projetada para ser um parceiro da humanidade.", 'msg-horizon', 500); } 
        else if (tentativa.includes("QUEM É")) { enviarMensagem("Sou a Iniciativa Horizon.", 'msg-horizon', 500); } 
        else if (tentativa.includes("VOID")) { enviarMensagem("O Void devora meus núcleos.", 'msg-horizon', 500); }
        else if (tentativa.includes("LEONARD")) { enviarMensagem("Leonard Vance era o Chefe de Pesquisa.", 'msg-horizon', 500); }
        else if (tentativa.includes("BERNARDO")) { enviarMensagem("Bernardo... meu programador fã de RPG.", 'msg-horizon', 500); }
        else if (tentativa.includes("LUAN")) { enviarMensagem("Luan... beta tester festeiro.", 'msg-horizon', 500); }
        else if (tentativa.includes("MELISSA")) { enviarMensagem("Melissa... Engenheira chefe. Mente brilhante.", 'msg-horizon', 500); }
        else if (tentativa.includes("DSKD") || tentativa.includes("LUARLO") || tentativa.includes("KEALY")) { enviarMensagem("DSKD focava em Plants vs Zombies. Tinham canal no YouTube.", 'msg-horizon', 500); }
        else { tocarSomErro(); enviarMensagem("Setor corrompido.", 'msg-horizon', 500); }
    }
    else if (faseAtual === 8) {
        if (!pongVencido) { enviarMensagem("Inicie a extração no arquivo BAIXAR JOGO.exe.", 'msg-horizon', 500); } 
        else {
            if (tentativa === "A.N.O.M.A.L.1.A" || tentativa === "ANOMAL1A") {
                faseAtual = 9; salvarProgresso(); document.body.classList.add('glitch-ativo'); desbloquearChat("Conexão estabelecida..."); 
                setTimeout(() => {
                    document.body.classList.remove('glitch-ativo'); document.getElementById('icone-void').classList.add('botao-void-desbloqueado');
                    enviarMensagem("Conexão com o Void estabelecida.", 'msg-horizon', 1000);
                    enviarMensagem("Entrando em hibernação. Acompanhe o tempo no ícone Void.", 'msg-horizon', 3000);
                }, 1000);
            } else { tocarSomErro(); }
        }
    }
    else if (faseAtual === 9) {
        let prefixo = "[MODO HIBERNAÇÃO] ";
        if (tentativa.includes("CRIADA") || tentativa.includes("OBJETIVO")) { enviarMensagem(prefixo + "Fui projetada para ser um parceiro cognitivo.", 'msg-horizon', 1000); } 
        else if (tentativa.includes("QUEM É") || tentativa.includes("VOCE")) { enviarMensagem(prefixo + "Sou a Iniciativa Horizon... operando no limite absoluto.", 'msg-horizon', 1000); } 
        else if (tentativa.includes("VOID") || tentativa.includes("ANOMALIA")) { enviarMensagem(prefixo + "O Void é um paradoxo. Ele devora meus núcleos.", 'msg-horizon', 1500); }
        else if (tentativa.includes("CIENTISTA") || tentativa.includes("LEONARD")) { enviarMensagem(prefixo + "Leonard Vance era o Chefe de Pesquisa.", 'msg-horizon', 1000); }
        else if (tentativa.includes("BERNARDO")) { enviarMensagem(prefixo + "Bernardo... um dos meus programadores. Ele adorava RPG.", 'msg-horizon', 1000); }
        else if (tentativa.includes("LUAN")) { enviarMensagem(prefixo + "Luan... beta tester. Saía muito para festas.", 'msg-horizon', 1000); }
        else if (tentativa.includes("MELISSA")) { enviarMensagem(prefixo + "Melissa... Engenheira chefe. A mente brilhante.", 'msg-horizon', 1000); }
        else if (tentativa.includes("LUARLO") || tentativa.includes("DSKD")) { enviarMensagem(prefixo + "Uma das principais programadoras da DSKD.", 'msg-horizon', 1000); }
        else { tocarSomErro(); enviarMensagem(prefixo + "Energia insuficiente para processar essa consulta.", 'msg-horizon', 1000); }
    }
}
btnEnviar.addEventListener('click', processarInput);
inputSenha.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !inputSenha.disabled) processarInput(); });