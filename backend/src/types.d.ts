declare namespace Express{
    export interface Request {
        user_id: number;
    }
    export interface Response {
        user_id: number;
    }
    export interface JwtPayload {
        id: string
    }
}