import type { Car , RankType} from "../types/car";

const rank_to_color: Record<RankType, string> = {
  S2: "text-blue-800",
  S1: "text-purple-500",
  A: "text-rose-600",
  B: "text-orange-500",
  C: "text-amber-300",
  D: "text-cyan-300"
}


const CarTile = ({car}: {car: Car}) => {
    const manufacturerImg = car.Manufacturer.replace(/ /g, '_');
    const image_filename = car.image_filename ? car.image_filename.replace(/ /g, '_') : null;
    const imageUrl = `https://fh5-car-images.s3.ap-south-1.amazonaws.com/images/${car.image_filename ? manufacturerImg: 'Default'}/${car.image_filename ? image_filename : 'default_car.jpg'}`;
    const rank_color: string = rank_to_color[car.Rank];

    return (
        <div
          key={car.id}
          className="relative w-full h-64 bg-gray-200 rounded-lg shadow overflow-hidden flex flex-col justify-end"
          style={{ minWidth: '220px', maxWidth: '300px' }}
        >
            <div className={`bg-white pl-3 pr-3 pt-1 pb-1 rounded-md absolute top-5 right-5 text-lg ${rank_color} text-center font-bold`}>{car.Rank}</div>
            <img src={imageUrl} alt={car.Model} className="absolute inset-0 w-full h-full object-contain p-2"/>
            <div className="absolute inset-0 bg-linear-to-t from-black/10 via-black/30 to-transparent" />
            <div className="relative z-10 p-3">
                <div
                  className="text-white font-semibold text-center text-base overflow-hidden text-ellipsis whitespace-nowrap w-full"
                  title={`${car.Year} - ${car.Manufacturer} ${car.Model}`}
                >
                  {car.Year} - {car.Manufacturer} {car.Model}
                </div>
            </div>
        </div>
    )
}

export default CarTile;