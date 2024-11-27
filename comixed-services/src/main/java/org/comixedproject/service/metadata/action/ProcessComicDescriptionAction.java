/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
 * aLong with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.service.metadata.action;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.service.admin.ConfigurationService;
import org.jsoup.Jsoup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ProcessComicDescriptionAction</code> takes the incoming description and processes it before
 * it's applied to a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ProcessComicDescriptionAction {
  @Autowired private ConfigurationService configurationService;

  public String execute(final String description) {
    if (!this.configurationService.isFeatureEnabled(
        ConfigurationService.CFG_STRIP_HTML_FROM_METADATA)) {
      log.debug("Not stripping HTML from description: feature disabled");
      return description;
    }
    log.debug("Stripping HTML from description");
    return Jsoup.parse(description).text();
  }
}
