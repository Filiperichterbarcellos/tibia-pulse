import { Link } from 'react-router-dom'
import Container from '@/components/Container'
import { blogPosts } from '@/data/blog'

export default function Blog() {
  return (
    <Container>
      <div className="space-y-4 text-[#1b1f3b]">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-[#7b7fb7]">Blog</p>
          <h1 className="text-3xl font-semibold">Guia para iniciantes</h1>
          <p className="text-sm text-[#5f628c] max-w-2xl">
            Artigos curtos com recomendações de servidores, economia e progresso — escritos como complemento ao TCC.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-3xl border border-[#dfe3ff] bg-white p-5 text-[#1b1f3b] shadow-xl"
            >
              <p className="text-xs uppercase tracking-wide text-[#8a8ebf]">
                {new Date(post.date).toLocaleDateString('pt-BR')} • {post.readingTime}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{post.title}</h2>
              <p className="mt-2 text-sm text-[#616492]">{post.excerpt}</p>
              <Link
                to={`/blog/${post.slug}`}
                className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-500"
              >
                Ler artigo →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </Container>
  )
}
