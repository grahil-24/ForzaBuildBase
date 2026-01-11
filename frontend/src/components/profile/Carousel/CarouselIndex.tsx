import EmblaCarousel from './RecentTunesCarousel'
import { type EmblaOptionsType } from 'embla-carousel'
import type { Tune } from '../../../types/tune'

const OPTIONS: EmblaOptionsType = { align: 'start' }

type CarouselProps = {
  recentTunes: Tune[],
  user: string,
  onRenameClick: (tuneid: number) => void,
  onRemoveClick: (tuneid: number) => void,
  onDeleteClick: (tuneid: number) => void,
}


export const Carousel = ({ user, recentTunes,onRenameClick, onRemoveClick, onDeleteClick}: CarouselProps) => (
  <>
    <EmblaCarousel slides={recentTunes} user={user} options={OPTIONS} onRenameClick={onRenameClick} onRemoveClick={onRemoveClick} onDeleteClick={onDeleteClick}/>
  </>
)
