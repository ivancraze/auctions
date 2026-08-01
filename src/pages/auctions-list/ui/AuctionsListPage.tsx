import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'

import {
  AuctionCard,
  AuctionCardSkeleton,
  auctionQueries,
  mapAuctionCard,
} from '@/entities/auction'
import {
  AuctionFilters,
  auctionSearchSchema,
  buildAuctionListRequest,
  defaultAuctionSearch,
} from '@/features/filter-auctions'
import { ApiError } from '@/shared/api/client'
import {
  Button,
  Eyebrow,
  PageHeading,
  PageSubtitle,
  StateCard,
  StateCardTitle,
} from '@/shared/ui'

import styles from './AuctionsListPage.module.scss'

const PER_PAGE = 3

function AuctionsSkeleton() {
  return (
    <div
      className={styles.list}
      aria-label="Загрузка аукционов"
      aria-busy="true"
    >
      {Array.from({ length: PER_PAGE }, (_, index) => (
        <AuctionCardSkeleton key={index} />
      ))}
    </div>
  )
}

function AuctionsLoader() {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
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
    <section>
      <PageHeading>
        <div>
          <Eyebrow>Грузовые перевозки</Eyebrow>
          <h1>Аукционы</h1>
          <PageSubtitle>
            Актуальные заявки на перевозку и ваши позиции в торгах
          </PageSubtitle>
        </div>
        {meta ? (
          <p className={styles.resultCount}>
            Найдено: <strong>{meta.total ?? 0}</strong>
          </p>
        ) : null}
      </PageHeading>

      <div className={styles.layout}>
        <AuctionFilters
          values={search}
          onApply={updateSearch}
          onReset={() => updateSearch(defaultAuctionSearch)}
        />

        <div className={styles.content} aria-busy={isUpdating}>
          {listQuery.isPending ? <AuctionsSkeleton /> : null}

          {isUpdating ? <AuctionsLoader /> : null}

          {listQuery.isError && !isUpdating ? (
            <StateCard role="alert" tone="error">
              <StateCardTitle>Не удалось загрузить аукционы</StateCardTitle>
              <p>
                {listQuery.error instanceof ApiError
                  ? listQuery.error.problem.message
                  : listQuery.error.message}
              </p>
              <Button
                onClick={() => void listQuery.refetch()}
                type="button"
                variant="secondary"
              >
                Повторить
              </Button>
            </StateCard>
          ) : null}

          {listQuery.isSuccess && !isUpdating && items.length === 0 ? (
            <StateCard>
              <StateCardTitle>Аукционы не найдены</StateCardTitle>
              <p>Попробуйте изменить условия поиска.</p>
            </StateCard>
          ) : null}

          {listQuery.isSuccess && !isUpdating && items.length > 0 ? (
            <>
              <div className={styles.list}>
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

              <nav
                className={styles.pagination}
                aria-label="Пагинация аукционов"
              >
                <button
                  className={styles.paginationButton}
                  disabled={page <= 1 || isUpdating}
                  onClick={() =>
                    updateSearch({ ...search, page: Math.max(1, page - 1) })
                  }
                  type="button"
                >
                  ← Назад
                </button>
                <span className={styles.paginationStatus}>
                  Страница <strong>{page}</strong> из{' '}
                  <strong>{lastPage}</strong>
                </span>
                <button
                  className={styles.paginationButton}
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
