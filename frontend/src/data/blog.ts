export type BlogSection = {
  heading?: string
  paragraphs?: string[]
  list?: string[]
}

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  date: string
  readingTime: string
  author: string
  sections: BlogSection[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'guia-battleye',
    title: 'Guia BattlEye: escolhendo o servidor certo em 2025',
    excerpt:
      'Explicamos como funciona o sistema BattlEye, quais são os impactos para iniciantes e como escolher o melhor mundo para começar sua jornada.',
    date: '2025-02-12',
    readingTime: '6 min',
    author: 'Equipe Tibia Pulse',
    sections: [
      {
        paragraphs: [
          'BattlEye é a camada de proteção contra bots usada em grande parte dos servidores de Tibia. Para quem está começando, entender essa diferença ajuda a evitar frustrações e a escolher comunidades mais saudáveis.',
        ],
      },
      {
        heading: 'Tipos de mundos',
        paragraphs: [
          'Os mundos são divididos em protegidos e não protegidos. Nos protegidos, BattlEye está ativo 24h e pune qualquer cliente modificado. Já os não protegidos dependem de ações manuais da CipSoft, o que significa convivência maior com scripts e jogadores focados em powergame.',
        ],
        list: [
          'Protegidos: recomendados para iniciantes, economia mais estável e menor chance de encontrar macroers.',
          'Não protegidos: comunidades antigas, competição maior por respawns e presença frequente de bots.',
        ],
      },
      {
        heading: 'Quando vale migrar?',
        paragraphs: [
          'Se você começou em um mundo protegido, só considere migrar quando dominar sua vocação e tiver recursos para competir. A transição costuma ser motivada por guilds específicas ou por economia mais aquecida para determinados itens.',
        ],
      },
      {
        heading: 'Checklist rápido antes de escolher um servidor',
        list: [
          'Verifique se o mundo está protegido diretamente no site oficial.',
          'Procure grupos ou comunidades locais (Discord/WhatsApp) ativos.',
          'Analise o horário de pico usando a seção de Worlds do Tibia Pulse.',
          'Prefira servidores próximos da sua região para reduzir o ping.',
        ],
      },
      {
        paragraphs: [
          'Para o TCC, vamos continuar documentando essas diferenças e propor trilhas específicas para cada tipo de mundo. O objetivo é que o jogador já comece sabendo quais riscos e vantagens cada servidor oferece.',
        ],
      },
    ],
  },
]

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}
