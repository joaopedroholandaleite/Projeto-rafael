const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = "https://yzubdxptxxqojjnnplpx.supabase.co";
const supabaseKey = "Ssb_publishable_cMz8U-EqR0IvQAjoj1ZkhQ_r0T8LCZa";
const supabase = createClient(supabaseUrl, supabaseKey);

// JWT Secret
const JWT_SECRET = "segredo_supersecreto";

// ===== AUTOR =====
app.post("/autor", async (req, res) => {
  const { nome_aut, cpf_aut, datanascimento_aut } = req.body;
  const { data, error } = await supabase
    .from("autor")
    .insert([{ nome_aut, cpf_aut, datanascimento_aut }])
    .select();

  if (error) return res.status(400).json(error);
  res.json(data);
});

app.get("/autor", async (req, res) => {
  const { data, error } = await supabase.from("autor").select("*");
  if (error) return res.status(400).json(error);
  res.json(data);
});

app.delete("/autor/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  // Deleta produtos primeiro
  await supabase.from("livro").delete().eq("aut_id", id);
  await supabase.from("cds").delete().eq("aut_id", id);
  await supabase.from("dvds").delete().eq("aut_id", id);

  const { data, error } = await supabase.from("autor").delete().eq("id_aut", id).select();
  if (error) return res.status(400).json(error);
  res.json({ message: "Autor deletado", autor: data[0] });
});

// ===== PRODUTO =====
app.post("/produto", async (req, res) => {
  const { tipo, aut_id, titulo, genero, paginas, armazenamento, tempo, valor } = req.body;

  let tabela;
  let registro;

  if (tipo === "livro") {
    tabela = "livro";
    registro = { aut_id, titulo_liv: titulo, generoliterario_liv: genero, numeropaginas_liv: paginas, valor_liv: valor };
  } else if (tipo === "cd") {
    tabela = "cds";
    registro = { aut_id, titulo_cds: titulo, armazenamentocds: armazenamento, tempo_audio: tempo, valor };
  } else if (tipo === "dvd") {
    tabela = "dvds";
    registro = { aut_id, titulo_dvd: titulo, armazenamentodvd: armazenamento, tempo_video: tempo, valor };
  } else {
    return res.status(400).json({ error: "Tipo de produto inválido" });
  }

  const { data, error } = await supabase.from(tabela).insert([registro]).select();
  if (error) return res.status(400).json(error);
  res.json(data);
});

// ===== LISTAR TODOS OS PRODUTOS =====
app.get("/produtos", async (req, res) => {
  try {
    const { data: livros } = await supabase.from("livro").select("*");
    const { data: cds } = await supabase.from("cds").select("*");
    const { data: dvds } = await supabase.from("dvds").select("*");

    res.json({ livros, cds, dvds });
  } catch (error) {
    res.status(400).json({ error: error.message || error });
  }
});

// ===== LOGIN / USUÁRIO =====

// Cadastrar usuário
app.post("/cadastrar", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) return res.status(400).json({ error: "Preencha todos os campos." });

  // Hash da senha
  const hashed = await bcrypt.hash(senha, 10);

  const { data, error } = await supabase
    .from("usuario")
    .insert([{ nome, email, senha: hashed }])
    .select();

  if (error) return res.status(400).json(error);
  res.json({ message: "Usuário cadastrado com sucesso!", usuario: data[0] });
});

// Login
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: "Preencha todos os campos." });

  const { data, error } = await supabase.from("usuario").select("*").eq("email", email).single();
  if (error || !data) return res.status(400).json({ error: "Usuário não encontrado." });

  const match = await bcrypt.compare(senha, data.senha);
  if (!match) return res.status(400).json({ error: "Senha incorreta." });

  const token = jwt.sign({ id_usu: data.id_usu, nome: data.nome }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ message: "Login realizado com sucesso!", token });
});

// Rota protegida (exemplo)
app.get("/perfil", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Token não fornecido" });

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ message: "Acesso permitido", usuario: decoded });
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
});

// ===== SERVIDOR =====
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
