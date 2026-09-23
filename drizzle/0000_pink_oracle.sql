CREATE TABLE `zepe_accounts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
