import { Entity, PrimaryKey, Property, SmallIntType, Unique} from "@mikro-orm/core";

interface UserOptions {
    email?: string;
    password?: string;
    username?: string;
    user_id?: number;
}

@Entity({tableName: "users"})
export class User{
    @PrimaryKey({type: "smallint", unsigned: true, autoincrement: true, nullable: false, hidden: true})
    user_id?:number

    @Unique()
    @Property({type: "varchar", nullable: false, length: 255})
    email?:string

    @Property({type: "char", length: 60, nullable: false})
    password?:string

    @Unique()
    @Property({type: "varchar", nullable: false, length: 30})
    username?:string

    @Property({type: "varchar", default: 'def.jpg'})
    profile_pic?: string = 'def.jpg';

    constructor(options?: UserOptions) {
        this.email = options?.email;
        this.password = options?.password;
        this.username = options?.username;
        this.user_id = options?.user_id;
    }

} 