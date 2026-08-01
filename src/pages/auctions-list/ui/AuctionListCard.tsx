import { Link } from '@tanstack/react-router'

import { AuctionCard, type AuctionCardViewModel } from '@/entities/auction'
import { Button, buttonClassName } from '@/shared/ui'

interface AuctionListCardProps {
  auction: AuctionCardViewModel
  onIntent: (auctionUuid: string) => void
}

export function AuctionListCard({ auction, onIntent }: AuctionListCardProps) {
  const auctionUuid = auction.uuid
  const actions =
    auctionUuid === null ? (
      <>
        <Button disabled type="button">
          Аукцион недоступен
        </Button>
        <Button disabled type="button">
          {auction.action.label}
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
        {auction.action.disabled ? (
          <Button disabled type="button">
            {auction.action.label}
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
              auction.action.kind === 'set-bet'
                ? '/auctions/$auctionUuid/bet'
                : '/auctions/$auctionUuid/bets'
            }
          >
            {auction.action.label}
          </Link>
        )}
      </>
    )

  return <AuctionCard actions={actions} auction={auction} onIntent={onIntent} />
}
