import { createFileRoute } from '@tanstack/react-router'
import Header from '../components/landing page/Header'
import GetStartedBtn from '../components/landing page/GetStartedBtn'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Header />
      <div className='mt-15 flex flex-col items-center justify-center px-4'>
        <div className='max-w-2xl text-center'>
          <img className="mx-auto mb-8 max-w-full scale-90"src='/logo/logo.png' />
          <p className='pb-10 text-xl leading-relaxed'>Welcome to ForzaBuildBase
          Build, tune, and share your perfect Forza Horizon 5 setups. Browse all 903 cars, create custom upgrades and tunes, then share them with the community. Whether you're racing, drifting, or dominating speed zones, find and save the builds that work.
          Start building your garage today.</p>
          <GetStartedBtn />
        </div>
      </div>
    </div>
  )
}
