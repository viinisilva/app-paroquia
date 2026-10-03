const ids = (prefix: string, count: number) =>
  Array.from(
    { length: count },
    (_, index) => `${prefix}000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  );

export const demoIds = {
  users: ids('21', 5),
  masses: ids('22', 4),
  events: ids('23', 3),
  notices: ids('24', 3),
  readings: ids('25', 7),
} as const;

function saoPauloDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function nextSunday(date: string) {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const offset = (7 - weekday) % 7 || 7;
  return addDays(date, offset);
}

export function buildDemoData(memberEmail: string) {
  const today = saoPauloDate();
  const firstSunday = nextSunday(today);
  const secondSunday = addDays(firstSunday, 7);
  const thirdSunday = addDays(firstSunday, 14);
  const communityMassDate = addDays(firstSunday, 3);

  return {
    today,
    members: [
      {
        id: demoIds.users[0],
        name: 'Ana Souza',
        email: memberEmail,
        phone: '(00) 90000-1001',
        community: 'Igreja Matriz',
        daysAgo: 72,
      },
      {
        id: demoIds.users[1],
        name: 'Carlos Oliveira',
        email: 'carlos.oliveira.demo@example.com',
        phone: '(00) 90000-1002',
        community: 'Comunidade São José',
        daysAgo: 58,
      },
      {
        id: demoIds.users[2],
        name: 'Mariana Santos',
        email: 'mariana.santos.demo@example.com',
        phone: '(00) 90000-1003',
        community: 'Comunidade Santa Rita',
        daysAgo: 43,
      },
      {
        id: demoIds.users[3],
        name: 'João Almeida',
        email: 'joao.almeida.demo@example.com',
        phone: '(00) 90000-1004',
        community: 'Igreja Matriz',
        daysAgo: 31,
      },
      {
        id: demoIds.users[4],
        name: 'Beatriz Ferreira',
        email: 'beatriz.ferreira.demo@example.com',
        phone: '(00) 90000-1005',
        community: 'Comunidade São José',
        daysAgo: 19,
      },
    ],
    masses: [
      {
        id: demoIds.masses[0],
        date: firstSunday,
        time: '07:30',
        location: 'Igreja Matriz',
        celebrant: 'Pe. Pedro Henrique',
        description: 'Missa dominical com a comunidade paroquial.',
      },
      {
        id: demoIds.masses[1],
        date: communityMassDate,
        time: '19:30',
        location: 'Comunidade São José',
        celebrant: 'Pe. Pedro Henrique',
        description: 'Celebração semanal da comunidade São José.',
      },
      {
        id: demoIds.masses[2],
        date: secondSunday,
        time: '09:00',
        location: 'Igreja Matriz',
        celebrant: 'Pe. Marcos Antônio',
        description: 'Celebração da manhã para famílias e agentes pastorais.',
      },
      {
        id: demoIds.masses[3],
        date: thirdSunday,
        time: '18:00',
        location: 'Comunidade Santa Rita',
        celebrant: 'Pe. Marcos Antônio',
        description: 'Celebração vespertina da comunidade Santa Rita.',
      },
    ],
    events: [
      {
        id: demoIds.events[0],
        title: 'Ensaio do Coral',
        date: firstSunday,
        time: '16:00',
        location: 'Salão Paroquial',
        description: 'Preparação musical para as próximas celebrações.',
      },
      {
        id: demoIds.events[1],
        title: 'Encontro de Jovens',
        date: addDays(firstSunday, 6),
        time: '18:30',
        location: 'Centro Comunitário',
        description: 'Momento de convivência, formação e partilha entre os jovens.',
      },
      {
        id: demoIds.events[2],
        title: 'Campanha de Arrecadação',
        date: secondSunday,
        time: '10:30',
        location: 'Pátio da Igreja Matriz',
        description: 'Recebimento de alimentos não perecíveis para as famílias acompanhadas.',
      },
    ],
    notices: [
      {
        id: demoIds.notices[0],
        title: 'Campanha de arrecadação',
        content:
          'Durante este mês, a paróquia receberá alimentos não perecíveis na secretaria e após as celebrações.',
        publishedAt: today,
      },
      {
        id: demoIds.notices[1],
        title: 'Atenção aos horários das celebrações',
        content:
          'Consulte a agenda paroquial antes de sair de casa e acompanhe possíveis atualizações de horário.',
        publishedAt: addDays(today, -1),
      },
      {
        id: demoIds.notices[2],
        title: 'Encontro da comunidade',
        content:
          'As lideranças e famílias estão convidadas para um momento de convivência no Salão Paroquial.',
        publishedAt: addDays(today, -2),
      },
    ],
    readings: [
      {
        id: demoIds.readings[0],
        date: today,
        title: 'Liturgia demonstrativa do dia',
        type: 'FIRST' as const,
        reference: 'Referência demonstrativa',
        content:
          'Conteúdo breve de demonstração para validar a experiência de leitura no aplicativo. Consulte sempre uma fonte litúrgica oficial para uso pastoral.',
      },
      {
        id: demoIds.readings[1],
        date: today,
        title: 'Liturgia demonstrativa do dia',
        type: 'PSALM' as const,
        reference: 'Resposta demonstrativa',
        content:
          'Resposta curta preparada exclusivamente para a homologação visual da página de leituras.',
      },
      {
        id: demoIds.readings[2],
        date: today,
        title: 'Liturgia demonstrativa do dia',
        type: 'GOSPEL' as const,
        reference: 'Referência demonstrativa',
        content:
          'Trecho editorial demonstrativo, sem reprodução de texto bíblico, usado somente para testar a apresentação do Evangelho.',
      },
      ...(['FIRST', 'PSALM', 'SECOND', 'GOSPEL'] as const).map((type, index) => ({
        id: demoIds.readings[index + 3],
        date: firstSunday,
        title: 'Celebração dominical demonstrativa',
        type,
        reference: 'Referência demonstrativa',
        content:
          'Conteúdo próprio e breve para homologação acadêmica. A publicação pastoral deverá utilizar uma fonte litúrgica oficial e conferida.',
      })),
    ].map((reading) => ({
      ...reading,
      source: 'Conteúdo demonstrativo próprio para homologação acadêmica — não litúrgico.',
    })),
  };
}
