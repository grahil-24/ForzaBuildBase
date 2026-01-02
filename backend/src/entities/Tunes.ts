import { Entity, PrimaryKey, Property, ManyToOne, SmallIntType, TinyIntType, Unique } from '@mikro-orm/core';
import { Car } from './Car';
import { User } from './User';


@Entity({tableName: 'tunes'})
@Unique({properties: ['creator', 'tune_name']})
export class Tune {
    @PrimaryKey({type: "smallint", autoincrement: true, nullable: false})
    tune_id!: SmallIntType

    @Property({type: "varchar", length: 50, nullable: false})
    tune_name!: string

    @ManyToOne(() => User, {fieldName: 'creator_user_id', nullable: false})
    creator!: User

    @ManyToOne(() => Car, {fieldName: 'car_id', nullable: false})
    car!: Car

    @Property({type: "datetime", nullable: false})
    created_on!: Date

    @Property({type: "datetime", nullable: false})
    updated_on!: Date

    @Property({ type: "decimal", precision: 2, scale: 1, nullable: false })
    front_tire_pressure!: string;

    @Property({ type: "decimal", precision: 2, scale: 1, nullable: false })
    rear_tire_pressure!: string;

    @Property({ type: "decimal", precision: 3, scale: 2, nullable: false })
    final_drive!: string;

    @Property({ type: "decimal", precision: 3, scale: 1, nullable: false })
    front_camber!: string;

    @Property({ type: "decimal", precision: 3, scale: 1, nullable: false })
    rear_camber!: string;

    @Property({ type: "decimal", precision: 3, scale: 1, nullable: false })
    front_toe!: string;

    @Property({ type: "decimal", precision: 3, scale: 1, nullable: false })
    rear_toe!: string;

    @Property({ type: "decimal", precision: 2, scale: 1, nullable: false })
    front_caster!: string;

    @Property({ type: "decimal", precision: 4, scale: 2, nullable: false })
    front_arb!: string;

    @Property({ type: "decimal", precision: 4, scale: 2, nullable: false })
    rear_arb!: string;

    @Property({ type: "decimal", precision: 4, scale: 1, nullable: false })
    front_spring!: string;

    @Property({ type: "decimal", precision: 4, scale: 1, nullable: false })
    rear_spring!: string;

    @Property({ type: "decimal", precision: 3, scale: 1, nullable: false })
    front_ride_height!: string;

    @Property({ type: "decimal", precision: 3, scale: 1, nullable: false })
    rear_ride_height!: string;

    @Property({ type: "decimal", precision: 3, scale: 1, nullable: false })
    front_rebound!: string;

    @Property({ type: "decimal", precision: 3, scale: 1, nullable: false })
    rear_rebound!: string;

    @Property({ type: "decimal", precision: 3, scale: 1, nullable: false })
    front_bump!: string;

    @Property({ type: "decimal", precision: 3, scale: 1, nullable: false })
    rear_bump!: string;

    @Property({ type: "smallint", unsigned: true, nullable: false })
    front_aero!: SmallIntType;

    @Property({ type: "smallint", unsigned: true, nullable: false })
    rear_aero!: SmallIntType;

    @Property({ type: "tinyint", unsigned: true, nullable: false })
    brake_balance!: TinyIntType;

    @Property({ type: "tinyint", unsigned: true, nullable: false })
    brake_pressure!: TinyIntType;

    @Property({ type: "tinyint", unsigned: true, nullable: false })
    front_diff_accel!: TinyIntType;

    @Property({ type: "tinyint", unsigned: true, nullable: false })
    front_diff_decel!: TinyIntType;

    @Property({ type: "tinyint", unsigned: true, nullable: false })
    rear_diff_accel!: TinyIntType;

    @Property({ type: "tinyint", unsigned: true, nullable: false })
    rear_diff_decel!: TinyIntType;

    @Property({ type: "tinyint", unsigned: true, nullable: false })
    center_diff_balance!: TinyIntType;

    @Property({ type: 'varchar', length: 3, nullable: false})
    resultant_rank!: string;

    constructor(tune_name: string, creator: User, car: Car){
        this.tune_name = tune_name;
        this.creator = creator;
        this.car = car;
        this.created_on = new Date();
        this.updated_on = new Date();
    }
}
