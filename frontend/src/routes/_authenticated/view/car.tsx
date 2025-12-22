import { createFileRoute } from '@tanstack/react-router'
// import { authFetch } from '../../../api/authFetch'
// import { BACKEND } from '../../../config/env'
// import type { AuthState } from '../../../types/auth'

export const Route = createFileRoute('/_authenticated/view/car')({
//   loader: ({context, params: {carId}}) => fetchCar(carId, context.auth),
  component: RouteComponent,
})

// const fetchCar = async(carId: number, authContext: AuthState) => {
//     try {   
//         const car = await authFetch(`${BACKEND}/view/car/${carId}`, {method: 'GET'}, authContext);
//     }catch(){

//     }
    
// }

function RouteComponent() {
  return <div>Hello "/_authenticated/view/car"!</div>
}
