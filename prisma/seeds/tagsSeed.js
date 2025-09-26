import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tagsSeed = async () => {
  const tags = [
    { name: "Compositor(a)" },
    { name: "Multi-instrumentista" },
    { name: "Produtor(a) musical" },
    { name: "Arranjador(a)" },
    { name: "Estudante de música" },
    { name: "Backing vocal" },
    { name: "Experiência ao vivo" },
    { name: "Experiência com gravação" },
    { name: "Comercialização musical" },
    { name: "Disponível para viagens" },
    { name: "Profissional" },
    { name: "Amador" },
    { name: "Projeto independente" },
    { name: "Projeto autoral" },
    { name: "Projeto cover" },
    { name: "Colaborações criativas" },
    { name: "Músico para eventos" },
    { name: "Disponível para ensaios" },
    { name: "Localização flexível" },
    { name: "Sem Restrições geográficas" },
    { name: "Mente aberta" },
    { name: "Estilo único" },
    { name: "Tem estúdio" },
    { name: "Tem instrumentos" },
    { name: "Direção de show"}
  ];

  await prisma.tags.createMany({
    data: tags,
    skipDuplicates: true,
  });
  
  console.log("✅ Tags seeded successfully!");
};

export default tagsSeed;
