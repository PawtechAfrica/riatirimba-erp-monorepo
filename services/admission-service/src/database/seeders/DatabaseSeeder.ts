import type {EntityManager} from '@mikro-orm/core';
import {Seeder} from '@mikro-orm/seeder';
import {IntakeSeeder} from "./IntakeSeeder";
import {ApplicantSeeder} from "./ApplicantSeeder";

export class DatabaseSeeder extends Seeder {

    async run(em: EntityManager): Promise<void> {
        return this.call(em, [
            IntakeSeeder,
            ApplicantSeeder
        ])
    }

}
