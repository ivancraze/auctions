import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'

import { RootLayout } from '../layout/RootLayout'
import { auctionSearchSchema } from '@/features/filter-auctions'
import { betsSearchSchema } from '@/features/view-auction-bets'
import { AuctionBetPage } from '@/pages/auction-bet/ui/AuctionBetPage'
import { AuctionBetsPage } from '@/pages/auction-bets/ui/AuctionBetsPage'
import { AuctionDetailsPage } from '@/pages/auction-details/ui/AuctionDetailsPage'
import { AuctionsListPage } from '@/pages/auctions-list/ui/AuctionsListPage'

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => 'Страница не найдена',
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    // TanStack Router models redirects as thrown control-flow values.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect({ to: '/auctions', search: { page: 1 } })
  },
})

const auctionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions',
  validateSearch: (search) => auctionSearchSchema.parse(search),
  component: AuctionsListPage,
})

const auctionDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions/$auctionUuid',
  component: AuctionDetailsPage,
})

const auctionBetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions/$auctionUuid/bets',
  validateSearch: (search) => betsSearchSchema.parse(search),
  component: AuctionBetsPage,
})

const auctionBetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auctions/$auctionUuid/bet',
  component: AuctionBetPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  auctionsRoute,
  auctionDetailsRoute,
  auctionBetsRoute,
  auctionBetRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
