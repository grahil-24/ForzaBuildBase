import { type EmblaOptionsType } from 'embla-carousel'
import { PrevButton, NextButton, usePrevNextButtons } from './CarouselArrowButton'
import useEmblaCarousel from 'embla-carousel-react'
import type { Tune } from '../../../types/tune'
import { formatS3BucketURL } from '../../../util/urlFormatter'
import type { RankType } from '../../../types/car'
import { Link } from '@tanstack/react-router'
import { PROFILE_PIC } from '../../../config/env'

type PropType = {
  slides: Tune[],
  options?: EmblaOptionsType,
  user: string,
  onRenameClick?: (tuneid: number) => void,
  onRemoveClick?: (tuneid: number) => void,
  onDeleteClick?: (tuneid: number) => void,
}

const rank_to_color: Record<RankType, string> = {
  S2: "text-blue-800",
  S1: "text-purple-500",
  A: "text-rose-600",
  B: "text-orange-500",
  C: "text-amber-300",
  D: "text-cyan-300"
}

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

  return (
    <section className="relative group/carousel">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-6">
          {slides.map((tune) => {
            const imageURL = formatS3BucketURL({
              manufacturer: tune.tune.car.Manufacturer,
              image_filename: tune.tune.car.image_filename,
            })
            return (
              <div className="min-w-0 flex-[0_0_100%] pl-6 sm:flex-[0_0_50%] lg:flex-[0_0_33.33%]" key={tune.tune.tune_id}>
                <div className="group relative bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  
                  {/* Rank Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-md font-black backdrop-blur-md bg-white/80 shadow-sm border border-slate-100 ${rank_to_color[tune.tune.resultant_rank]}`}>
                    {tune.tune.resultant_rank}
                  </div>

                  {/* Car Image */}
                  <div className="relative w-full h-40 mb-6 flex items-center justify-center bg-radial-gradient from-slate-50 to-transparent rounded-xl overflow-hidden">
                    <img
                      src={imageURL}
                      alt={tune.tune?.tune_name}
                      className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex flex-col flex-1">
                    <Link 
                        to='/view/tune/$tuneId' 
                        params={{tuneId: tune.tune.tune_id.toString()}}
                        className="text-lg font-bold text-slate-800 leading-tight hover:text-indigo-600 transition-colors line-clamp-1"
                    >
                        {tune.tune?.tune_name}
                    </Link>
                    
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                      {new Date(tune.saved_on).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>

                    {/* Creator Section */}
                    <div className='mt-6 border-t border-slate-50 flex items-center justify-between'>
                      <Link 
                        to='/u/$user' 
                        params={{user: tune.tune.creator.username}}
                        className="flex items-center gap-2 group/user"
                      >
                        <img 
                          src={`${PROFILE_PIC}/${tune.tune.creator.profile_pic}`}
                          alt=""
                          className='size-8 rounded-full object-cover ring-2 ring-white shadow-sm'
                        />
                        <span className='text-md font-medium text-slate-600 group-hover/user:text-indigo-600 transition-colors'>
                          {tune.tune.creator.username}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className='flex mt-5'>
        <div className='flex gap-2 mx-auto'>
          <PrevButton 
                onClick={onPrevButtonClick} 
                disabled={prevBtnDisabled} 
                className="size-10 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
            />
          <NextButton 
              onClick={onNextButtonClick} 
              disabled={nextBtnDisabled} 
              className="size-10 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
          />
          </div>
      </div>
    </section>
  )
}
export default EmblaCarousel