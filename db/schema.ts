import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const zepeAccounts=sqliteTable('zepe_accounts',{userId:text('user_id').primaryKey(),state:text('state').notNull(),version:integer('version').notNull().default(0),updatedAt:text('updated_at').notNull()});
