import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Tune } from "./Tunes";
import { User } from "./User";

@Entity({tableName: 'saved_tunes'})
export class SavedTunes {
    @PrimaryKey({type: "smallint", nullable: false})
    @ManyToOne(() => Tune, {fieldName: 'tune_id', deleteRule: 'cascade', primary: true})
    tune!: Tune

    @PrimaryKey({type: "smallint", nullable: false})
    @ManyToOne(() => User, {fieldName: 'user_id', deleteRule: 'cascade', primary: true})
    user!: User;

    @Property({type: "datetime", nullable: false})
    saved_on!: Date

    constructor(tune: Tune, user: User){
        this.tune = tune;
        this.user = user;
        this.saved_on = new Date();
    }
}