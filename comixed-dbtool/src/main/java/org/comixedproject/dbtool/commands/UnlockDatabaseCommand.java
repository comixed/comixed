/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.dbtool.commands;

import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import javax.sql.DataSource;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>UnlockDatabaseCommand</code> removes the database lock created by Liquibase during a
 * migration that failed.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class UnlockDatabaseCommand implements DatabaseCommand {
  @Autowired private DataSource dataSource;

  @Override
  public void execute() throws DatabaseCommandException {
    log.trace("Preparing to unlock database");
    try (Statement stmt = this.dataSource.getConnection().createStatement()) {
      String query =
          String.format(
              "DELETE FROM DATABASECHANGELOGLOCK WHERE LOCKED=true AND LOCKGRANTED < '%s'",
              new Timestamp(System.currentTimeMillis()));
      int updateCount = stmt.executeUpdate(query);
      if (updateCount > 0) {
        log.info("Lock removed");
      } else {
        log.info("Lock not removed");
      }
    } catch (SQLException error) {
      throw new DatabaseCommandException("Failed to unlocked database", error);
    }
  }
}
