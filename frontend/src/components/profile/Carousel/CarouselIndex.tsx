import EmblaCarousel from './RecentTunesCarousel'
import { type EmblaOptionsType } from 'embla-carousel'
import type { RecentTunes } from '../../../types/tune'

const OPTIONS: EmblaOptionsType = { align: 'start' }

type CarouselProps = {
  recentTunes: RecentTunes[],
  user: string
}


export const Carousel = ({ user, recentTunes }: CarouselProps) => (
  <>
    <EmblaCarousel slides={recentTunes} user={user} options={OPTIONS} />
  </>
)
