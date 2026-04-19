ALTER TABLE "children" ALTER COLUMN "name" SET DATA TYPE varchar(80);--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "name" SET DATA TYPE varchar(200);--> statement-breakpoint
ALTER TABLE "word_logs" ALTER COLUMN "word" SET DATA TYPE varchar(80);--> statement-breakpoint
CREATE INDEX "idx_children_user_id" ON "children" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_milestones_child_id" ON "milestones" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_responses_child_id" ON "quiz_responses" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "idx_recommendations_child_id" ON "recommendations" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "idx_word_logs_child_id" ON "word_logs" USING btree ("child_id");--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_status_chk" CHECK (status IN ('not_yet','sometimes','consistently'));--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_category_chk" CHECK (category IN ('language','gross_motor','fine_motor'));--> statement-breakpoint
ALTER TABLE "word_logs" ADD CONSTRAINT "word_logs_type_chk" CHECK (type IN ('word','gesture'));