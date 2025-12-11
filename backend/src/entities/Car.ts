import { Entity, PrimaryKey, Property, Index, SmallIntType, IntegerType, TinyIntType } from '@mikro-orm/core';

@Entity({ tableName: 'cars' })
export class Car {
  @PrimaryKey({type: "int"})
  id!: IntegerType;

  @Property({type: "smallint"})
  Year!: SmallIntType;

  @Property({length: 60, type: "varchar"})
  Manufacturer!: string; 

  @Property({length: 100, type: "varchar"})
  Model!: string;

  @Property({length: 3, type: "char"})
  Drivetrain!: string;

  @Property({type: "decimal", precision: 5, scale: 3, nullable: true})
  Displacement?: string | null;

  @Property({length: 30, nullable: true, type: "varchar"})
  Aspiration?: string | null;

  @Property({fieldName: "Engine Type", length: 100, type: "varchar"})
  EngineType!: string;

  @Property({fieldName: "Fuel Type", length: 20, type: "varchar"})
  FuelType!: string;

  @Property({type: "smallint"})
  Horsepower!: SmallIntType;

  @Property({fieldName: "Torque (ft-lb)", type:"smallint"})
  Torque!: SmallIntType;

  @Property({fieldName: "Weight (lb)", type: "smallint"})
  Weight!: SmallIntType;

  @Property({fieldName: "Front%", type: "tinyint"})
  FrontPercent!: TinyIntType;

  @Property({type: "decimal", precision: 3, scale: 1})
  Speed!: string;

  @Property({ type: "decimal", precision: 3, scale: 1 })
  Handling!: string;

  @Property({ type: "decimal", precision: 3, scale: 1 })
  Acceleration!: string;

  @Property({ type: "decimal", precision: 3, scale: 1 })
  Launch!: string;

  @Property({ type: "decimal", precision: 3, scale: 1 })
  Braking!: string;

  @Property({ type: "decimal", precision: 3, scale: 1 })
  Offroad!: string;

  @Property({ length: 10 , type: "varchar"})
  Rank!: string;

  @Property ({length: 100, nullable: true, type: "varchar"})
  image_filename?: string | null;

  @Index({type: 'fulltext'})
  @Property({length: 200, nullable: false, type: "varchar"})
  Vehicle!: string;
}