import type { BetViewModel } from '@/entities/auction'
import { Badge } from '@/shared/ui'

import styles from './AuctionBetsPage.module.scss'

interface AuctionBetsTableProps {
  cargoNumber: string
  hidePlaces: boolean
  rows: BetViewModel[]
}

export function AuctionBetsTable({
  cargoNumber,
  hidePlaces,
  rows,
}: AuctionBetsTableProps) {
  return (
    <div
      aria-label="Таблица истории ставок"
      className={styles.tableWrap}
      role="region"
      tabIndex={0}
    >
      <table className={styles.table}>
        <caption className={styles.caption}>
          История ставок по заявке № {cargoNumber}
        </caption>
        <thead>
          <tr>
            <th scope="col">Перевозчик</th>
            <th scope="col">С НДС</th>
            <th scope="col">Без НДС</th>
            {hidePlaces ? null : <th scope="col">Место</th>}
            <th scope="col">Дата</th>
            <th scope="col">Статус</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((bet) => (
            <tr
              className={bet.isCanceled ? styles.canceled : undefined}
              key={bet.id}
            >
              <td>
                <strong>{bet.carrier}</strong>
                <span>ИНН {bet.inn}</span>
              </td>
              <td>{bet.priceWithVat}</td>
              <td>{bet.priceNoVat}</td>
              {hidePlaces ? null : <td>{bet.place}</td>}
              <td>{bet.createdAt}</td>
              <td>
                {bet.isWinner ? (
                  <Badge tone="success">Победитель</Badge>
                ) : bet.isCanceled ? (
                  <span className={styles.canceledStatus}>
                    <span>Отменена</span>
                    {bet.cancelReason ? (
                      <small>Причина: {bet.cancelReason}</small>
                    ) : null}
                  </span>
                ) : (
                  'Активна'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
