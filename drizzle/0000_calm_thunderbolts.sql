CREATE TABLE `stock` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`asset_id` text NOT NULL,
	`ranges` text DEFAULT '[{"value":10,"in":false},{"value":9,"in":false},{"value":8,"in":false},{"value":7,"in":false},{"value":6,"in":false},{"value":5,"in":false},{"value":4,"in":false},{"value":3,"in":false},{"value":2,"in":false},{"value":1,"in":false},{"value":0.5,"in":true},{"value":-0.5,"in":true},{"value":-1,"in":false},{"value":-2,"in":false},{"value":-3,"in":false},{"value":-4,"in":false},{"value":-5,"in":false},{"value":-6,"in":false},{"value":-7,"in":false},{"value":-8,"in":false},{"value":-9,"in":false},{"value":-10,"in":false}]' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stock_user_id_asset_id_unique` ON `stock` (`user_id`,`asset_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chat_id` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`token` text,
	`enabled` integer DEFAULT true,
	`error` text DEFAULT 'null'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_chat_id_unique` ON `user` (`chat_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_token_unique` ON `user` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_chat_id_email_unique` ON `user` (`chat_id`,`email`);