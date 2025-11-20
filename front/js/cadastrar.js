// ===== Máscaras =====
function mascaraCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return cpf;
}

function mascaraValor(valor) {
  valor = valor.replace(/\D/g, "");
  valor = (valor / 100).toFixed(2) + "";
  valor = valor.replace(".", ",");
  valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return valor;
}

// ===== Formulário =====
const formCadastro = document.getElementById("formCadastro");
const produtosContainer = document.getElementById("produtosContainer");
const addProdutoBtn = document.getElementById("addProduto");
const cpfInput = document.getElementById("cpf_aut");

// Aplica máscara de CPF ao digitar
cpfInput.addEventListener("input", (e) => {
  e.target.value = mascaraCPF(e.target.value);
});

// Adiciona nova caixa de produto
function criarProdutoBox() {
  const box = document.createElement("div");
  box.classList.add("produto-box");

  box.innerHTML = `
    <label>Tipo de Produto</label>
    <select class="tipoProduto" required>
      <option value="">Selecione</option>
      <option value="livro">Livro</option>
      <option value="cd">CD</option>
      <option value="dvd">DVD</option>
    </select>

    <label>Título</label>
    <input type="text" class="tituloProduto" required>

    <div class="camposLivro" style="display:none;">
      <label>Gênero Literário</label>
      <input type="text" class="generoLivro">
      <label>Número de Páginas</label>
      <input type="number" class="paginasLivro">
      <label>Valor</label>
      <input type="text" class="valorProduto">
    </div>

    <div class="camposCD" style="display:none;">
      <label>Armazenamento</label>
      <input type="text" class="armazenamentoCD">
      <label>Tempo de Vídeo (minutos)</label>
      <input type="number" class="tempoCD">
      <label>Valor</label>
      <input type="text" class="valorProduto">
    </div>

    <div class="camposDVD" style="display:none;">
      <label>Armazenamento</label>
      <input type="text" class="armazenamentoDVD">
      <label>Tempo de Vídeo (minutos)</label>
      <input type="number" class="tempoDVD">
      <label>Valor</label>
      <input type="text" class="valorProduto">
    </div>

    <button type="button" class="removeProduto">Remover</button>
    <hr>
  `;

  // Mostra campos corretos conforme tipo selecionado
  const tipoSelect = box.querySelector(".tipoProduto");
  tipoSelect.addEventListener("change", () => {
    box.querySelector(".camposLivro").style.display = tipoSelect.value === "livro" ? "block" : "none";
    box.querySelector(".camposCD").style.display = tipoSelect.value === "cd" ? "block" : "none";
    box.querySelector(".camposDVD").style.display = tipoSelect.value === "dvd" ? "block" : "none";
  });

  // Máscara para valor
  const valorInputs = box.querySelectorAll(".valorProduto");
  valorInputs.forEach(input => {
    input.addEventListener("input", (e) => {
      e.target.value = mascaraValor(e.target.value);
    });
  });

  // Botão remover produto
  box.querySelector(".removeProduto").addEventListener("click", () => box.remove());

  produtosContainer.appendChild(box);
}

// Botão adicionar produto
addProdutoBtn.addEventListener("click", criarProdutoBox);

// Submit do formulário
formCadastro.addEventListener("submit", async (e) => {
  e.preventDefault();

  const autor = {
    nome_aut: document.getElementById("nome_aut").value,
    cpf_aut: document.getElementById("cpf_aut").value.replace(/\D/g, ""),
    datanascimento_aut: document.getElementById("datanascimento_aut").value
  };

  const autorRes = await fetch("http://localhost:3000/autor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(autor)
  });

  const autorData = await autorRes.json();
  if (!autorData[0] || !autorData[0].id_aut) {
    alert("Erro ao cadastrar autor!");
    return;
  }

  const aut_id = autorData[0].id_aut;

  // Cadastro de produtos
  const boxes = produtosContainer.querySelectorAll(".produto-box");
  for (const box of boxes) {
    const tipo = box.querySelector(".tipoProduto").value;
    const titulo = box.querySelector(".tituloProduto").value;
    const valorRaw = box.querySelector(".valorProduto")?.value || "0,00";
    const valor = valorRaw.replace(/\./g, "").replace(",", ".");

    let bodyData = { aut_id, titulo, valor };

    if (tipo === "livro") {
      bodyData = {
        aut_id,
        titulo_liv: titulo,
        generoliterario_liv: box.querySelector(".generoLivro").value,
        numeropaginas_liv: box.querySelector(".paginasLivro").value,
        valor_liv: parseFloat(valor)
      };
      await fetch("http://localhost:3000/livro", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bodyData) });
    } else if (tipo === "cd") {
      bodyData = {
        aut_id,
        titulo_cds: titulo,
        armazenamentocds: box.querySelector(".armazenamentoCD").value,
        tempodevideo_cds: box.querySelector(".tempoCD").value,
        valor_cds: parseFloat(valor)
      };
      await fetch("http://localhost:3000/cds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bodyData) });
    } else if (tipo === "dvd") {
      bodyData = {
        aut_id,
        titulo_dvd: titulo,
        armazenamentodvd: box.querySelector(".armazenamentoDVD").value,
        tempodevideo_dvd: box.querySelector(".tempoDVD").value,
        valor_dvd: parseFloat(valor)
      };
      await fetch("http://localhost:3000/dvds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bodyData) });
    }
  }

  document.getElementById("msg").innerText = "Cadastro realizado com sucesso!";
  formCadastro.reset();
  produtosContainer.innerHTML = "";
});

