interface Car {
  id: number
  Year: number
  image_filename: string
  Model: string
  Manufacturer: string
  Rank: number
}


const CarTile = ({car}: {car: Car}) => {
    const manufacturerImg = car.Manufacturer.replace(/ /g, '_');
    const image_filename = car.image_filename ? car.image_filename.replace(/ /g, '_') : null;
    const imageUrl = `https://fh5-car-images.s3.ap-south-1.amazonaws.com/images/${car.image_filename ? manufacturerImg: 'Default'}/${car.image_filename ? image_filename : 'default_car.jpg'}`;

    return (
        <div
          key={car.id}
          className="relative w-full h-64 bg-gray-200 rounded-lg shadow overflow-hidden flex flex-col justify-end"
          style={{ minWidth: '220px', maxWidth: '300px' }}
        >
            <img src={imageUrl} alt={car.Model} className="absolute inset-0 w-full h-full object-contain p-2"/>
            <div className="absolute inset-0 bg-linear-to-t from-black/10 via-black/30 to-transparent" />
            <div className="relative z-10 p-3">
                <div
                  className="text-white font-semibold text-center text-base overflow-hidden text-ellipsis whitespace-nowrap w-full"
                  title={`${car.Year} - ${car.Manufacturer} ${car.Model}`}
                >
                  {car.Year} - {car.Manufacturer} {car.Model}
                </div>
                <div className="text-sm text-gray-200 text-center">Rank: {car.Rank}</div>
            </div>
        </div>
    )
}

export default CarTile;