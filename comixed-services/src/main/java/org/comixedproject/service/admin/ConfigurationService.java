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

package org.comixedproject.service.admin;

import java.util.List;
import javax.transaction.Transactional;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.admin.ConfigurationOption;
import org.comixedproject.repositories.admin.ConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>ConfigurationService</code> provides business rules for instances of {@link
 * ConfigurationOption}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ConfigurationService {
  @Autowired private ConfigurationRepository configurationRepository;

  /**
   * Returns all configuration options.
   *
   * @return the configuration options
   */
  public List<ConfigurationOption> getAll() {
    log.trace("Loading all configuration options");
    return this.configurationRepository.getAll();
  }

  /**
   * Saves the given set of configuration options.
   *
   * @param options the options to save
   * @return the set of all configuration options
   * @throws ConfigurationOptionException if an error occurs
   */
  @Transactional
  public List<ConfigurationOption> saveOptions(final List<ConfigurationOption> options)
      throws ConfigurationOptionException {
    log.trace("Updating configuration {} option{}", options.size(), options.size() == 1 ? "" : "s");
    for (int index = 0; index < options.size(); index++) {
      var option = options.get(index);
      log.trace("Loading existing record: name={}", option.getName());
      final ConfigurationOption existing =
          this.configurationRepository.findByName(option.getName());
      if (existing == null)
        throw new ConfigurationOptionException(
            "No such configuration option: name=" + option.getName());
      log.trace("Updating existing record: value={}", option.getValue());
      existing.setValue(option.getValue());
      log.trace("Updating existing record");
      this.configurationRepository.save(existing);
    }

    return this.getAll();
  }
}
