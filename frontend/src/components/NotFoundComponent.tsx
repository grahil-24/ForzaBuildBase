const NotFoundComponent = () => {
    return (
    <div>
      <div className="relative min-h-screen bg-white flex items-center">
        <div className="container mx-auto">
          <div className="-mx-4 flex">
            <div className="w-full px-4">
              <div className="mx-auto max-w-[400px] text-center">
                <h2 className="mb-2 text-[50px] font-bold leading-none text-black sm:text-[80px] md:text-[100px]">
                  404
                </h2>
                <h4 className="mb-3 text-[22px] font-semibold leading-tight text-black">
                  Oops! That page can't be found
                </h4>
                <p className="mb-8 text-lg text-black">
                  The page you are looking for doesnt exist
                </p>
                <a
                  href="/dashboard"
                  className="inline-block rounded-lg border px-8 py-3 text-center text-base font-semibold border-black text-black transition duration-300 hover:bg-black hover:text-white"
                >
                  Go To Home
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute left-0 top-0 -z-10 flex h-full w-full items-center justify-between space-x-5 md:space-x-8 lg:space-x-14">
          <div className="h-full w-1/3 bg-linear-to-t from-white/8 to-transparent"></div>
          <div className="flex h-full w-1/3">
            <div className="h-full w-1/2 bg-linear-to-b from-white/8 to-transparent"></div>
            <div className="h-full w-1/2 bg-linear-to-t from-white/8 to-transparent"></div>
          </div>
          <div className="h-full w-1/3 bg-linear-to-b from-white/8 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundComponent;