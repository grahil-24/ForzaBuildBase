import { Entity, Index, PrimaryKey, Property, SmallIntType, Unique} from "@mikro-orm/core";

interface UserOptions {
    email?: string;
    password?: string;
    username?: string;
    user_id?: number;
}

@Entity({tableName: "users"})
@Index({properties: ['username'], type: 'fulltext', name: 'user_search'})
@Index({ properties: ['reset_token'], name: 'idx_reset_token' })
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

    @Property({type: "boolean", default: false})
    is_verified?: boolean

    @Property({type: "timestamp", nullable: true})
    expires_at?: Date | null

    @Property({type: "timestamp", nullable: true})
    created_at?: Date | null

    @Property({type: "char", nullable: true, length: 6})
    verification_code?: string | null

    @Property({type: "char", nullable: true, length:64})
    reset_token?: string | null

    @Property({type: "timestamp", nullable: true})
    reset_token_expires_at?: Date | null

    @Property({type: "timestamp", nullable: true})
    reset_token_created_at?: Date | null

    constructor(options?: UserOptions) {
        this.email = options?.email;
        this.password = options?.password;
        this.username = options?.username;
        this.user_id = options?.user_id;
    }

} 