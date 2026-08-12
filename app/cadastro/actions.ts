"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

interface RegistrarInput {
  nome: string;
  email: string;
  senha: string;
  dataNascimento: string;
  areaAtuacao: string;
  temaIds: string[];
}

type RegistrarResultado = { ok: true } | { ok: false; erro: string };

export async function registrarUsuario(input: RegistrarInput): Promise<RegistrarResultado> {
  const nome = input.nome.trim();
  const email = input.email.trim().toLowerCase();
  const areaAtuacao = input.areaAtuacao.trim();

  if (!nome || !email || !input.senha || !input.dataNascimento || !areaAtuacao) {
    return { ok: false, erro: "Preencha todos os campos obrigatórios." };
  }

  if (input.senha.length < 6) {
    return { ok: false, erro: "A senha deve ter pelo menos 6 caracteres." };
  }

  if (input.temaIds.length !== 3) {
    return { ok: false, erro: "Selecione exatamente 3 interesses." };
  }

  const dataNascimento = new Date(input.dataNascimento);
  if (Number.isNaN(dataNascimento.getTime())) {
    return { ok: false, erro: "Data de nascimento inválida." };
  }

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return { ok: false, erro: "Email já cadastrado." };
  }

  const temasValidos = await prisma.theme.findMany({
    where: { id: { in: input.temaIds } },
  });
  if (temasValidos.length !== 3) {
    return { ok: false, erro: "Selecione exatamente 3 interesses válidos." };
  }

  const senhaHash = await bcrypt.hash(input.senha, 10);

  await prisma.user.create({
    data: {
      nome,
      email,
      senha: senhaHash,
      dataNascimento,
      areaAtuacao,
      temas: {
        create: input.temaIds.map((themeId) => ({ themeId })),
      },
    },
  });

  return { ok: true };
}
