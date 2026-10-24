import { Migration } from '@mikro-orm/migrations';

export class Migration20250724022200 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "intake" ("id" serial primary key, "opens" timestamptz not null, "closes" timestamptz null, "month_year_key" varchar(255) not null default '2025-07', "status" text check ("status" in ('upcoming', 'open', 'closed', 'overdue')) not null default 'open', "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
    this.addSql(`alter table "intake" add constraint "intake_month_year_key_unique" unique ("month_year_key");`);

    this.addSql(`create table "next_of_kin" ("id" bigserial primary key, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "email" varchar(255) not null, "phone" varchar(255) not null, "relationship" varchar(255) not null);`);

    this.addSql(`create table "applicant" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "first_name" varchar(255) not null, "middle_name" varchar(255) null, "last_name" varchar(255) not null, "email" varchar(255) not null, "phone" varchar(255) not null, "id_type" varchar(255) null, "id_number" varchar(255) null, "gender" varchar(255) null, "birth_day" timestamptz null, "county" varchar(255) null, "sub_county" varchar(255) null, "constituency" varchar(255) null, "ward" varchar(255) null, "next_of_kin_id" bigint null, "primary_school" varchar(255) null, "secondary_school" varchar(255) null, "kcse_index_number" varchar(255) null, "kcse_grade" varchar(255) null, "course" int null, "intake_id" int not null, "documents" jsonb not null, "admitted" boolean null default false, constraint "applicant_pkey" primary key ("id"));`);
    this.addSql(`alter table "applicant" add constraint "applicant_email_unique" unique ("email");`);
    this.addSql(`alter table "applicant" add constraint "applicant_phone_unique" unique ("phone");`);
    this.addSql(`alter table "applicant" add constraint "applicant_next_of_kin_id_unique" unique ("next_of_kin_id");`);

    this.addSql(`alter table "applicant" add constraint "applicant_next_of_kin_id_foreign" foreign key ("next_of_kin_id") references "next_of_kin" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "applicant" add constraint "applicant_intake_id_foreign" foreign key ("intake_id") references "intake" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "applicant" drop constraint "applicant_intake_id_foreign";`);

    this.addSql(`alter table "applicant" drop constraint "applicant_next_of_kin_id_foreign";`);

    this.addSql(`drop table if exists "intake" cascade;`);

    this.addSql(`drop table if exists "next_of_kin" cascade;`);

    this.addSql(`drop table if exists "applicant" cascade;`);
  }

}
