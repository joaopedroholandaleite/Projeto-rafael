document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:3000/autor")
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("lista-autores");

      data.forEach(autor => {
        const li = document.createElement("li");
        li.textContent = `${autor.nome_aut} — CPF: ${autor.cpf_aut}`;
        lista.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Erro ao carregar autores:", err);
    });
});
