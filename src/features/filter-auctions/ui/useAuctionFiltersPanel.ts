import { useEffect, useLayoutEffect, useRef } from 'react'

const focusableElementSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function useAuctionFiltersPanel(isOpen: boolean, close: () => void) {
  const panelRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : triggerRef.current
    const previousBodyOverflow = document.body.style.overflow

    closeButtonRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          focusableElementSelector,
        ) ?? [],
      )
      const firstElement = focusableElements.at(0)
      const lastElement = focusableElements.at(-1)

      if (!firstElement || !lastElement) {
        event.preventDefault()
        return
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow
      previouslyFocusedElement?.focus()
    }
  }, [close, isOpen])

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth > 640) close()
    }

    window.addEventListener('resize', closeOnDesktop)
    return () => window.removeEventListener('resize', closeOnDesktop)
  }, [close])

  useLayoutEffect(() => {
    let animationFrame = 0

    const updatePanelHeight = () => {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => {
        const panel = panelRef.current
        if (!panel) return

        if (window.innerWidth <= 640) {
          panel.style.removeProperty('--filters-panel-max-height')
          return
        }

        let documentTop = 0
        let element: HTMLElement | null = panel

        while (element) {
          documentTop += element.offsetTop
          element = element.offsetParent as HTMLElement | null
        }

        const availableHeight = Math.max(
          180,
          window.innerHeight - documentTop - 20,
        )
        panel.style.setProperty(
          '--filters-panel-max-height',
          `${availableHeight}px`,
        )
      })
    }

    updatePanelHeight()
    window.addEventListener('resize', updatePanelHeight)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', updatePanelHeight)
    }
  }, [])

  return { closeButtonRef, panelRef, triggerRef }
}
