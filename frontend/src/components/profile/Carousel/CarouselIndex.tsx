import EmblaCarousel from './RecentTunesCarousel'
import { type EmblaOptionsType } from 'embla-carousel'
import type { RecentTunes } from '../../../types/tune'

const OPTIONS: EmblaOptionsType = { align: 'start' }

type CarouselProps = {
  recentTunes: RecentTunes[]
}


export const Carousel = ({ recentTunes }: CarouselProps) => (
  <>
    <EmblaCarousel slides={recentTunes} options={OPTIONS} />
  </>
)
