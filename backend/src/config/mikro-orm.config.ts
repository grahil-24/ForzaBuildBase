import { defineConfig } from "@mikro-orm/mysql";
import { Car } from "../entities/Car";
import {User} from '../entities/User';
import { SavedTunes } from "../entities/SavedTunes";
import { Tune } from "../entities/Tunes";

export default defineConfig({
  entities: [Car, User, SavedTunes, Tune],       // all entities go here
  dbName: process.env.MYSQL_DB,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PWD,
  port: 3306,
  debug: true,
});
