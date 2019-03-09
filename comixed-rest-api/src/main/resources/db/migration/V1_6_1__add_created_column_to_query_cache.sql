-- add created column to caching table

ALTER TABLE comic_vine_volume_query_cache add created timestamp not null;
