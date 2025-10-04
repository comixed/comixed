# Release Notes

## v3.0

This a BIG release, a major version upgrade.

If you are running an existing ComiXed release,  YOU MUST DO THE FOLLOWING
STEPS TO UPGRADE.

1. You need to *FIRST* have run v2.3.11 at least once before upgrading to 
   v3.0 to ensure your database is in the right state to migrate from
   V2 to v3.
2. If you are not running from a Docker container, you will need to
   install Java 21.
3. Before you install this release, you MUST drop the batch tables with the
   following query:
    * DROP TABLE BATCH_STEP_EXECUTION_CONTEXT;
    * DROP TABLE BATCH_JOB_EXECUTION_CONTEXT;
    * DROP TABLE BATCH_STEP_EXECUTION;
    * DROP TABLE BATCH_JOB_EXECUTION_PARAMS;
    * DROP TABLE BATCH_JOB_EXECUTION;
    * DROP TABLE BATCH_JOB_INSTANCE;
4. You will also need to clear out the metadata cache tables in the database
   using the following query:
    * DELETE FROM metadata_cache_entries;
    * DELETE FROM metadata_cache;
5. If you're using the ComicVine metadata adaptor, you will need to update to
   v3 or later of that plugin.
6. Another new feature is a simplified external application.properties file,
   which will contain ONLY those properties the user needs to change. You will
   need to copy the updated example properties file and put your settings into
   it before running this new release.
