import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'

import { AuctionsListContent } from './AuctionsListContent'
import { auctionQueries } from '@/entities/auction'
import {
  AuctionFilters,
  auctionSearchSchema,
  buildAuctionListRequest,
  defaultAuctionSearch,
} from '@/features/filter-auctions'
import { Breadcrumbs } from '@/shared/ui'

import styles from './AuctionsListPage.module.scss'

const PER_PAGE = 6

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

  const listStatus = listQuery.isPending
    ? 'Загрузка аукционов…'
    : isUpdating || isPageOutOfRange
      ? 'Обновляем аукционы…'
      : meta
        ? `Найдено: ${meta.total ?? 0}. Страница ${page} из ${lastPage}.`
        : ''

  return (
    <section>
      <h1 className={styles.visuallyHidden}>Аукционы</h1>
      <div className={styles.contextRow}>
        <Breadcrumbs className={styles.breadcrumbs}>
          <span aria-current="page">Аукционы</span>
        </Breadcrumbs>
        {meta ? (
          <p className={styles.resultCount}>
            Найдено: <strong>{meta.total ?? 0}</strong>
          </p>
        ) : null}
      </div>

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

          <AuctionsListContent
            error={listQuery.error}
            isOutOfRange={isPageOutOfRange}
            isPending={listQuery.isPending}
            isUpdating={isUpdating}
            items={items}
            lastPage={lastPage}
            onIntent={prefetchDetails}
            onPageChange={(nextPage) =>
              updateSearch({ ...search, page: nextPage })
            }
            onRetry={() => void listQuery.refetch()}
            page={page}
            pageSize={PER_PAGE}
          />
        </div>
      </div>
    </section>
  )
}
