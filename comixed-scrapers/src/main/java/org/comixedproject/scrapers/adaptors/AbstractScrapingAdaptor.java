/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.scrapers.adaptors;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.service.scraping.ScrapingCacheService;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * <code>AbstractScrapingAdaptor</code> provides a foundation for building new instances of {@link
 * ScrapingAdaptor}.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public abstract class AbstractScrapingAdaptor implements ScrapingAdaptor {
  private static final String VOLUMES_KEY = "volumes[%s]";
  private static final String ISSUES_KEY = "issues[%d-%s]";
  private static final String COMIC_DETAILS_KEY = "issue[%s]";

  @Autowired protected ObjectMapper objectMapper;
  @Autowired protected ScrapingCacheService scrapingCacheService;

  /**
   * Generates a consistent key for storing and fetching volume data.
   *
   * @param seriesName the series name
   * @return the key value
   */
  public String getVolumeKey(final String seriesName) {
    log.debug("Generating volume key for: {}", seriesName);
    return String.format(VOLUMES_KEY, seriesName);
  }

  /**
   * Generates a consistent key for storing and fetching issue data
   *
   * @param volume the volume id
   * @param issueNumber the issue number
   * @return the key value
   */
  public String getIssuesKey(final Integer volume, final String issueNumber) {
    return String.format(ISSUES_KEY, volume, issueNumber);
  }

  /**
   * Generates a consistent key for storing a fetching details for a single comic.
   *
   * @param issueId the issue number
   * @return the key value
   */
  public String getComicDetailsKey(final String issueId) {
    return String.format(COMIC_DETAILS_KEY, issueId);
  }

  public void loadEntriesFromCache(
      final String source, final String key, final ScrapingCacheValueProcessor processor)
      throws ScrapingException {
    log.debug("Loading scraping cache entries: source={} key={}", source, key);
    final List<String> entries = this.scrapingCacheService.getFromCache(source, key);
    if (entries == null) {
      log.debug("No entries found");
      return;
    }

    log.debug("Processing {} entr{}", entries.size(), entries.size() == 1 ? "y" : "ies");
    for (int index = 0; index < entries.size(); index++) {
      processor.processValue(entries.get(index));
    }
  }
}
