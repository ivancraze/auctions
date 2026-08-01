import type { ZodIssue, ZodType } from 'zod'

import type { components } from './generated/schema'
import { apiProblemSchema } from './responseSchemas'

const API_BASE_URL = '/api/v1'

export type ApiProblem =
  | components['schemas']['ProblemDetail']
  | components['schemas']['ValidationProblem']

export class ApiError extends Error {
  readonly status: number
  readonly problem: ApiProblem

  constructor(status: number, problem: ApiProblem) {
    super(problem.message)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
  }
}

export class ApiContractError extends Error {
  readonly issues: ZodIssue[]

  constructor(issues: ZodIssue[]) {
    super('Ответ API не соответствует OpenAPI-контракту.')
    this.name = 'ApiContractError'
    this.issues = issues
  }
}

async function readProblem(response: Response): Promise<ApiProblem> {
  try {
    const body: unknown = await response.json()

    const result = apiProblemSchema.safeParse(body)

    if (result.success) {
      return result.data
    }
  } catch {
    // The fallback below keeps malformed external responses safe for the UI.
  }

  return {
    code: 'http_error',
    title: 'Ошибка запроса',
    message: response.statusText || 'Запрос завершился ошибкой.',
  }
}

async function apiFetch(path: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    throw new ApiError(response.status, await readProblem(response))
  }

  return response
}

export async function apiRequest<TOutput>(
  path: string,
  init: RequestInit,
  schema: ZodType<TOutput>,
): Promise<TOutput> {
  const response = await apiFetch(path, init)
  const body: unknown = await response.json()
  const result = schema.safeParse(body)

  if (!result.success) {
    throw new ApiContractError(result.error.issues)
  }

  return result.data
}

export async function apiRequestVoid(
  path: string,
  init: RequestInit,
): Promise<void> {
  await apiFetch(path, init)
}
