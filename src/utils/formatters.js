const ALLOWED_FIRST_MESSAGES = [
  "Olá! Quero mais informações sobre os JOGOS SESI 2025, por favor.",
  "Olá! Tenho interesse no pacote Férias Escolares SESI Saúde, quero informações!",
  "Olá! Tenho interesse no pacote de Saúde Ocular do SESI Saúde, quero informações!",
  "Quero falar mais sobre o Curso de Tecnologia da Construção a Seco",
  "Quero falar sobre o curso de Eletricidade Aplicada",
  "Olá, gostaria de saber mais informações sobre Matrícula do SESI 2026",
  "Jornada Dev",
  "Quero falar sobre o curso de Soldador MIG/MAG",
  "Quero saber mais informações sobre o curso de Excel Avançado",
  "Gostaria de mais informações sobre o curso de Comandos Elétricos",
  "Quero falar sobre o curso Técnico de  Biotecnologia",
  "Quero falar sobre o curso de Instalação e Higienização de Ar-condicionado",
  "Quero falar sobre o curso de Mecânico de Refrigeração",
  "Quero informações sobre o curso de Operador de Empilhadeira",
  "Quero falar sobre o curso de Eletricista Industrial",
  "Quero Saber mais sobre o curso de Montagem de Quadro de Distribuição",
  "Quero saber mais informações sobre o curso Informática Básica",
  "Quero saber mais informações sobre o curso Informática Básica e Avançada",
  "Quero saber mais informações sobre o curso de Mestre de Obras",
  "Quero falar sobre o curso de Orçamento de Obras",
  "Quero informações sobre o curso de Assistente Administrativo",
  "Gostaria de mais informações sobre o curso de Eletricista Instalador",
  "Olá, gostaria de saber mais informações sobre a Colônia de Férias do SESI",
  "Gostaria de mais informações sobre o curso técnico em Automação",
  "Gostaria de mais informações sobre o curso técnico em Mecânica",
  "Gostaria de informações sobre o curso de instalação e higienização de split",
  "Quero falar sobre o curso de Modelista Industrial em Sistema CAD no Vestuário",
  "Quero falar sobre o curso de Programador de Bordadeira Industrial",
  "Quero falar sobre o curso de Costureiro Operador de Máquina Overlock e Interlock",
  "Quero falar sobre o curso de Costureiro Operador de Máquina de Prep e Acabamento",
  "Quero falar sobre o curso de Costureiro Operador de Máquina Reta",
  "Quero falar sobre o curso de Manutenção de Máquinas de Costura",
  "Gostaria de informações sobre o curso técnico em Refrigeração e Climatização",
  "Gostaria de informações sobre o curso de Mecânico de Refrigeração",
  "Gostaria de mais informações sobre o curso de Cronometrista",
  "Olá! Tenho interesse no curso de Vantagens Tributárias da ZF de Manaus",
  "Quero saber mais informações sobre o curso de Montagem de Quadros Elétricos",
  "Quero saber mais informações sobre o Curso NR35",
  "Olá, gostaria de saber mais informações sobre consultas no SESI Saúde",
  "Quero saber mais informações sobre o curso de Informática Avançada",
  "Quero saber sobre o curso de Leitura e Interpretação de Projetos",
  "Quero falar mais sobre o Curso de Planejamento para Construção de Edificações",
  "Quero falar mais sobre o Curso de Elaboração de Projetos de Combate a Incêndio",
  "Quero falar sobre o curso de Eletricista Instalador Predial de Baixa Tensão",
  "Quero falar mais sobre o Curso de Elaboração de Projetos para Construção Civil",
  "Quero falar mais sobre o Curso de NR10",
  "Olá, gostaria de saber mais informações sobre Matrícula do SESI EJA PRO",
  "Quero falar sobre o curso de Modelagem para Construção Civil",
  "Quero falar sobre o curso de Eletricista de Automóveis",
  "Quero falar sobre o curso de Mecânico de Manutenção em Automóveis",
  "Quero falar sobre o curso de Mecânico de Manutenção em Motocicletas",
  "PSICÓLOGO",
  "Enviar documento",
  "Realizar matrícula",
  "CURSOS GRATUITOS",
  "SIM",
  "NÃO",
  "GARANTIR MATRÍCULA",
  "FAZER MATRICULA",
  "MATRÍCULA",
  "MATRICULAR AGORA",
  "Reservar agora",
  "CLÍNICA MEDICA",
  "NUTRICIONISTA",
  "FISIOTERAPIA",
  "CONFIRMAR",
  "REAGENDAR",
  "CONFIRMA",
  "NÃO CONFIRMO",
  "CRONOMETRISTA",
  "Quero falar sobre o curso de Mecânico de Manutenção em Motores à Diesel",
  "COSTUREIRO OPERADOR",
  "EXCEL AVANÇADO",
  "NR10",
  "CONSTRUÇÃO A SECO",
  "MESTRE DE OBRAS",
  "SOLDADOR DE ELETRODO",
  "ELETRICISTA",
  "INFORMATICA AVANÇADA",
  "Quero falar sobre o curso de Soldador de Eletrodo Revestido",
  "Marceneiro de Moveis",
  "PACOTE ALUNOS SESI",
  "CURSOS ELETRICIDADE"
];

function normalizeText(text) {
  return String(text || "")
    .replace(/\u00A0/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isTargetMenu(message) {
  const text = normalizeText(message);
  return text.startsWith("digite o numero da opcao desejada");
}

function extractMenuOptions(message) {
  if (typeof message !== "string") return {};

  const options = {};
  const regex = /^\s*\*?\s*(\d+)\s*-\s*(.+)$/gm;

  let match;
  while ((match = regex.exec(message)) !== null) {
    const optionNumber = match[1].trim();
    const optionLabel = match[2].trim();
    options[optionNumber] = optionLabel;
  }

  return options;
}

function getSelectedOptionData(talks) {
  if (!Array.isArray(talks)) {
    return { selectedOption: "false", selectedOptionLabel: "false" };
  }

  const orderedTalks = [...talks].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  let currentMenu = null;

  for (const talk of orderedTalks) {
    const message = String(talk.message || "").trim();

    if (talk.origin === "auto" && isTargetMenu(message)) {
      const menuOptions = extractMenuOptions(message);
      if (Object.keys(menuOptions).length > 0) {
        currentMenu = menuOptions;
      }
      continue;
    }

    if (talk.origin === "channel" && currentMenu) {
      const replyMsg = String(talk.interactive || talk.message || "").trim();
      if (Object.prototype.hasOwnProperty.call(currentMenu, replyMsg)) {
        return {
          selectedOption: replyMsg,
          selectedOptionLabel: currentMenu[replyMsg],
        };
      }
      return { selectedOption: "false", selectedOptionLabel: "false" };
    }
  }

  return { selectedOption: "false", selectedOptionLabel: "false" };
}

function getFirstClientMessage(talks) {
  if (!Array.isArray(talks)) return "false";

  const orderedTalks = [...talks].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  for (const talk of orderedTalks) {
    if (talk.origin === "channel") {
      const rawMessage = String(talk.interactive || talk.message || "").trim();
      if (!rawMessage) {
        return "false";
      }
      const normalizedAllowed = new Set(
        ALLOWED_FIRST_MESSAGES.map(normalizeText)
      );
      return normalizedAllowed.has(normalizeText(rawMessage)) ? rawMessage : "false";
    }
  }

  return "false";
}

function getVariaveis(tags) {
  if (!Array.isArray(tags)) return "false";

  const variavel = tags.find((tag) => {
    if (!tag || tag.type !== "custom") return false;

    const tagName = String(tag.tag || "").trim().toUpperCase();
    const answer = String(tag.answer || "").trim();

    return !tagName.includes("FLOW") && tagName !== "NUMBER" && !!answer;
  });

  return variavel ? String(variavel.answer).trim() : "false";
}

export function formatConversationData(conversation) {
  const talks = Array.isArray(conversation?.talks) ? conversation.talks : [];
  const tags = Array.isArray(conversation?.tags) ? conversation.tags : [];

  const optionData = getSelectedOptionData(talks);
  const firstClientMessage = getFirstClientMessage(talks);
  const variaveis = getVariaveis(tags);

  return {
    ...conversation,
    selectedOption: optionData.selectedOption,
    selectedOptionLabel: optionData.selectedOptionLabel,
    firstClientMessage,
    variaveis,
  };
}

export function parseAIResponse(text) {
  const output = text || "";
  const lines = output.split("\n");

  const extract = (line) =>
    line
      .replace(/^[^:]+:\s*/, "")
      .replace(/\*/g, "")
      .trim();

  const formatDate = (data) => {
    if (!data) return "false";
    return data.split(".")[0];
  };

  const validLines = lines.filter((l) =>
    !l.includes("Caso precise usar") &&
    (
      l.includes("Contato:") ||
      l.includes("Canal:") ||
      l.includes("Data e Hora de Início:") ||
      l.includes("Data e Hora de fim:") ||
      l.includes("Tipo de Canal:") ||
      l.includes("Resumo da conversa:") ||
      l.includes("Casa:")
    )
  );

  return {
    Contato: extract(validLines[0] || ""),
    Canal: extract(validLines[1] || ""),
    "Data Inicio": formatDate(extract(validLines[2] || "")),
    "Data Fim": formatDate(extract(validLines[3] || "")),
    "Tipo Canal": extract(validLines[4] || ""),
    Resumo: extract(validLines[5] || ""),
    Casa: extract(validLines[6] || ""),
  };
}
