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

package org.comixedproject.dbtool;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.dbtool.commands.DatabaseCommand;
import org.comixedproject.dbtool.commands.DatabaseCommandAdaptor;
import org.comixedproject.dbtool.commands.DatabaseCommandException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * <code>ComiXedDBToolApp</code> is the main entry point for the DB management tool.
 *
 * @author Darryl L. Pierce
 */
@SpringBootApplication
@Log4j2
public class ComiXedDBToolApp implements ApplicationRunner {
  @Autowired private DatabaseCommandAdaptor databaseCommandAdaptor;

  public static void main(String[] args) {
    new SpringApplication(ComiXedDBToolApp.class).run(args);
  }

  @Override
  public void run(final ApplicationArguments args) {
    try {
      log.info("Starting ComiXed DB Tool");
      args.getOptionNames().forEach(s -> log.info(" [{}]={}", s, args.getOptionValues(s)));
      final List<String> commands = args.getNonOptionArgs();
      commands.forEach(s -> log.info(" command: {}", s));
      if (commands.isEmpty()) {
        log.error("No database command provided");
        System.exit(1);
      }
      for (int index = 0; index < commands.size(); index++) {
        final String name = commands.get(index);
        log.debug("Firing action: {}", name);
        final DatabaseCommand action = this.databaseCommandAdaptor.getCommand(name);
        log.trace("Executing action");
        action.execute();
      }
    } catch (DatabaseCommandException error) {
      log.error("Failed to run db command", error);
      System.exit(0);
    }
    System.exit(0);
  }
}
