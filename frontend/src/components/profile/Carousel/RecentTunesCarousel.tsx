// RecentTunesCarousel.tsx
import React from 'react'
import { type EmblaOptionsType } from 'embla-carousel'
import { PrevButton, NextButton, usePrevNextButtons } from './CarouselArrowButton'
import useEmblaCarousel from 'embla-carousel-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical} from '@fortawesome/free-solid-svg-icons'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { PencilIcon, MinusCircleIcon, TrashIcon} from '@heroicons/react/16/solid'
import type { RecentTunes } from '../../../types/tune'
import { formatS3BucketURL } from '../../../util/urlFormatter'

type PropType = {
  slides: RecentTunes[]
  options?: EmblaOptionsType,
  user: string
}

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options, user } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

  if (!slides || slides.length === 0) {
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
          {slides.map((tune: RecentTunes) => {
            const imageURL = formatS3BucketURL({
              manufacturer: tune.tune.car.Manufacturer,
              image_filename: tune.tune.car.image_filename,
            })

            return (
              <div className="min-w-0 flex-[0_0_100%] pl-4 sm:flex-[0_0_50%] sm:pl-6 lg:flex-[0_0_calc(100%/3)] lg:pl-8" key={tune.tune.tune_id}>
                <div>
                  {/* Tune Card */}
                  <div className="relative w-full rounded-lg overflow-visible bg-white p-4 text-black shadow-sm hover:shadow-md transition cursor-pointer h-full flex flex-col">
                    
                    {/* Car Image */}
                    <div className="w-full h-32 mb-4 flex items-center justify-center">
                      <img
                        src={imageURL}
                        alt={tune.tune?.tune_name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Text + Menu */}
                    <div className="flex items-start mt-auto">
                      <div className="flex-col min-w-0">
                        <h3 className="text-xl font-semibold truncate">
                          {tune.tune?.tune_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Saved on {new Date(tune.saved_on).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className='mx-auto'>
                        <div>Created by:</div>
                        <div>{tune.tune.creator.username}</div>
                      </div>

                      {/* Menu Trigger */}
                      <Menu as="div" className="relative ml-2 shrink-0">
                        <MenuButton className="p-1 rounded-md hover:bg-gray-100">
                          <FontAwesomeIcon 
                            icon={faEllipsisVertical} 
                            className="text-gray-600" 
                          />
                        </MenuButton>

                        <MenuItems
                          transition
                          modal={false}
                          anchor="bottom end"
                          className="[--anchor-gap:--spacing(1)] data-closed:scale-95 data-closed:opacity-0 transition duration-100 ease-out z-9999 w-30 bg-white border border-gray-200 rounded-lg shadow-xl p-1 text-sm focus:outline-none mt-1"
                        >
                          {user === tune.tune.creator.username &&
                            <MenuItem>
                              <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-gray-900">
                                <PencilIcon className="size-4 text-gray-500" />
                                Rename
                              </button>
                            </MenuItem>
                          }
                          { user === tune.tune.creator.username ? 
                          (<MenuItem>
                            <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-gray-900">
                              <TrashIcon className="size-4 text-gray-500" />
                              Delete
                            </button>
                          </MenuItem>
                          ) : (
                            <MenuItem>
                              <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-gray-900">
                                <MinusCircleIcon className="size-4 text-gray-500" />
                                Remove
                              </button>
                            </MenuItem>
                          )
                        }
                        </MenuItems>
                      </Menu>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid-cols-[auto_1fr] flex justify-between gap-5 mt-7">
        <div className="grid grid-cols-2 gap-2 m-auto items-center">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>
      </div>
    </section>
  )
}

export default EmblaCarousel