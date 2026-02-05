import { Entity, PrimaryKey, Property, ManyToOne, SmallIntType, TinyIntType, Unique, OneToMany, Cascade, Collection, DecimalType } from '@mikro-orm/core';
import { Car } from './Car';
import { User } from './User';
import { SavedTunes } from './SavedTunes';
import { DecimalLocale } from 'validator';


@Entity({tableName: 'tunes'})
@Unique({properties: ['creator', 'tune_name', 'public_url']})
export class Tune {
    @PrimaryKey({type: "smallint", autoincrement: true, nullable: false})
    tune_id?: number

    @Property({type: "varchar", length: 50, nullable: false})
    tune_name?: string

    @ManyToOne(() => User, {fieldName: 'creator_user_id', nullable: false})
    creator?: User

    @ManyToOne(() => Car, {fieldName: 'car_id', nullable: false})
    car?: Car

    @OneToMany(() => SavedTunes, savedTune => savedTune.tune, {cascade: [Cascade.PERSIST]})
    savedBy = new Collection<SavedTunes>(this);

    @Property({type: "datetime", nullable: false})
    created_on?: Date

    @Property({type: "datetime", nullable: false})
    updated_on?: Date

    @Property({ type: new DecimalType('number'), precision: 2, scale: 1, nullable: false,  })
    front_tire_pressure!: number;

    @Property({ type: new DecimalType('number'), precision: 2, scale: 1, nullable: false })
    rear_tire_pressure!: number;

    @Property({ type: new DecimalType('number'), precision: 3, scale: 2, nullable: false })
    final_drive!: number;

    @Property({ type: new DecimalType('number'), precision: 3, scale: 1, nullable: false })
    front_camber!: number;

    @Property({ type: new DecimalType('number'), precision: 3, scale: 1, nullable: false })
    rear_camber!: number;

    @Property({ type: new DecimalType('number'), precision: 3, scale: 1, nullable: false })
    front_toe!: number;

    @Property({ type: new DecimalType('number'), precision: 3, scale: 1, nullable: false })
    rear_toe!: number;

    @Property({ type: new DecimalType('number'), precision: 2, scale: 1, nullable: false })
    front_caster!: number;

    @Property({ type: new DecimalType('number'), precision: 4, scale: 2, nullable: false })
    front_arb!: number;

    @Property({ type: new DecimalType('number'), precision: 4, scale: 2, nullable: false })
    rear_arb!: number;

    @Property({ type: new DecimalType('number'), precision: 4, scale: 1, nullable: false })
    front_spring!: number;

    @Property({ type: new DecimalType('number'), precision: 4, scale: 1, nullable: false })
    rear_spring!: number;

    @Property({ type: new DecimalType('number'), precision: 3, scale: 1, nullable: false })
    front_ride_height!: number;

    @Property({ type: new DecimalType('number'), precision: 3, scale: 1, nullable: false })
    rear_ride_height!: number;

    @Property({ type: new DecimalType('number'), precision: 3, scale: 1, nullable: false })
    front_rebound!: number;

    @Property({ type: new DecimalType('number'), precision: 3, scale: 1, nullable: false })
    rear_rebound!: number;

    @Property({ type: new DecimalType('number'), precision: 3, scale: 1, nullable: false })
    front_bump!: number;

    @Property({ type: new DecimalType('number'), precision: 3, scale: 1, nullable: false })
    rear_bump!: number;

    @Property({ type: new DecimalType('number'), unsigned: true, nullable: false })
    front_aero!: number;

    @Property({ type: "smallint", unsigned: true, nullable: false })
    rear_aero!: number;

    @Property({ type: "tinyint", unsigned: true, nullable: false })
    brake_balance!: number;

    @Property({ type: "tinyint", unsigned: true, nullable: false })
    brake_pressure!: number;

    @Property({ type: "tinyint", unsigned: true, nullable: false })
    front_diff_accel!: number;

    @Property({ type: "tinyint", unsigned: true, nullable: false })
    front_diff_decel!: number;

    @Property({ type: "tinyint", unsigned: true, nullable: false })
    rear_diff_accel!: number;

    @Property({ type: "tinyint", unsigned: true, nullable: false })
    rear_diff_decel!: number;

    @Property({ type: "tinyint", unsigned: true, nullable: false })
    center_diff_balance!: SmallIntType;

    @Property({ type: 'varchar', length: 3, nullable: false})
    resultant_rank!: string;

    @Property({type: 'varchar', length: 22, nullable: false})
    public_url!: string;

    constructor(tune_id?: number, tune_name?: string, creator?: User, car?: Car, created_on?: Date){
        this.tune_name = tune_name;
        this.creator = creator;
        this.car = car;
        this.tune_id = tune_id;
        this.created_on = created_on;
        this.updated_on = created_on;
    }
}
