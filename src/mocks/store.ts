import { createInitialMockData } from './data/fixtures'

export let mockStore = createInitialMockData()

export function resetMockStore() {
  mockStore = createInitialMockData()
}
