import { defineConfig } from "@mikro-orm/mysql";
import { Car } from "../entities/Car";
import {User} from '../entities/User';
import { SavedTunes } from "../entities/SavedTunes";
import { Tune } from "../entities/Tunes";

export default defineConfig({
  entities: [User, SavedTunes, Tune, Car],       // all entities go here
  // dbName: process.env.MYSQL_DB,
  // host: process.env.MYSQL_HOST,
  // user: process.env.MYSQL_USER,
  // password: process.env.MYSQL_PWD,
  // port: Number(process.env.MYSQL_DB_PORT),
  clientUrl: process.env.MYSQL_DB_URL,
  debug: true,
});
