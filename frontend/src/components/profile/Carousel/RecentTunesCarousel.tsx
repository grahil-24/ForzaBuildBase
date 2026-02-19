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
  const { slides, options} = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

  if (!slides) {
    return (
      <div className="text-center text-black py-8">
        No recent tunes found
      </div>
    )
  }

  return (
    <section className="max-w-280 m-auto">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex p-2 touch-pan-y touch-pinch-zoom -ml-4 sm:-ml-6 lg:-ml-8 backface-hidden">
          { 
          slides.map((tune) => {
            const imageURL = formatS3BucketURL({
              manufacturer: tune.tune.car.Manufacturer,
              image_filename: tune.tune.car.image_filename,
            })

            return (
              <div className="min-w-0 flex-[0_0_100%] pl-4 sm:flex-[0_0_50%] sm:pl-6 lg:flex-[0_0_calc(100%/3)] lg:pl-8" key={tune.tune.tune_id}>
                <div>
                  {/* Tune Card */}
                  <div className="relative w-full rounded-lg overflow-visible bg-white p-4 text-black shadow-sm hover:shadow-md transition h-full flex flex-col">
                    <div className={`bg-white pl-3 pr-3 pt-1 pb-1 rounded-md absolute top-5 right-5 text-lg ${rank_to_color[tune.tune.resultant_rank]} text-center font-bold`}>{tune.tune.resultant_rank}</div>
                    {/* Car Image */}
                    <div className="w-full h-32 mb-4 flex items-center justify-center">
                      <img
                        src={imageURL}
                        alt={tune.tune?.tune_name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex flex-col gap-2 mt-auto">
                      {/* Tune name and date */}
                      <div className="flex-col min-w-0">
                        <h3 className=" hover:underline text-xl font-semibold truncate">
                          <Link to='/view/tune/$tuneId' params={{tuneId: tune.tune.tune_id.toString()}}>
                            {tune.tune?.tune_name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600">
                          Saved on: {new Date(tune.saved_on).toLocaleString('en-GB',{day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      
                      {/* Created by section - now full width */}
                      <div className='flex items-center gap-3'>
                        <div className='text-sm text-gray-600'>Created by:</div>
                        <Link to='/u/$user' params={{user: tune.tune.creator.username}}>
                          <div className=' flex gap-2 items-center group'>
                            <img 
                              src={`${PROFILE_PIC}/${tune.tune.creator.profile_pic}`}
                              alt={`${tune.tune.creator.username}'s profile`}
                              className='size-5 sm:size-9 rounded-full object-cover'
                            />
                            <p className='group-hover:underline truncate'>{tune.tune.creator.username}</p>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex-row">
        <div className="flex m-auto w-1/13 gap-1">
          <div className='mr-auto'>
            {!prevBtnDisabled && 
              <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
            }
          </div>
          <div className='ml-auto'>
            {!nextBtnDisabled && 
              <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
            }
          </div>
        </div>
      </div>
    </section>
  )
}

export default EmblaCarousel