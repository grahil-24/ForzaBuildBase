import { defineConfig } from "@mikro-orm/mysql";
import { Car } from "../entities/Car";
import {User} from '../entities/User';

export default defineConfig({
  entities: [Car, User],       // all entities go here
  dbName: process.env.MYSQL_DB,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PWD,
  port: 3306,
  debug: true,
});
