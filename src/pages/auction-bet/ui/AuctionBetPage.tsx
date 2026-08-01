import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import {
  auctionApi,
  type AuctionDetails,
  auctionKeys,
  auctionQueries,
} from '@/entities/auction'
import { type BetFormValues, createBetSchema } from '@/features/set-auction-bet'
import { ApiError } from '@/shared/api/client'
import {
  Breadcrumbs,
  Button,
  buttonClassName,
  Eyebrow,
  FormFieldGroup,
  StateCard,
  useToastStore,
} from '@/shared/ui'

import styles from './AuctionBetPage.module.scss'

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
})

function formatMoney(value: number | null | undefined) {
  return value == null ? 'Не указано' : moneyFormatter.format(value)
}

interface BetFormProps {
  auctionUuid: string
  details: AuctionDetails
}

function BetForm({ auctionUuid, details }: BetFormProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate({ from: '/auctions/$auctionUuid/bet' })
  const showToast = useToastStore((state) => state.show)
  const constraints = details.trading.price
  const schema = createBetSchema({
    min: constraints?.min,
    max: constraints?.max,
    step: constraints?.step,
  })
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      price:
        details.trading.your?.last_bet_with_vat ??
        details.trading.price?.available ??
        0,
    },
  })
  const mutation = useMutation({
    mutationFn: (values: BetFormValues) =>
      auctionApi.setBet(auctionUuid, values),
  })

  const submit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: auctionKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: auctionKeys.detail(auctionUuid),
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: auctionKeys.betsRoot(auctionUuid),
        }),
      ])
      showToast('success', 'Ставка успешно принята')
      await navigate({
        to: '/auctions/$auctionUuid',
        params: { auctionUuid },
        search: (current) => ({ ...current, page: current.page ?? 1 }),
      })
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 422 &&
        'errors' in error.problem
      ) {
        const priceError = error.problem.errors.find(
          (validationError) => validationError.field === 'price',
        )
        setError('price', {
          type: 'server',
          message: priceError?.message ?? error.problem.message,
        })
      } else {
        setError('root.server', {
          type: 'server',
          message:
            error instanceof Error
              ? error.message
              : 'Не удалось установить ставку.',
        })
      }
      showToast('error', 'Ставка не была принята')
    }
  })

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      <div className={styles.summary}>
        <div>
          <span>Текущая цена</span>
          <strong>{formatMoney(constraints?.current)}</strong>
        </div>
        <div>
          <span>Доступная цена</span>
          <strong>{formatMoney(constraints?.available)}</strong>
        </div>
        <div>
          <span>Шаг</span>
          <strong>{formatMoney(constraints?.step)}</strong>
        </div>
      </div>

      <FormFieldGroup>
        <label htmlFor="bet-price">Цена ставки</label>
        <div className={styles.priceInput}>
          <input
            id="bet-price"
            aria-invalid={errors.price ? 'true' : 'false'}
            max={constraints?.max ?? undefined}
            min={constraints?.min ?? 0}
            step={constraints?.step ?? 'any'}
            type="number"
            {...register('price', { valueAsNumber: true })}
          />
          <span>₽</span>
        </div>
        {errors.price ? (
          <span className={styles.error}>{errors.price.message}</span>
        ) : null}
      </FormFieldGroup>

      <div className={styles.limits}>
        <span>Минимум: {formatMoney(constraints?.min)}</span>
        <span>Максимум: {formatMoney(constraints?.max)}</span>
      </div>

      {errors.root?.server ? (
        <p className={styles.error} role="alert">
          {errors.root.server.message}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button disabled={mutation.isPending} type="submit">
          {mutation.isPending ? 'Отправляем…' : 'Подтвердить ставку'}
        </Button>
        <Link
          className={buttonClassName('secondary')}
          params={{ auctionUuid }}
          search={(current) => ({ ...current, page: current.page ?? 1 })}
          to="/auctions/$auctionUuid"
        >
          Отмена
        </Link>
      </div>
    </form>
  )
}

export function AuctionBetPage() {
  const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bet' })
  const detailQuery = useQuery(auctionQueries.detail(auctionUuid))

  if (detailQuery.isPending) {
    return <StateCard aria-busy="true">Загрузка параметров ставки…</StateCard>
  }

  if (detailQuery.isError) {
    return (
      <StateCard role="alert" tone="error">
        <h1>Не удалось загрузить аукцион</h1>
        <p>{detailQuery.error.message}</p>
      </StateCard>
    )
  }

  if (!detailQuery.data.trading.can_set_bet) {
    return (
      <StateCard as="section">
        <Eyebrow>
          Заявка № {detailQuery.data.main.cargo_num ?? 'Без номера'}
        </Eyebrow>
        <h1>Ставка недоступна</h1>
        <p>Текущее состояние торгов не позволяет установить ставку.</p>
        <Link
          className={buttonClassName('secondary')}
          params={{ auctionUuid }}
          search={(current) => ({ ...current, page: current.page ?? 1 })}
          to="/auctions/$auctionUuid"
        >
          Вернуться к аукциону
        </Link>
      </StateCard>
    )
  }

  return (
    <section>
      <Breadcrumbs>
        <Link
          search={(current) => ({ ...current, page: current.page ?? 1 })}
          to="/auctions"
        >
          Аукционы
        </Link>
        <span>→</span>
        <Link
          params={{ auctionUuid }}
          search={(current) => ({ ...current, page: current.page ?? 1 })}
          to="/auctions/$auctionUuid"
        >
          Заявка № {detailQuery.data.main.cargo_num ?? 'Без номера'}
        </Link>
        <span>→</span>
        <span>Ставка</span>
      </Breadcrumbs>
      <div className={styles.panel}>
        <header>
          <Eyebrow>Участие в торгах</Eyebrow>
          <h1>
            {detailQuery.data.trading.your?.bet
              ? 'Изменить ставку'
              : 'Сделать ставку'}
          </h1>
          <p>Проверьте ограничения аукциона перед отправкой.</p>
        </header>
        <BetForm auctionUuid={auctionUuid} details={detailQuery.data} />
      </div>
    </section>
  )
}
