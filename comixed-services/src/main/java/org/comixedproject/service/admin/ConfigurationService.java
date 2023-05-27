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
import org.apache.commons.lang.StringUtils;
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
  public static final String CFG_LIBRARY_MAX_RECORDS = "library.max-records";
  public static final String CFG_LIBRARY_ROOT_DIRECTORY = "library.root-directory";
  public static final String CFG_LIBRARY_COMIC_RENAMING_RULE = "library.comic-book.renaming-rule";
  public static final String CFG_LIBRARY_PAGE_RENAMING_RULE = "library.comic-page.renaming-rule";
  public static final String CFG_LIBRARY_DELETE_EMPTY_DIRECTORIES =
      "library.directories.delete-empty";
  public static final String CFG_LIBRARY_NO_COMICINFO_ENTRY = "library.metadata.no-comicinfo-entry";

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
      ConfigurationOption record = this.configurationRepository.findByName(option.getName());
      if (record == null) {
        log.info("Creating new configuration option: {}", option.getName());
        record = new ConfigurationOption(option.getName());
      }
      log.trace("Updating existing record: value={}", option.getValue());
      record.setValue(option.getValue().trim());
      log.trace("Updating existing record");
      this.configurationRepository.save(record);
    }

    return this.getAll();
  }

  /**
   * Returns the value for the option with the given name.
   *
   * @param name the option name
   * @return the option value
   */
  public String getOptionValue(final String name) {
    log.trace("Loading option");
    final ConfigurationOption option = this.configurationRepository.findByName(name);
    return option != null ? option.getValue() : null;
  }

  public String getOptionValue(final String name, final String defaultValue) {
    final String result = this.getOptionValue(name);
    return StringUtils.isNotEmpty(result) ? result : defaultValue;
  }
}
