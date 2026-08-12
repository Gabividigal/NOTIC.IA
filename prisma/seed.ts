import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const temas = [
  "Economia",
  "Agronegócio",
  "Esportes",
  "Política",
  "Tecnologia",
  "Saúde",
  "Educação",
  "Meio Ambiente",
  "Entretenimento",
  "Ciência",
  "Internacional",
  "Direito",
  "Startups",
  "Imóveis",
  "Turismo",
];

function diasAtras(dias: number) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return data;
}

async function main() {
  const themes = await Promise.all(
    temas.map((nome) =>
      prisma.theme.upsert({
        where: { nome },
        update: {},
        create: { nome },
      }),
    ),
  );

  const themeByNome = Object.fromEntries(themes.map((t) => [t.nome, t.id]));

  await prisma.chatMessage.deleteMany();
  await prisma.news.deleteMany();

  const noticias = [
    {
      titulo: "Banco Central mantém taxa de juros e sinaliza cautela para os próximos meses",
      resumoIA:
        "O Comitê de Política Monetária decidiu manter a taxa básica de juros inalterada. A decisão reflete preocupação com a inflação de serviços. Analistas esperam nova avaliação na próxima reunião.",
      nomeFonte: "Folha Econômica",
      linkFonte: "https://exemplo.com/economia/juros-mantidos",
      tema: "Economia",
      dias: 0,
    },
    {
      titulo: "Dólar recua após dados de emprego nos Estados Unidos",
      resumoIA:
        "A moeda americana perdeu força frente ao real após números do mercado de trabalho ficarem abaixo do esperado. Investidores reavaliam expectativas sobre juros globais.",
      nomeFonte: "Mercado Aberto",
      linkFonte: "https://exemplo.com/economia/dolar-recua",
      tema: "Economia",
      dias: 2,
    },
    {
      titulo: "Safra de soja deve bater recorde na próxima temporada, aponta levantamento",
      resumoIA:
        "Consultoria agrícola projeta aumento de produção impulsionado por condições climáticas favoráveis. Produtores do Centro-Oeste lideram a expansão da área plantada.",
      nomeFonte: "Agro Notícias",
      linkFonte: "https://exemplo.com/agro/safra-recorde",
      tema: "Agronegócio",
      dias: 1,
    },
    {
      titulo: "Exportações de carne bovina crescem 12% no primeiro semestre",
      resumoIA:
        "Dados da associação do setor mostram alta impulsionada pela demanda da Ásia. China segue como principal destino das exportações brasileiras.",
      nomeFonte: "Rural Hoje",
      linkFonte: "https://exemplo.com/agro/exportacao-carne",
      tema: "Agronegócio",
      dias: 4,
    },
    {
      titulo: "Seleção brasileira convoca jogadores para amistosos internacionais",
      resumoIA:
        "Comissão técnica anunciou lista com novidades para os próximos jogos preparatórios. Treinador destacou renovação do elenco e foco em testes táticos.",
      nomeFonte: "Esporte Total",
      linkFonte: "https://exemplo.com/esportes/convocacao-selecao",
      tema: "Esportes",
      dias: 0,
    },
    {
      titulo: "Final do campeonato nacional é definida para o próximo fim de semana",
      resumoIA:
        "As duas equipes finalistas se enfrentam em jogo único após campanhas equilibradas na fase de grupos. Ingressos já estão à venda para torcedores.",
      nomeFonte: "Gazeta Esportiva Digital",
      linkFonte: "https://exemplo.com/esportes/final-campeonato",
      tema: "Esportes",
      dias: 3,
    },
    {
      titulo: "Congresso retoma discussão sobre reforma tributária no próximo mês",
      resumoIA:
        "Líderes partidários se reuniram para alinhar cronograma de votações. Pontos sobre alíquotas setoriais ainda geram divergência entre bancadas.",
      nomeFonte: "Política em Foco",
      linkFonte: "https://exemplo.com/politica/reforma-tributaria",
      tema: "Política",
      dias: 1,
    },
    {
      titulo: "Governo anuncia pacote de investimentos em infraestrutura",
      resumoIA:
        "Novo plano prevê recursos para rodovias, portos e saneamento em diversos estados. Anúncio ocorreu durante evento com governadores e ministros.",
      nomeFonte: "Diário Nacional",
      linkFonte: "https://exemplo.com/politica/pacote-infraestrutura",
      tema: "Política",
      dias: 5,
    },
    {
      titulo: "Startup brasileira lança modelo de IA voltado para o setor jurídico",
      resumoIA:
        "Ferramenta promete automatizar análise de contratos e reduzir tempo de trabalho de escritórios de advocacia. Empresa já fechou parcerias com grandes bancos.",
      nomeFonte: "Tech Brasil",
      linkFonte: "https://exemplo.com/tecnologia/ia-juridica",
      tema: "Tecnologia",
      dias: 0,
    },
    {
      titulo: "Novo chip nacional promete acelerar produção de eletrônicos no país",
      resumoIA:
        "Consórcio de empresas e universidades apresentou protótipo de semicondutor desenvolvido no Brasil. Projeto busca reduzir dependência de importações do setor.",
      nomeFonte: "Inovação Diária",
      linkFonte: "https://exemplo.com/tecnologia/chip-nacional",
      tema: "Tecnologia",
      dias: 2,
    },
  ];

  for (const noticia of noticias) {
    await prisma.news.create({
      data: {
        titulo: noticia.titulo,
        resumoIA: noticia.resumoIA,
        nomeFonte: noticia.nomeFonte,
        linkFonte: noticia.linkFonte,
        dataPublicacao: diasAtras(noticia.dias),
        themeId: themeByNome[noticia.tema],
      },
    });
  }

  console.log(`Seed concluído: ${themes.length} temas e ${noticias.length} notícias criadas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
