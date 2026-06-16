import type { BookCategory } from '@/types/bible'

export interface BibleBookData {
  /** Nombre para mostrar en español, con acentos */
  name: string
  /** Slug usado por la API (minúsculas, sin acentos, guiones) */
  slug: string
  /** Número de capítulos */
  chapters: number
  /** Categoría temática */
  category: BookCategory
  /** 'AT' = Antiguo Testamento, 'NT' = Nuevo Testamento */
  testament: 'AT' | 'NT'
  /** Alias/abreviaturas comunes para búsqueda */
  aliases?: string[]
}

export const BIBLE_BOOKS: BibleBookData[] = [
  // Antiguo Testamento
  { name: 'Génesis', slug: 'genesis', chapters: 50, category: 'torah', testament: 'AT', aliases: ['gn', 'gen'] },
  { name: 'Éxodo', slug: 'exodo', chapters: 40, category: 'torah', testament: 'AT', aliases: ['ex', 'exo'] },
  { name: 'Levítico', slug: 'levitico', chapters: 27, category: 'torah', testament: 'AT', aliases: ['lv', 'lev'] },
  { name: 'Números', slug: 'numeros', chapters: 36, category: 'torah', testament: 'AT', aliases: ['nm', 'num'] },
  { name: 'Deuteronomio', slug: 'deuteronomio', chapters: 34, category: 'torah', testament: 'AT', aliases: ['dt', 'deut'] },
  { name: 'Josué', slug: 'josue', chapters: 24, category: 'history', testament: 'AT', aliases: ['jos'] },
  { name: 'Jueces', slug: 'jueces', chapters: 21, category: 'history', testament: 'AT', aliases: ['jue'] },
  { name: 'Rut', slug: 'rut', chapters: 4, category: 'history', testament: 'AT', aliases: ['rt'] },
  { name: '1 Samuel', slug: '1-samuel', chapters: 31, category: 'history', testament: 'AT', aliases: ['1s', '1 sam'] },
  { name: '2 Samuel', slug: '2-samuel', chapters: 24, category: 'history', testament: 'AT', aliases: ['2s', '2 sam'] },
  { name: '1 Reyes', slug: '1-reyes', chapters: 22, category: 'history', testament: 'AT', aliases: ['1r', '1 re'] },
  { name: '2 Reyes', slug: '2-reyes', chapters: 25, category: 'history', testament: 'AT', aliases: ['2r', '2 re'] },
  { name: '1 Crónicas', slug: '1-cronicas', chapters: 29, category: 'history', testament: 'AT', aliases: ['1cr', '1 cron'] },
  { name: '2 Crónicas', slug: '2-cronicas', chapters: 36, category: 'history', testament: 'AT', aliases: ['2cr', '2 cron'] },
  { name: 'Esdras', slug: 'esdras', chapters: 10, category: 'history', testament: 'AT', aliases: ['esd'] },
  { name: 'Nehemías', slug: 'nehemias', chapters: 13, category: 'history', testament: 'AT', aliases: ['neh'] },
  { name: 'Ester', slug: 'ester', chapters: 10, category: 'history', testament: 'AT', aliases: ['est'] },
  { name: 'Job', slug: 'job', chapters: 42, category: 'wisdom', testament: 'AT', aliases: ['jb'] },
  { name: 'Salmos', slug: 'salmos', chapters: 150, category: 'wisdom', testament: 'AT', aliases: ['sal', 'salmo', 'sl'] },
  { name: 'Proverbios', slug: 'proverbios', chapters: 31, category: 'wisdom', testament: 'AT', aliases: ['pr', 'prov'] },
  { name: 'Eclesiastés', slug: 'eclesiastes', chapters: 12, category: 'wisdom', testament: 'AT', aliases: ['ec', 'ecl'] },
  { name: 'Cantares', slug: 'cantares', chapters: 8, category: 'wisdom', testament: 'AT', aliases: ['cnt', 'cantar'] },
  { name: 'Isaías', slug: 'isaias', chapters: 66, category: 'prophecy', testament: 'AT', aliases: ['is', 'isa'] },
  { name: 'Jeremías', slug: 'jeremias', chapters: 52, category: 'prophecy', testament: 'AT', aliases: ['jer'] },
  { name: 'Lamentaciones', slug: 'lamentaciones', chapters: 5, category: 'prophecy', testament: 'AT', aliases: ['lm', 'lam'] },
  { name: 'Ezequiel', slug: 'ezequiel', chapters: 48, category: 'prophecy', testament: 'AT', aliases: ['ez', 'eze'] },
  { name: 'Daniel', slug: 'daniel', chapters: 12, category: 'prophecy', testament: 'AT', aliases: ['dn', 'dan'] },
  { name: 'Oseas', slug: 'oseas', chapters: 14, category: 'prophecy', testament: 'AT', aliases: ['os'] },
  { name: 'Joel', slug: 'joel', chapters: 3, category: 'prophecy', testament: 'AT', aliases: ['jl'] },
  { name: 'Amós', slug: 'amos', chapters: 9, category: 'prophecy', testament: 'AT', aliases: ['am'] },
  { name: 'Abdías', slug: 'abdias', chapters: 1, category: 'prophecy', testament: 'AT', aliases: ['abd'] },
  { name: 'Jonás', slug: 'jonas', chapters: 4, category: 'prophecy', testament: 'AT', aliases: ['jon'] },
  { name: 'Miqueas', slug: 'miqueas', chapters: 7, category: 'prophecy', testament: 'AT', aliases: ['mi', 'miq'] },
  { name: 'Nahúm', slug: 'nahum', chapters: 3, category: 'prophecy', testament: 'AT', aliases: ['nah'] },
  { name: 'Habacuc', slug: 'habacuc', chapters: 3, category: 'prophecy', testament: 'AT', aliases: ['hab'] },
  { name: 'Sofonías', slug: 'sofonias', chapters: 3, category: 'prophecy', testament: 'AT', aliases: ['sof'] },
  { name: 'Hageo', slug: 'hageo', chapters: 2, category: 'prophecy', testament: 'AT', aliases: ['hag'] },
  { name: 'Zacarías', slug: 'zacarias', chapters: 14, category: 'prophecy', testament: 'AT', aliases: ['zac'] },
  { name: 'Malaquías', slug: 'malaquias', chapters: 4, category: 'prophecy', testament: 'AT', aliases: ['mal'] },

  // Nuevo Testamento
  { name: 'Mateo', slug: 'mateo', chapters: 28, category: 'gospel', testament: 'NT', aliases: ['mt', 'mat'] },
  { name: 'Marcos', slug: 'marcos', chapters: 16, category: 'gospel', testament: 'NT', aliases: ['mr', 'mar', 'mc'] },
  { name: 'Lucas', slug: 'lucas', chapters: 24, category: 'gospel', testament: 'NT', aliases: ['lc', 'luc'] },
  { name: 'Juan', slug: 'juan', chapters: 21, category: 'gospel', testament: 'NT', aliases: ['jn', 'jua'] },
  { name: 'Hechos', slug: 'hechos', chapters: 28, category: 'history', testament: 'NT', aliases: ['hch', 'hech'] },
  { name: 'Romanos', slug: 'romanos', chapters: 16, category: 'epistle', testament: 'NT', aliases: ['ro', 'rom'] },
  { name: '1 Corintios', slug: '1-corintios', chapters: 16, category: 'epistle', testament: 'NT', aliases: ['1co', '1 cor'] },
  { name: '2 Corintios', slug: '2-corintios', chapters: 13, category: 'epistle', testament: 'NT', aliases: ['2co', '2 cor'] },
  { name: 'Gálatas', slug: 'galatas', chapters: 6, category: 'epistle', testament: 'NT', aliases: ['ga', 'gal'] },
  { name: 'Efesios', slug: 'efesios', chapters: 6, category: 'epistle', testament: 'NT', aliases: ['ef', 'efe'] },
  { name: 'Filipenses', slug: 'filipenses', chapters: 4, category: 'epistle', testament: 'NT', aliases: ['fil', 'flp'] },
  { name: 'Colosenses', slug: 'colosenses', chapters: 4, category: 'epistle', testament: 'NT', aliases: ['col'] },
  { name: '1 Tesalonicenses', slug: '1-tesalonicenses', chapters: 5, category: 'epistle', testament: 'NT', aliases: ['1ts', '1 tes'] },
  { name: '2 Tesalonicenses', slug: '2-tesalonicenses', chapters: 3, category: 'epistle', testament: 'NT', aliases: ['2ts', '2 tes'] },
  { name: '1 Timoteo', slug: '1-timoteo', chapters: 6, category: 'epistle', testament: 'NT', aliases: ['1ti', '1 tim'] },
  { name: '2 Timoteo', slug: '2-timoteo', chapters: 4, category: 'epistle', testament: 'NT', aliases: ['2ti', '2 tim'] },
  { name: 'Tito', slug: 'tito', chapters: 3, category: 'epistle', testament: 'NT', aliases: ['tit'] },
  { name: 'Filemón', slug: 'filemon', chapters: 1, category: 'epistle', testament: 'NT', aliases: ['flm'] },
  { name: 'Hebreos', slug: 'hebreos', chapters: 13, category: 'epistle', testament: 'NT', aliases: ['he', 'heb'] },
  { name: 'Santiago', slug: 'santiago', chapters: 5, category: 'epistle', testament: 'NT', aliases: ['stg', 'sant'] },
  { name: '1 Pedro', slug: '1-pedro', chapters: 5, category: 'epistle', testament: 'NT', aliases: ['1p', '1 ped'] },
  { name: '2 Pedro', slug: '2-pedro', chapters: 3, category: 'epistle', testament: 'NT', aliases: ['2p', '2 ped'] },
  { name: '1 Juan', slug: '1-juan', chapters: 5, category: 'epistle', testament: 'NT', aliases: ['1jn', '1 jn'] },
  { name: '2 Juan', slug: '2-juan', chapters: 1, category: 'epistle', testament: 'NT', aliases: ['2jn', '2 jn'] },
  { name: '3 Juan', slug: '3-juan', chapters: 1, category: 'epistle', testament: 'NT', aliases: ['3jn', '3 jn'] },
  { name: 'Judas', slug: 'judas', chapters: 1, category: 'epistle', testament: 'NT', aliases: ['jud'] },
  { name: 'Apocalipsis', slug: 'apocalipsis', chapters: 22, category: 'prophecy', testament: 'NT', aliases: ['ap', 'apoc'] },
]

/** Quita acentos y pasa a minúsculas para comparación */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

/** Encuentra un libro por nombre, slug o alias (coincidencia exacta tras normalizar) */
export function findBook(query: string): BibleBookData | null {
  const n = normalize(query)
  return (
    BIBLE_BOOKS.find(
      (b) =>
        normalize(b.name) === n ||
        b.slug === n.replace(/\s+/g, '-') ||
        b.aliases?.some((a) => normalize(a) === n),
    ) ?? null
  )
}

/** Devuelve libros cuyo nombre o alias empieza/contiene el texto (para autocompletado) */
export function searchBooks(query: string, limit = 8): BibleBookData[] {
  const n = normalize(query)
  if (!n) return []

  const starts: BibleBookData[] = []
  const contains: BibleBookData[] = []

  for (const book of BIBLE_BOOKS) {
    const name = normalize(book.name)
    if (name.startsWith(n) || book.aliases?.some((a) => normalize(a).startsWith(n))) {
      starts.push(book)
    } else if (name.includes(n)) {
      contains.push(book)
    }
  }

  return [...starts, ...contains].slice(0, limit)
}
