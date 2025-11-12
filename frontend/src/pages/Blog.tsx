import { Link } from 'react-router-dom'
import Container from '@/components/Container'
import { blogPosts } from '@/data/blog'

export default function Blog() {
  return (
    <Container>
      <div className="space-y-4">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Blog</p>
          <h1 className="text-3xl font-semibold text-white">Guia para iniciantes</h1>
          <p className="text-sm text-white/70 max-w-2xl">
            Artigos curtos com recomendações de servidores, economia e progresso — escritos como complemento ao TCC.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white shadow-lg"
            >
              <p className="text-xs uppercase tracking-wide text-white/60">
                {new Date(post.date).toLocaleDateString('pt-BR')} • {post.readingTime}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{post.title}</h2>
              <p className="mt-1 text-sm text-white/70">{post.excerpt}</p>
              <Link
                to={`/blog/${post.slug}`}
                className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-300 hover:text-emerald-200"
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
