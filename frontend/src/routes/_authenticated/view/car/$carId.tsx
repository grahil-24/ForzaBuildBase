import { createFileRoute, notFound, redirect} from '@tanstack/react-router'
import type { AuthState } from '../../../../types/auth'
import { authFetch } from '../../../../api/authFetch';
import { BACKEND } from '../../../../config/env';
import { SessionExpiredError } from '../../../../errors/auth.errors';
import NotFoundComponent from '../../../../components/NotFoundComponent';

interface PathParams {
  carId: string  // Note: route params are typically strings
}

export const Route = createFileRoute('/_authenticated/view/car/$carId')({
  loader: ({context, params}) => fetchCar(params, context.auth),
  notFoundComponent: NotFoundComponent,
  component: RouteComponent,
});

const fetchCar = async(params: PathParams, authContext: AuthState) => {
    try{
      const car = await authFetch(`${BACKEND}/view/car/${params.carId}`,
          {method: 'GET'},
          authContext
      )
      if(car.status === 404){
        throw notFound();
      }
    }catch(err: unknown){
      if(err instanceof SessionExpiredError){
        await authContext.logout();
        throw redirect({to: '/'});
      }
      throw err;
    }
}

function RouteComponent() {
  const { carId } = Route.useParams()
  return <div>Hello car {carId}!</div>
}