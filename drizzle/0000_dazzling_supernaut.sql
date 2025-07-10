CREATE TABLE `stock` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`asset_id` text NOT NULL,
	`ranges` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stock_user_id_asset_id_unique` ON `stock` (`user_id`,`asset_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chat_id` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`token` text,
	`enabled` integer DEFAULT true
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_chat_id_unique` ON `user` (`chat_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_token_unique` ON `user` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_chat_id_email_unique` ON `user` (`chat_id`,`email`);