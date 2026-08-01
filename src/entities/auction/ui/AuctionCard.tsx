import { Link } from '@tanstack/react-router'

import type { AuctionCardViewModel } from '../model/mapAuctionCard'

interface AuctionCardProps {
  auction: AuctionCardViewModel
  onIntent: (auctionUuid: string) => void
}

export function AuctionCard({ auction, onIntent }: AuctionCardProps) {
  const handleIntent = () => {
    if (auction.uuid) onIntent(auction.uuid)
  }

  return (
    <article
      className="auction-card"
      onPointerEnter={handleIntent}
      onFocus={handleIntent}
    >
      <div className="auction-card__heading">
        <div>
          <p className="auction-card__number">Заявка № {auction.cargoNumber}</p>
          {auction.uuid ? (
            <Link
              className="auction-card__route"
              to="/auctions/$auctionUuid"
              params={{ auctionUuid: auction.uuid }}
            >
              {auction.route}
            </Link>
          ) : (
            <h2 className="auction-card__route">{auction.route}</h2>
          )}
        </div>
        <div className="auction-card__badges">
          <span className={`status-badge status-badge--${auction.statusTone}`}>
            {auction.status}
          </span>
          <span className="type-badge">{auction.type}</span>
        </div>
      </div>

      <div className="auction-card__grid">
        <div className="auction-card__section">
          <p className="field-label">Погрузка</p>
          <p className="field-value">{auction.loadDate}</p>
          <p className="field-label field-label--spaced">Выгрузка</p>
          <p className="field-value">{auction.unloadDate}</p>
        </div>
        <div className="auction-card__section">
          <p className="field-label">Груз</p>
          <p className="field-value">{auction.cargoName}</p>
          <p className="field-note">{auction.cargoDetails}</p>
        </div>
        <div className="auction-card__section auction-card__price">
          <p className="field-label">Текущая цена</p>
          <p className="price-value">{auction.currentPrice}</p>
          <p className="field-note">{auction.pricePerKm}</p>
          <p className="field-note">Шаг: {auction.step}</p>
        </div>
      </div>

      <footer className="auction-card__footer">
        <div>
          <p className="user-status">{auction.userStatus}</p>
          <p className="field-note">
            {auction.hasOwnBet ? 'Есть ваша ставка' : 'Вашей ставки пока нет'}
          </p>
        </div>
        {auction.action.disabled || !auction.uuid ? (
          <button className="button button--disabled" disabled type="button">
            {auction.action.label}
          </button>
        ) : (
          <Link
            className="button button--primary"
            to={auction.action.to}
            params={{ auctionUuid: auction.uuid }}
          >
            {auction.action.label}
          </Link>
        )}
      </footer>
    </article>
  )
}
