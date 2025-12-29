import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleRight, faChevronCircleLeft } from '@fortawesome/free-solid-svg-icons';
import type { RecentTunes } from '../../types/tune';


const MultiItemCarousel = ({ recentTunes}: {recentTunes: RecentTunes[]}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // const recentTunes = recentTunes || [];
  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(recentTunes.length / itemsPerSlide);
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };
  
  // const goToSlide = (index) => {
  //   setCurrentIndex(index);
  // };
  
  if (!recentTunes || recentTunes.length === 0) {
    return (
      <div className="text-center text-black py-8">
        No recent tunes found
      </div>
    );
  }
  
  return (
      <div className="relative ml-10">
        {/* Carousel Container */}
        <div className="overflow-hidden rounded-xl ">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div 
                key={slideIndex}
                className="ml-2 min-w-full flex gap-7 px-2"
              >
                {recentTunes
                  .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                  .map((tune) => (
                    <div
                      key={tune.tune.tune_id}
                      className="w-3/10 shrink-0 bg-linear-to-br from-white 
                      to-gray-300 rounded-lg p-6 text-black"
                    >
                      <div className="h-40 flex flex-col justify-between">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{tune.tune?.tune_name || 'Untitled'}</h3>
                          <p className="text-black/90 text-sm">
                            Saved on: {new Date(tune.saved_on).toLocaleDateString()}
                          </p>
                        </div>
                        <button className="bg-white/20 hover:bg-white/30 px-4
                         py-2 rounded-lg transition-colors">
                          Play Tune
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Navigation Buttons - Only show if more than 3 items */}
        {recentTunes.length > itemsPerSlide && (
          <>
              <FontAwesomeIcon aria-label="Previous slide" className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors" size="xl" onClick={prevSlide} icon={faChevronCircleLeft} />
              <FontAwesomeIcon aria-label="Next Slide" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors" size="xl" onClick={nextSlide} icon={faChevronCircleRight} />
          
          </>
        )}
      </div>
  );
};

export default MultiItemCarousel;