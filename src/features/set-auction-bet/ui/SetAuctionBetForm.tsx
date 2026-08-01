import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, type ReactNode, useRef } from 'react'
import { useForm } from 'react-hook-form'

import { type BetFormValues, createBetSchema } from '../model/betSchema'
import {
  auctionApi,
  type AuctionDetails,
  auctionKeys,
} from '@/entities/auction'
import { ApiError } from '@/shared/api'
import { Button, FormFieldGroup, useToastStore } from '@/shared/ui'

import styles from './SetAuctionBetForm.module.scss'

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
})
const priceInputId = 'bet-price'
const priceLimitsId = 'bet-price-limits'
const priceErrorId = 'bet-price-error'

function formatMoney(value: number | null | undefined) {
  return value == null ? 'Не указано' : moneyFormatter.format(value)
}

interface SetAuctionBetFormProps {
  auctionUuid: string
  cancelAction: ReactNode
  onSuccess: () => void
  trading: AuctionDetails['trading']
}

export function SetAuctionBetForm({
  auctionUuid,
  cancelAction,
  onSuccess,
  trading,
}: SetAuctionBetFormProps) {
  const submitLockRef = useRef(false)
  const queryClient = useQueryClient()
  const showToast = useToastStore((state) => state.show)
  const constraints = trading.price
  const schema = createBetSchema({
    min: constraints?.min,
    max: constraints?.max,
    step: constraints?.step,
  })
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      price: trading.your?.last_bet_with_vat ?? trading.price?.available ?? 0,
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
      return
    }

    showToast('success', 'Ставка успешно принята')
    onSuccess()
  })

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    if (submitLockRef.current) {
      event.preventDefault()
      return
    }

    submitLockRef.current = true

    try {
      await submit(event)
    } finally {
      submitLockRef.current = false
    }
  }

  return (
    <form
      aria-busy={isSubmitting}
      className={styles.form}
      noValidate
      onSubmit={(event) => void handleFormSubmit(event)}
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
        <label htmlFor={priceInputId}>Цена ставки</label>
        <div className={styles.priceInput}>
          <input
            aria-describedby={`${priceLimitsId}${errors.price ? ` ${priceErrorId}` : ''}`}
            aria-invalid={errors.price ? 'true' : 'false'}
            id={priceInputId}
            max={constraints?.max ?? undefined}
            min={constraints?.min ?? 0}
            step={constraints?.step ?? 'any'}
            type="number"
            {...register('price', { valueAsNumber: true })}
          />
          <span aria-hidden="true">₽</span>
        </div>
        {errors.price ? (
          <span className={styles.error} id={priceErrorId} role="alert">
            {errors.price.message}
          </span>
        ) : null}
      </FormFieldGroup>

      <div className={styles.limits} id={priceLimitsId}>
        <span>Минимум: {formatMoney(constraints?.min)}</span>
        <span>Максимум: {formatMoney(constraints?.max)}</span>
      </div>

      {errors.root?.server ? (
        <p className={styles.error} role="alert">
          {errors.root.server.message}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button disabled={isSubmitting || mutation.isPending} type="submit">
          {isSubmitting || mutation.isPending
            ? 'Отправляем…'
            : 'Подтвердить ставку'}
        </Button>
        {cancelAction}
      </div>
    </form>
  )
}
