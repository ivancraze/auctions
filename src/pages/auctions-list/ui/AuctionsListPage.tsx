import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'

import { auctionQueries } from '@/entities/auction/api/auctionQueries'
import { mapAuctionCard } from '@/entities/auction/model/mapAuctionCard'
import { AuctionCard } from '@/entities/auction/ui/AuctionCard'
import { buildAuctionListRequest } from '@/features/filter-auctions/model/buildAuctionListRequest'
import {
  auctionSearchSchema,
  defaultAuctionSearch,
} from '@/features/filter-auctions/model/searchSchema'
import { AuctionFilters } from '@/features/filter-auctions/ui/AuctionFilters'
import { ApiError } from '@/shared/api/client'

const PER_PAGE = 3

function AuctionsSkeleton() {
  return (
    <div
      className="auction-list"
      aria-label="Загрузка аукционов"
      aria-busy="true"
    >
      {Array.from({ length: PER_PAGE }, (_, index) => (
        <div className="auction-card auction-card--skeleton" key={index}>
          <span className="skeleton skeleton--small" />
          <span className="skeleton skeleton--title" />
          <div className="skeleton-grid">
            <span className="skeleton skeleton--block" />
            <span className="skeleton skeleton--block" />
            <span className="skeleton skeleton--block" />
          </div>
        </div>
      ))}
    </div>
  )
}

function AuctionsLoader() {
  return (
    <div className="auctions-loader" role="status" aria-live="polite">
      <span className="auctions-loader__spinner" aria-hidden="true" />
      <span>Обновляем аукционы…</span>
    </div>
  )
}

export function AuctionsListPage() {
  const locationSearch = useRouterState({
    select: (state) => state.location.search,
  })
  const search = auctionSearchSchema.parse(locationSearch)
  const navigate = useNavigate({ from: '/auctions' })
  const queryClient = useQueryClient()
  const listQuery = useQuery({
    ...auctionQueries.list(buildAuctionListRequest(search, PER_PAGE)),
    placeholderData: keepPreviousData,
  })
  const isUpdating = listQuery.isFetching && !listQuery.isPending

  const updateSearch = (nextSearch: typeof search) => {
    void navigate({ to: '/auctions', search: nextSearch })
  }
  const prefetchDetails = (auctionUuid: string) => {
    void queryClient.prefetchQuery(auctionQueries.detail(auctionUuid))
  }

  const items = listQuery.data?.data ?? []
  const meta = listQuery.data?.meta
  const lastPage = meta?.last_page ?? 1
  const page = search.page

  return (
    <section className="auctions-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Грузовые перевозки</p>
          <h1>Аукционы</h1>
          <p className="page-subtitle">
            Актуальные заявки на перевозку и ваши позиции в торгах
          </p>
        </div>
        {meta ? (
          <p className="result-count">
            Найдено: <strong>{meta.total ?? 0}</strong>
          </p>
        ) : null}
      </header>

      <div className="auctions-layout">
        <AuctionFilters
          values={search}
          onApply={updateSearch}
          onReset={() => updateSearch(defaultAuctionSearch)}
        />

        <div className="auctions-content" aria-busy={isUpdating}>
          {listQuery.isPending ? <AuctionsSkeleton /> : null}

          {isUpdating ? <AuctionsLoader /> : null}

          {listQuery.isError && !isUpdating ? (
            <div className="state-card state-card--error" role="alert">
              <p className="state-card__title">Не удалось загрузить аукционы</p>
              <p>
                {listQuery.error instanceof ApiError
                  ? listQuery.error.problem.message
                  : listQuery.error.message}
              </p>
              <button
                className="button button--secondary"
                onClick={() => void listQuery.refetch()}
                type="button"
              >
                Повторить
              </button>
            </div>
          ) : null}

          {listQuery.isSuccess && !isUpdating && items.length === 0 ? (
            <div className="state-card">
              <p className="state-card__title">Аукционы не найдены</p>
              <p>Попробуйте изменить условия поиска.</p>
            </div>
          ) : null}

          {listQuery.isSuccess && !isUpdating && items.length > 0 ? (
            <>
              <div className="auction-list">
                {items.map((item, index) => {
                  const viewModel = mapAuctionCard(item)
                  return (
                    <AuctionCard
                      auction={viewModel}
                      key={
                        viewModel.uuid ?? `${viewModel.cargoNumber}-${index}`
                      }
                      onIntent={prefetchDetails}
                    />
                  )
                })}
              </div>

              <nav className="pagination" aria-label="Пагинация аукционов">
                <button
                  className="pagination__button"
                  disabled={page <= 1 || isUpdating}
                  onClick={() =>
                    updateSearch({ ...search, page: Math.max(1, page - 1) })
                  }
                  type="button"
                >
                  ← Назад
                </button>
                <span className="pagination__status">
                  Страница <strong>{page}</strong> из{' '}
                  <strong>{lastPage}</strong>
                </span>
                <button
                  className="pagination__button"
                  disabled={page >= lastPage || isUpdating}
                  onClick={() => updateSearch({ ...search, page: page + 1 })}
                  type="button"
                >
                  Далее →
                </button>
              </nav>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
