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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 * <code>DatabaseCommandAdaptor</code> manages executing database command objects.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
@PropertySource("classpath:/dbcommands.properties")
@ConfigurationProperties(prefix = "db-control")
public class DatabaseCommandAdaptor {
  @Autowired private ApplicationContext applicationContext;

  @Getter private List<DatabaseCommandEntry> commands = new ArrayList<>();

  /**
   * Returns the registered action for the given name.
   *
   * @param name the command name
   * @return the action
   * @throws DatabaseCommandException if the command is invalid
   */
  public DatabaseCommand getCommand(final String name) throws DatabaseCommandException {
    log.trace("Looking for command entry: {}", name);
    final Optional<DatabaseCommandEntry> entry =
        this.commands.stream()
            .filter(databaseCommandEntry -> databaseCommandEntry.getName().equals(name))
            .findFirst();

    if (entry.isEmpty()) throw new DatabaseCommandException("No such command: " + name);

    try {
      log.trace("Loading command bean: {}", entry.get().getBean());
      final DatabaseCommand bean =
          this.applicationContext.getBean(entry.get().getBean(), DatabaseCommand.class);

      log.debug("Returning bean: {}", bean);
      return bean;
    } catch (BeansException error) {
      throw new DatabaseCommandException("Failed to load database command bean", error);
    }
  }

  @NoArgsConstructor
  @AllArgsConstructor
  static class DatabaseCommandEntry {
    @Getter @Setter private String name;
    @Getter @Setter private String bean;
  }
}
