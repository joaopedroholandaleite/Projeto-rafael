const lista = document.getElementById("listaAutores");

async function deletarAutor(id, nome) {
    if (!confirm(`Deseja realmente deletar o autor "${nome}" e TODOS os produtos dele?`)) return;
    try {
        const res = await fetch(`http://localhost:3000/autor/${id}`, { method: "DELETE" });
        if (!res.ok) return alert("Erro ao deletar autor.");
        alert("Autor deletado com sucesso!");
        listarTudo();
    } catch (err) {
        console.error(err);
        alert("Erro ao deletar autor.");
    }
}

async function listarTudo() {
    lista.innerHTML = "<p>Carregando...</p>";

    try {
        const autoresRes = await fetch("http://localhost:3000/autor");
        const autores = await autoresRes.json();

        lista.innerHTML = "";

        for (const autor of autores) {
            const produtosRes = await fetch(`http://localhost:3000/autor/${autor.id_aut}/produtos`);
            const produtos = await produtosRes.json();

            const card = document.createElement("div");
            card.classList.add("autor-card");

            card.innerHTML = `
                <h2>${autor.nome_aut}</h2>
                <p><strong>CPF:</strong> ${autor.cpf_aut}</p>
                <p><strong>Nascimento:</strong> ${autor.datanascimento_aut}</p>

                <div class="produto-titulo">📘 Livros</div>
                ${produtos.livros.length ? produtos.livros.map(l => `
                    <div class="produto-item">
                        • <b>${l.titulo_liv}</b> — ${l.generoliterario_liv} — ${l.numeropaginas_liv} páginas — R$ ${Number(l.valor_liv).toFixed(2).replace(".", ",")}
                    </div>
                `).join('') : "<div class='produto-item'>Nenhum livro cadastrado.</div>"}

                <div class="produto-titulo">💽 CDs</div>
                ${produtos.cds.length ? produtos.cds.map(c => `
                    <div class="produto-item">
                        • <b>${c.titulo_cds}</b> — ${c.armazenamentocds} GB — ${c.tempo_audio} min — R$ ${Number(c.valor_cds).toFixed(2).replace(".", ",")}
                    </div>
                `).join('') : "<div class='produto-item'>Nenhum CD cadastrado.</div>"}

                <div class="produto-titulo">📀 DVDs</div>
                ${produtos.dvds.length ? produtos.dvds.map(d => `
                    <div class="produto-item">
                        • <b>${d.titulo_dvd}</b> — ${d.armazenamentodvd} GB — ${d.tempo_video} min — R$ ${Number(d.valor_dvd).toFixed(2).replace(".", ",")}
                    </div>
                `).join('') : "<div class='produto-item'>Nenhum DVD cadastrado.</div>"}

                <button onclick="deletarAutor(${autor.id_aut}, '${autor.nome_aut}')">Deletar Autor</button>
            `;

            lista.appendChild(card);
        }

    } catch (err) {
        console.error(err);
        lista.innerHTML = "<p>Erro ao carregar autores.</p>";
    }
}

listarTudo();
