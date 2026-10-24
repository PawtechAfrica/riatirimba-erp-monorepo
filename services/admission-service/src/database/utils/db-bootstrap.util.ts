import {EntityManager, MikroORM} from "@mikro-orm/postgresql";
import mikroOrmConfig from "../../mikro-orm.config";

export const db = {} as {
    em: EntityManager;
    orm: MikroORM;
};

/**
 * Initialize the global MikroORM instance.
 */
export async function initDB() {
    db.orm = await MikroORM.init(mikroOrmConfig);
    db.em = db.orm.em;

    // This will silently succeed if the extension is already there
    await db.em.getConnection().execute('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
    return db.em;
}
