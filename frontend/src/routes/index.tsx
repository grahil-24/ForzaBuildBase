import { createFileRoute } from '@tanstack/react-router'
import Header from '../components/landing page/Header'
import GetStartedBtn from '../components/landing page/GetStartedBtn'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <Header />
      <div className='mt-8 sm:mt-16 md:mt-20 flex flex-col items-center justify-center px-4 sm:px-6 pb-12 sm:pb-20'>
        <div className='max-w-3xl text-center'>
          <img 
          className="mx-auto mb-6 sm:mb-10 w-full max-w-md sm:max-w-xl px-4" 
          src='/logo/logo.png' 
          alt="ForzaBuildBase Logo"
          />
          <p className='text-sm sm:text-base md:text-lg leading-relaxed text-gray-700 mb-8 sm:mb-10 max-w-2xl mx-auto'>
          Build, tune, and share your perfect Forza Horizon 5 setups. Browse all <span className="font-semibold text-gray-900">903 cars</span>, create custom upgrades and tunes, then share them with the community. Whether you're racing, drifting, or dominating speed zones, find and save the builds that work.
          </p>
          <p className='text-base sm:text-xl font-medium text-gray-800 mb-8 sm:mb-10'>
          Start building your garage today.
          </p>
          <GetStartedBtn />
        </div>
      </div>
    </div>
  )
}