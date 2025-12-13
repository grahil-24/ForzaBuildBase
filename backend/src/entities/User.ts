import { Entity, PrimaryKey, Property, SmallIntType, Unique} from "@mikro-orm/core";

@Entity({tableName: "users"})
export class User{
    @PrimaryKey({type: "smallint", unsigned: true, autoincrement: true, nullable: false})
    user_id!:SmallIntType

    @Unique()
    @Property({type: "varchar", nullable: false, length: 255})
    email!:string

    @Property({type: "char", length: 60, nullable: false})
    password!:string

    constructor(email: string, password: string){
        this.email = email;
        this.password =  password;
    }
} 