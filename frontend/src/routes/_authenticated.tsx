import { redirect, Outlet, createFileRoute } from "@tanstack/react-router";
import Nav from "../components/Navbar";

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: ({context, location}) => {
        if(!context.auth.isAuthenticated){
            throw redirect({
                to: '/login',
                search: {
                    // save current location for redirect after login
                   redirect: location.href, 
                },
            })
        }
    },
    component: () => (
        <div>
            <Nav />
            <Outlet />
        </div>
    )
})