/**
 * CONFIGURAÇÃO PRINCIPAL
 * Cole abaixo a URL do seu App da Web do Google Apps Script
 */
const API_URL = "https://script.google.com/macros/s/AKfycbyVI4pXYIM6GSEAl-TuqKdNPjaNIW7TEWM-rq9UdVh343htO3rb2GL8mVD1PDlaCcz77Q/exec";

// ======================================================
// 1. LÓGICA DA TELA DE LOGIN (login.html)
// ======================================================

async function realizarLogin() {
    const userInput = document.getElementById('user');
    const passInput = document.getElementById('pass');
    const msg = document.getElementById('login-msg');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');

    // Validação básica
    if (!userInput.value || !passInput.value) {
        msg.innerText = "Por favor, preencha todos os campos.";
        return;
    }

    // Efeito visual de carregamento
    btnText.classList.add('d-none');
    btnLoader.classList.remove('d-none');
    msg.innerText = "";

    try {
        // Envia os dados para o Google Apps Script
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'login',
                usuario: userInput.value,
                senha: passInput.value
            })
        });

        const res = await response.json();

        if (res.success) {
            // Salva os dados no navegador do usuário
            localStorage.setItem('pacienteId', res.id);
            localStorage.setItem('pacienteNome', res.nome);
            
            // REDIRECIONAMENTO: Manda para o painel
            window.location.href = 'dashboard.html';
        } else {
            // Erro de senha
            msg.innerText = "Usuário ou senha incorretos.";
            resetBtnLogin();
        }

    } catch (error) {
        console.error(error);
        msg.innerText = "Erro de conexão. Tente novamente.";
        resetBtnLogin();
    }
}

function resetBtnLogin() {
    document.getElementById('btnText').classList.remove('d-none');
    document.getElementById('btnLoader').classList.add('d-none');
}


// ======================================================
// 2. LÓGICA DO DASHBOARD (dashboard.html)
// ======================================================

async function carregarExames() {
    // VERIFICAÇÃO DE SEGURANÇA
    // Se não tiver ID salvo, chuta de volta para o login
    const id = localStorage.getItem('pacienteId');
    const nome = localStorage.getItem('pacienteNome');

    if (!id) {
        window.location.href = 'login.html';
        return;
    }

    // Preenche o nome do paciente no topo
    const nomeElement = document.getElementById('client-name');
    if(nomeElement) nomeElement.innerText = nome;

    const list = document.getElementById('exames-list');
    if (!list) return; // Evita erro se carregar script em outra página

    list.innerHTML = '<tr><td colspan="5" class="text-center py-4"><div class="spinner-border text-danger" role="status"></div><p class="mt-2">Buscando seus exames...</p></td></tr>';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'buscarExames',
                idPaciente: id
            })
        });

        const exames = await response.json();
        renderizarTabela(exames, list);

    } catch (error) {
        console.error(error);
        list.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Erro ao carregar dados. Recarregue a página.</td></tr>';
    }
}

function renderizarTabela(exames, elementoTabela) {
    if (exames.length === 0) {
        elementoTabela.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum exame encontrado.</td></tr>';
        return;
    }

    let html = '';
    exames.forEach(ex => {
        let acao = '';
        let statusClass = ex.status === 'Pronto' ? 'ready' : 'pending';
        let pagClass = ex.pagamento === 'Pago' ? 'paid' : 'unpaid';

        // Lógica dos Botões
        if (ex.pagamento === 'Pendente') {
            acao = `<button onclick="pagarPix('${ex.nome}')" class="btn btn-sm btn-danger shadow-sm"><i class="fas fa-qrcode me-1"></i> Pagar</button>`;
        } else if (ex.status === 'Pronto') {
            acao = `<a href="${ex.link}" target="_blank" class="btn btn-sm btn-success shadow-sm"><i class="fas fa-download me-1"></i> PDF</a>`;
        } else {
            acao = `<span class="text-muted small"><i class="fas fa-hourglass-half"></i> Aguarde</span>`;
        }

        html += `
            <tr>
                <td data-label="Exame"><strong>${ex.nome}</strong></td>
                <td data-label="Data">${ex.data}</td>
                <td data-label="Status"><span class="badge ${statusClass}">${ex.status}</span></td>
                <td data-label="Pagamento"><span class="badge ${pagClass}">${ex.pagamento}</span></td>
                <td data-label="Ação" class="text-end">${acao}</td>
            </tr>`;
    });
    elementoTabela.innerHTML = html;
}


// ======================================================
// 3. FUNÇÕES GERAIS (Logout e Pix)
// ======================================================

function logout() {
    localStorage.removeItem('pacienteId');
    localStorage.removeItem('pacienteNome');
    window.location.href = 'index.html';
}

function pagarPix(nomeExame) {
    // 1. Cole aqui o "Pix Copia e Cola" gerado no app do banco
    const pixPayload = "00020126580014BR.GOV.BCB.PIX0136.....00020126330014BR.GOV.BCB.PIX0111092503854715204000053039865802BR5925Francisco Williano Pereir6009SAO PAULO62140510xS9tq7FMms6304B42F.....6304E2CA"; 
    
    // Codifica para URL (para garantir que funcione na API)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixPayload)}`;

    Swal.fire({
        title: 'Pagamento via PIX',
        html: `
            <p class="mb-3">Libere o resultado de <strong>${nomeExame}</strong>.</p>
            
            <div class="bg-white p-3 rounded mb-3 border d-inline-block">
                <img src="${qrCodeUrl}" class="img-fluid" style="max-width: 200px">
            </div>
            
            <p class="small text-muted mb-2">Aponte a câmera do seu celular</p>
            
            <p class="small text-muted">Ou copie o código abaixo:</p>
            
            <div class="input-group mb-3">
                <input type="text" class="form-control form-control-sm" value="${pixPayload}" id="pixCopiaCola" readonly>
                <button class="btn btn-outline-secondary btn-sm" onclick="copiarPix()">Copiar</button>
            </div>
        `,
        confirmButtonText: 'Já fiz o pagamento',
        confirmButtonColor: '#cc0000', // Vermelho Vital Lab
        showCancelButton: true,
        cancelButtonText: 'Fechar'
    });
}

// Função auxiliar para copiar o código (UX melhorada)
function copiarPix() {
    const copyText = document.getElementById("pixCopiaCola");
    copyText.select();
    copyText.setSelectionRange(0, 99999); 
    navigator.clipboard.writeText(copyText.value);
    
    // Feedback visual rápido
    const btn = document.querySelector('.input-group button');
    const originalText = btn.innerText;
    btn.innerText = "Copiado!";
    setTimeout(() => { btn.innerText = originalText; }, 2000);
}
    });

}
