const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Configurar seu Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware de autenticação
async function protectedRoute(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) return res.status(401).json({ error: "Token não enviado" });

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user)
      return res.status(401).json({ error: "Token inválido" });

    req.user = data.user;
    next();
  } catch (err) {
    res.status(500).json({ error: "Erro interno" });
  }
}

/* ======================================================
   CRUD AUTOR
====================================================== */

// GET (sem login)
app.get("/autor", async (req, res) => {
  const { data } = await supabase.from("autor").select("*");
  res.json(data);
});

// GET por id
app.get("/autor/:id", async (req, res) => {
  const { data } = await supabase.from("autor").select("*").eq("id", req.params.id).single();
  res.json(data);
});

// POST (precisa estar logado)
app.post("/autor", protectedRoute, async (req, res) => {
  const { nome } = req.body;
  const { data, error } = await supabase.from("autor").insert({ nome }).select();
  res.json(error || data);
});

// PUT
app.put("/autor/:id", protectedRoute, async (req, res) => {
  const { nome } = req.body;
  const { data, error } = await supabase.from("autor").update({ nome }).eq("id", req.params.id).select();
  res.json(error || data);
});

// DELETE
app.delete("/autor/:id", protectedRoute, async (req, res) => {
  const { data, error } = await supabase.from("autor").delete().eq("id", req.params.id);
  res.json(error || data);
});

/* ======================================================
   CRUD LIVRO
====================================================== */

app.get("/livro", async (req, res) => {
  const { data } = await supabase.from("livro").select("*, autor(*)");
  res.json(data);
});

app.get("/livro/:id", async (req, res) => {
  const { data } = await supabase.from("livro").select("*, autor(*)").eq("id", req.params.id).single();
  res.json(data);
});

app.post("/livro", protectedRoute, async (req, res) => {
  const { titulo, ano, autor_id } = req.body;
  const { data, error } = await supabase.from("livro").insert({ titulo, ano, autor_id }).select();
  res.json(error || data);
});

app.put("/livro/:id", protectedRoute, async (req, res) => {
  const { titulo, ano, autor_id } = req.body;
  const { data, error } = await supabase.from("livro").update({ titulo, ano, autor_id }).eq("id", req.params.id).select();
  res.json(error || data);
});

app.delete("/livro/:id", protectedRoute, async (req, res) => {
  const { data, error } = await supabase.from("livro").delete().eq("id", req.params.id);
  res.json(error || data);
});

/* ======================================================
   CRUD DVD
====================================================== */

app.get("/dvd", async (req, res) => {
  const { data } = await supabase.from("dvd").select("*, autor(*)");
  res.json(data);
});

app.get("/dvd/:id", async (req, res) => {
  const { data } = await supabase.from("dvd").select("*, autor(*)").eq("id", req.params.id).single();
  res.json(data);
});

app.post("/dvd", protectedRoute, async (req, res) => {
  const { titulo, duracao, autor_id } = req.body;
  const { data, error } = await supabase.from("dvd").insert({ titulo, duracao, autor_id }).select();
  res.json(error || data);
});

app.put("/dvd/:id", protectedRoute, async (req, res) => {
  const { titulo, duracao, autor_id } = req.body;
  const { data, error } = await supabase.from("dvd").update({ titulo, duracao, autor_id }).eq("id", req.params.id).select();
  res.json(error || data);
});

app.delete("/dvd/:id", protectedRoute, async (req, res) => {
  const { data, error } = await supabase.from("dvd").delete().eq("id", req.params.id);
  res.json(error || data);
});

/* ======================================================
   CRUD CD
====================================================== */

app.get("/cd", async (req, res) => {
  const { data } = await supabase.from("cd").select("*, autor(*)");
  res.json(data);
});

app.get("/cd/:id", async (req, res) => {
  const { data } = await supabase.from("cd").select("*, autor(*)").eq("id", req.params.id).single();
  res.json(data);
});

app.post("/cd", protectedRoute, async (req, res) => {
  const { titulo, faixas, autor_id } = req.body;
  const { data, error } = await supabase.from("cd").insert({ titulo, faixas, autor_id }).select();
  res.json(error || data);
});

app.put("/cd/:id", protectedRoute, async (req, res) => {
  const { titulo, faixas, autor_id } = req.body;
  const { data, error } = await supabase.from("cd").update({ titulo, faixas, autor_id }).eq("id", req.params.id).select();
  res.json(error || data);
});

app.delete("/cd/:id", protectedRoute, async (req, res) => {
  const { data, error } = await supabase.from("cd").delete().eq("id", req.params.id);
  res.json(error || data);
});

/* ======================================================
   AUTENTICAÇÃO
====================================================== */

app.post("/auth/login", async (req, res) => {
  const { email, senha } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  });

  res.json(error || data);
});

// Google
app.get("/auth/google", async (req, res) => {
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: "http://localhost:3000", }
  });
  res.json(data);
});

// Facebook
app.get("/auth/facebook", async (req, res) => {
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo: "http://localhost:3000", }
  });
  res.json(data);
});

/* ====================================================== */

app.listen(3000, () => console.log("API rodando na porta 3000"));
