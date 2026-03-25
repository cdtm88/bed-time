import type { Viewport } from 'next'
import { ReadingView } from '@/components/reading-view'

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
}

export default function StoryPage() {
  return <ReadingView />
}
