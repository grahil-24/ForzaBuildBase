import { redirect, Outlet, createFileRoute} from "@tanstack/react-router";
import Nav from "../components/Navbar";
import NotFoundComponent from "../components/NotFoundComponent";
import ErrorComponent from "../components/ErrorComponent";

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: ({context, location}) => {
        if(!context.auth.isAuthenticated){
            return redirect({
                to: '/login',
                search: {
                    // save current location for redirect after login
                   redirect: location.href, 
                },
            })
        }
    },
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
    component: () => (
        <div>
            <div className="pt-17">
                <Outlet/>
            </div>
        </div>
    )
})