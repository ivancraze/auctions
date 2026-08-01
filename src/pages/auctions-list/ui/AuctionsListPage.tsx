import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

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
import { ApiError } from '@/shared/api'
import {
  Button,
  buttonClassName,
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
    <div aria-hidden="true" className={styles.list}>
      {Array.from({ length: PER_PAGE }, (_, index) => (
        <AuctionCardSkeleton key={index} />
      ))}
    </div>
  )
}

function AuctionsLoader() {
  return (
    <div aria-hidden="true" className={styles.loader}>
      <span className={styles.spinner} aria-hidden="true" />
      <span>Обновляем аукционы…</span>
    </div>
  )
}

export function AuctionsListPage() {
  const paginationFocusTarget = useRef<'previous' | 'next' | null>(null)
  const previousPageButtonRef = useRef<HTMLButtonElement>(null)
  const nextPageButtonRef = useRef<HTMLButtonElement>(null)
  const paginationStatusRef = useRef<HTMLSpanElement>(null)
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
  const lastPage = Math.max(1, meta?.last_page ?? 1)
  const page = search.page
  const isPageOutOfRange =
    listQuery.isSuccess && meta?.last_page !== undefined && page > lastPage

  useEffect(() => {
    if (!isPageOutOfRange) return

    void navigate({
      to: '/auctions',
      search: (current) => ({ ...current, page: lastPage }),
      replace: true,
    })
  }, [isPageOutOfRange, lastPage, navigate])

  useEffect(() => {
    if (isUpdating || !listQuery.isSuccess || !paginationFocusTarget.current) {
      return
    }

    const targetButton =
      paginationFocusTarget.current === 'previous'
        ? previousPageButtonRef.current
        : nextPageButtonRef.current

    if (targetButton && !targetButton.disabled) {
      targetButton.focus()
    } else {
      paginationStatusRef.current?.focus()
    }
    paginationFocusTarget.current = null
  }, [isUpdating, listQuery.isSuccess, page])

  const listStatus = listQuery.isPending
    ? 'Загрузка аукционов…'
    : isUpdating || isPageOutOfRange
      ? 'Обновляем аукционы…'
      : meta
        ? `Найдено: ${meta.total ?? 0}. Страница ${page} из ${lastPage}.`
        : ''

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

        <div
          className={styles.content}
          aria-busy={listQuery.isPending || isUpdating || isPageOutOfRange}
        >
          <p
            className={styles.visuallyHidden}
            role="status"
            aria-atomic="true"
            aria-live="polite"
          >
            {listStatus}
          </p>

          {listQuery.isPending ? <AuctionsSkeleton /> : null}

          {isUpdating || isPageOutOfRange ? <AuctionsLoader /> : null}

          {listQuery.isError && !isUpdating && !isPageOutOfRange ? (
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

          {listQuery.isSuccess &&
          !isUpdating &&
          !isPageOutOfRange &&
          items.length === 0 ? (
            <StateCard>
              <StateCardTitle>Аукционы не найдены</StateCardTitle>
              <p>Попробуйте изменить условия поиска.</p>
            </StateCard>
          ) : null}

          {listQuery.isSuccess &&
          !isUpdating &&
          !isPageOutOfRange &&
          items.length > 0 ? (
            <>
              <div className={styles.list}>
                {items.map((item, index) => {
                  const viewModel = mapAuctionCard(item)
                  const auctionUuid = viewModel.uuid
                  const actions =
                    auctionUuid === null ? (
                      <>
                        <Button disabled type="button" variant="disabled">
                          Аукцион недоступен
                        </Button>
                        <Button disabled type="button" variant="disabled">
                          {viewModel.action.label}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link
                          className={buttonClassName('secondary')}
                          params={{ auctionUuid }}
                          search={(current) => ({
                            ...current,
                            page: current.page ?? 1,
                          })}
                          to="/auctions/$auctionUuid"
                        >
                          Открыть аукцион
                        </Link>
                        {viewModel.action.disabled ? (
                          <Button disabled type="button" variant="disabled">
                            {viewModel.action.label}
                          </Button>
                        ) : (
                          <Link
                            className={buttonClassName('primary')}
                            params={{ auctionUuid }}
                            search={(current) => ({
                              ...current,
                              page: current.page ?? 1,
                            })}
                            to={
                              viewModel.action.kind === 'set-bet'
                                ? '/auctions/$auctionUuid/bet'
                                : '/auctions/$auctionUuid/bets'
                            }
                          >
                            {viewModel.action.label}
                          </Link>
                        )}
                      </>
                    )
                  return (
                    <AuctionCard
                      actions={actions}
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
                  onClick={() => {
                    paginationFocusTarget.current = 'previous'
                    updateSearch({ ...search, page: Math.max(1, page - 1) })
                  }}
                  ref={previousPageButtonRef}
                  type="button"
                >
                  ← Назад
                </button>
                <span
                  className={styles.paginationStatus}
                  ref={paginationStatusRef}
                  tabIndex={-1}
                >
                  Страница <strong>{page}</strong> из{' '}
                  <strong>{lastPage}</strong>
                </span>
                <button
                  className={styles.paginationButton}
                  disabled={page >= lastPage || isUpdating}
                  onClick={() => {
                    paginationFocusTarget.current = 'next'
                    updateSearch({ ...search, page: page + 1 })
                  }}
                  ref={nextPageButtonRef}
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
