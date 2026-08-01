import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <section>
      <h1>Страница не найдена</h1>
      <p>Проверьте адрес или вернитесь к списку аукционов.</p>
      <Link search={{ page: 1 }} to="/auctions">
        Вернуться к аукционам
      </Link>
    </section>
  )
}
