/**
 * CONFIGURAÇÃO DO ADMIN
 * Substitua pela sua URL atual do Apps Script (Verifique se não mudou)
 */
const API_URL = "https://script.google.com/macros/s/AKfycbyVI4pXYIM6GSEAl-TuqKdNPjaNIW7TEWM-rq9UdVh343htO3rb2GL8mVD1PDlaCcz77Q/exec"; 

// ==========================================
// 1. FUNÇÃO: CADASTRAR PACIENTE
// ==========================================
async function cadastrarPaciente() {
    const nome = document.getElementById('cadNome').value;
    const cpf = document.getElementById('cadCpf').value;
    const boxResultado = document.getElementById('resultadoCadastro');

    if (!nome || !cpf) {
        return Swal.fire('Atenção', 'Preencha Nome e CPF', 'warning');
    }

    // Mostra carregando
    Swal.fire({ title: 'Cadastrando...', didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'cadastrarPaciente',
                nome: nome,
                cpf: cpf
            })
        });

        const res = await response.json();
        Swal.close();

        if (res.success) {
            Swal.fire('Sucesso', 'Paciente cadastrado!', 'success');
            
            // Mostra os dados na tela
            boxResultado.style.display = 'block';
            document.getElementById('resUser').innerText = cpf;
            document.getElementById('resSenha').innerText = res.senha;
            document.getElementById('resId').innerText = res.id;
            
            // Limpa os campos
            document.getElementById('cadNome').value = '';
            document.getElementById('cadCpf').value = '';
        } else {
            Swal.fire('Erro', res.message, 'error');
        }

    } catch (error) {
        console.error(error);
        Swal.fire('Erro', 'Falha na conexão.', 'error');
    }
}

// ==========================================
// 2. FUNÇÃO: BUSCAR PACIENTE (NOVA)
// ==========================================
async function buscarPaciente() {
    const termo = document.getElementById('buscaTermo').value;
    const box = document.getElementById('resultadoBusca');

    if (!termo) {
        return Swal.fire('Atenção', 'Digite um Nome ou CPF para buscar', 'warning');
    }

    // Feedback visual
    const btnBusca = document.querySelector('.input-group button');
    const iconeOriginal = btnBusca.innerHTML;
    btnBusca.innerHTML = '<div class="spinner-border spinner-border-sm"></div>';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'buscarPaciente', // Importante: Isso deve bater com o Código.gs
                termo: termo
            })
        });

        const res = await response.json();
        btnBusca.innerHTML = iconeOriginal; // Restaura o ícone

        if (res.success) {
            // Mostra o resultado
            box.style.display = 'block';
            document.getElementById('buscNome').innerText = res.nome;
            document.getElementById('buscCpf').innerText = res.cpf;
            document.getElementById('buscId').innerText = res.id;
        } else {
            box.style.display = 'none';
            Swal.fire('Não encontrado', 'Nenhum paciente com esse dado.', 'info');
        }

    } catch (error) {
        console.error(error);
        btnBusca.innerHTML = iconeOriginal;
        Swal.fire('Erro', 'Falha na conexão ou API desatualizada.', 'error');
    }
}

// Função auxiliar para o botão "Usar ID"
function usarIdEncontrado() {
    const idEncontrado = document.getElementById('buscId').innerText;
    
    if(!idEncontrado || idEncontrado === '...') return;

    // Preenche o campo da direita
    const inputExame = document.getElementById('exameIdPaciente');
    inputExame.value = idEncontrado;
    
    // Animação visual (pisca verde)
    inputExame.style.backgroundColor = "#d1e7dd"; 
    inputExame.style.transition = "0.5s";
    setTimeout(() => { inputExame.style.backgroundColor = ""; }, 1000);
}


// ==========================================
// 3. FUNÇÃO: LANÇAR EXAME
// ==========================================
async function lancarExame() {
    const id = document.getElementById('exameIdPaciente').value;
    const exame = document.getElementById('exameNome').value;

    if (!id) {
        return Swal.fire('Atenção', 'Informe o ID do paciente', 'warning');
    }

    Swal.fire({ title: 'Salvando...', didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'salvarExame',
                idPaciente: id,
                nomeExame: exame
            })
        });

        const res = await response.json();
        Swal.close();

        if (res.success) {
            Swal.fire('Sucesso', 'Exame lançado! Aguardando upload do PDF.', 'success');
            // Limpa o campo ID para evitar duplicidade acidental
            document.getElementById('exameIdPaciente').value = '';
        } else {
            Swal.fire('Erro', res.message, 'error');
        }

    } catch (error) {
        console.error(error);
        Swal.fire('Erro', 'Falha na conexão.', 'error');
    }
}
