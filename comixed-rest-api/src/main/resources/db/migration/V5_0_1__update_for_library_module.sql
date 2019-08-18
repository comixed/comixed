-- add last updated column to comics table
ALTER TABLE comics ADD last_updated_date timestamp;
UPDATE comics c SET c.last_updated_date = c.added_date;
ALTER TABLE comics ALTER COLUMN last_updated_date timestamp NOT NULL;
