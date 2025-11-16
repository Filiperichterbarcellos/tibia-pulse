import { Link, useParams } from 'react-router-dom'
import Container from '@/components/Container'
import { getPostBySlug } from '@/data/blog'

export default function Post() {
  const { slug = '' } = useParams()
  const post = slug ? getPostBySlug(slug) : null

  if (!post) {
    return (
      <Container>
        <div className="rounded-3xl border border-[#dfe3ff] bg-white p-6 text-[#1b1f3b]">
          <p className="text-lg font-semibold">Artigo não encontrado</p>
          <p className="text-sm text-[#5f628c]">Verifique o link ou volte para a lista de posts.</p>
          <Link to="/blog" className="mt-4 inline-flex text-emerald-600">
            ← Voltar ao blog
          </Link>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <article className="space-y-6 text-[#1b1f3b]">
        <Link to="/blog" className="text-sm text-emerald-600">
          ← Voltar ao blog
        </Link>
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-[#8a8ebf]">
            {new Date(post.date).toLocaleDateString('pt-BR')} • {post.readingTime}
          </p>
          <h1 className="text-3xl font-semibold">{post.title}</h1>
          <p className="text-sm text-[#5f628c]">Por {post.author}</p>
          <p className="text-base text-[#4a4c73]">{post.excerpt}</p>
        </header>

        <div className="space-y-6 rounded-3xl border border-[#dfe3ff] bg-white p-6 shadow-lg">
          {post.sections.map((section, index) => (
            <section key={section.heading ?? `section-${index}`} className="space-y-3">
              {section.heading && (
                <h2 className="text-xl font-semibold text-[#1b1f3b]">{section.heading}</h2>
              )}
              {section.paragraphs?.map((paragraph, idx) => (
                <p key={idx} className="text-base leading-relaxed text-[#4a4c73]">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="list-disc space-y-1 pl-5 text-sm text-[#4a4c73]">
                  {section.list.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </Container>
  )
}
