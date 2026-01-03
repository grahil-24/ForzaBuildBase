import EmblaCarousel from './RecentTunesCarousel'
import { type EmblaOptionsType } from 'embla-carousel'
import type { RecentTunes } from '../../../types/tune'

const OPTIONS: EmblaOptionsType = { align: 'start' }

type CarouselProps = {
  recentTunes: RecentTunes[],
  user: string,
  onRenameClick: (tuneid: number) => void,
}


export const Carousel = ({ user, recentTunes,onRenameClick}: CarouselProps) => (
  <>
    <EmblaCarousel slides={recentTunes} user={user} options={OPTIONS} onRenameClick={onRenameClick}/>
  </>
)
