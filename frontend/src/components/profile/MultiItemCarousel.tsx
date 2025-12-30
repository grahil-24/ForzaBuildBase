import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleRight, faChevronCircleLeft, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { PencilIcon, Square2StackIcon } from '@heroicons/react/16/solid';
import type { RecentTunes } from '../../types/tune';
import type { AuthState } from '../../types/auth';
import { formatS3BucketURL } from '../../util/urlFormatter';

const MultiItemCarousel = ({user,recentTunes,}: {recentTunes: RecentTunes[];user: AuthState['user'];}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(recentTunes.length / itemsPerSlide);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);

  if (!recentTunes || recentTunes.length === 0) {
    return <div className="text-center text-black py-8">
            No recent tunes found
          </div>;
  }

  return (
    <div className="relative ml-10">

      {/* Outer Layout (NO overflow hidden here) */}
      <div className="rounded-xl relative">

        {/* Scroll Container (overflow only here) */}
        <div className="overflow-hidden rounded-xl">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="min-w-full flex gap-8 py-2">
                {recentTunes
                  .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                  .map((tune: RecentTunes) => {
                    const imageURL = formatS3BucketURL({
                      manufacturer: tune.tune.car.Manufacturer,
                      image_filename: tune.tune.car.image_filename,
                    });

                    return (
                      <div
                        key={tune.tune.tune_id}
                        className="relative w-full sm:w-1/2 lg:w-1/3 shrink-0 rounded-lg overflow-visible bg-white p-4 text-black shadow-sm hover:shadow-md transition cursor-pointer"
                      >
                        <div className="w-full h-32 mb-4">
                          <img
                            src={imageURL}
                            alt={tune.tune?.tune_name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Text + Menu */}
                        <div className="flex flex-row items-start">
                          <div>
                            <h3 className="text-xl font-semibold">{tune.tune?.tune_name}</h3>
                            <p className="text-sm text-gray-600">
                              Saved on {new Date(tune.saved_on).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Menu Trigger - ADD modal prop to portal the menu */}
                          <Menu as="div" className="relative ml-auto">
                            <MenuButton className="p-1 rounded-md hover:bg-gray-100">
                              <FontAwesomeIcon icon={faEllipsisVertical} className="text-gray-600" />
                            </MenuButton>

                            <MenuItems
                              modal={false}
                              anchor="bottom end"
                              className="z-9999 w-44 bg-white border border-gray-200 rounded-lg shadow-xl p-1 text-sm focus:outline-none mt-1"
                            >
                              <MenuItem>
                                <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-gray-900">
                                  <PencilIcon className="size-4 text-gray-500" />
                                  Edit
                                </button>
                              </MenuItem>

                              <MenuItem>
                                <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-gray-900">
                                  <Square2StackIcon className="size-4 text-gray-500" />
                                  Duplicate
                                </button>
                              </MenuItem>
                            </MenuItems>
                          </Menu>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      {recentTunes.length > itemsPerSlide && (
        <>
          <FontAwesomeIcon
            aria-label="Previous slide"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer z-50"
            size="xl"
            onClick={prevSlide}
            icon={faChevronCircleLeft}
          />

          <FontAwesomeIcon
            aria-label="Next Slide"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer z-50"
            size="xl"
            onClick={nextSlide}
            icon={faChevronCircleRight}
          />
        </>
      )}
    </div>
  );
};

export default MultiItemCarousel;