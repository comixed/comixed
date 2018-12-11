-- add the sort_name column

ALTER TABLE comics add sort_name varchar(128);
CREATE INDEX index_sort_name ON comics (sort_name);
