import { Entity, PrimaryKey, Property, SmallIntType, Unique} from "@mikro-orm/core";

interface UserOptions {
    email?: string;
    password?: string;
    username?: string;
    user_id?: SmallIntType;
}

@Entity({tableName: "users"})
export class User{
    @PrimaryKey({type: "smallint", unsigned: true, autoincrement: true, nullable: false})
    user_id?:SmallIntType

    @Unique()
    @Property({type: "varchar", nullable: false, length: 255})
    email?:string

    @Property({type: "char", length: 60, nullable: false})
    password?:string

    @Unique()
    @Property({type: "varchar", nullable: false, length: 30})
    username?:string

    constructor(options?: UserOptions) {
        this.email = options?.email;
        this.password = options?.password;
        this.username = options?.username;
        this.user_id = options?.user_id;
    }

} 