const form = document.getElementById("formCadastro");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const res = await fetch("http://localhost:3000/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha })
    });

    const data = await res.json();
    if (!res.ok) throw data;

    msg.style.color = "green";
    msg.innerText = data.message;
    form.reset();
  } catch (err) {
    msg.style.color = "red";
    msg.innerText = err.error || err.message || "Erro ao cadastrar.";
  }
});
