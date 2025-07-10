DROP INDEX "stock_user_id_asset_id_unique";--> statement-breakpoint
DROP INDEX "user_chat_id_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "user_token_unique";--> statement-breakpoint
DROP INDEX "user_chat_id_email_unique";--> statement-breakpoint
ALTER TABLE `stock` ALTER COLUMN "ranges" TO "ranges" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `stock_user_id_asset_id_unique` ON `stock` (`user_id`,`asset_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_chat_id_unique` ON `user` (`chat_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_token_unique` ON `user` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_chat_id_email_unique` ON `user` (`chat_id`,`email`);