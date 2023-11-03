# Overview

This document describes the process of upgrading from one version of ComiXed
to another. It also includes notes for any specific upgrade steps that need
to be performed.


# The Standard Upgrade Path

## Before Installing The New Release

Perform the following steps prior to installing the upgrade.

### Backup The Database

To upgrade from one version of ComiXed to another, the recommended steps are:

1. Shut down the existing ComiXed instance.
1. Run ```$ROOT/bin/dbbackup.sh``` to backup your current database. (If you're running Windows, then run ```$ROOT\bin\dbbackup.bat```.)
1. Copy the generated file (**comixed-backup-$VERSION.zip**) to a separate location.


## Install The Upgrade

You should be able to perform your upgrade of ComiXed at this point.

## After Installing The New Release

### Restore The Database

Once the new release is installed, and **before running the application**:

1. Delete the old database. On *nix/Mac it will be in ```$HOME/.comixed```, and on Windows it will be in ```C:\Users\yourusername\.comixed```.
1. Run the new install's ```$ROOT/bin/dbrestore.sb``` and pass it the path to your database back. (If you're running Wndows, then run ```$ROOT\bin\dbrestore.bat```.)
1. Start the application.


# Specific Version Migration Notes

## v1.6.0 And Earlier

No special steps are required to upgrade to v1.6.0 from a previous version.

## v1.6.1 -> v2.0

If you are running a version prior to v1.6.1, then you **must** first upgrade
to v1.6.0. After installing v1.6.0 and running it, you should run the server
once to perform some necessary database changes. Then you can perform the
recommended upgrade steps.

Next you will need to run the following SQL. To do this, start up ComiXed with the
database console enabled using the **-C** commandline option:

```sql
DROP TABLE  BATCH_STEP_EXECUTION_CONTEXT IF EXISTS;
DROP TABLE  BATCH_JOB_EXECUTION_CONTEXT IF EXISTS;
DROP TABLE  BATCH_STEP_EXECUTION IF EXISTS;
DROP TABLE  BATCH_JOB_EXECUTION_PARAMS IF EXISTS;
DROP TABLE  BATCH_JOB_EXECUTION IF EXISTS;
DROP TABLE  BATCH_JOB_INSTANCE IF EXISTS;

DROP SEQUENCE  BATCH_STEP_EXECUTION_SEQ IF EXISTS;
DROP SEQUENCE  BATCH_JOB_EXECUTION_SEQ IF EXISTS;
DROP SEQUENCE  BATCH_JOB_SEQ IF EXISTS;
```

After this, you can then run ComiXed 2.0.
