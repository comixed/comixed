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
import org.comixedproject.model.comic.Comic;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.model.ScrapingIssue;
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
  @Autowired private ImprintAdaptor imprintAdaptor;

  /**
   * Generates a consistent key for storing and fetching volume data.
   *
   * @param seriesName the series name
   * @return the key value
   */
  public String getVolumeKey(final String seriesName) {
    log.debug("Generating volume key for: {}", seriesName);
    return String.format(VOLUMES_KEY, seriesName.toUpperCase());
  }

  /**
   * Generates a consistent key for storing and fetching issue data
   *
   * @param volume the volume id
   * @param issueNumber the issue number
   * @return the key value
   */
  public String getIssuesKey(final Integer volume, final String issueNumber) {
    return String.format(ISSUES_KEY, volume, issueNumber.toUpperCase());
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

  @Override
  public void scrapeComic(
      final String apiKey, final String issueId, final Boolean skipCache, final Comic comic)
      throws ScrapingException {
    this.doScrapeComic(apiKey, issueId, skipCache, comic);
    this.imprintAdaptor.update(comic);
  }

  /**
   * Must be overridden by child classes to provide the actual scraping implementation.
   *
   * @param apiKey the api key
   * @param issueId the issue id
   * @param skipCache the skip cache flag
   * @param comic the comic
   * @throws ScrapingException if an error occurs
   */
  protected abstract void doScrapeComic(
      final String apiKey, final String issueId, final Boolean skipCache, final Comic comic)
      throws ScrapingException;

  @Override
  public ScrapingIssue getIssue(
      final String apiKey, final Integer volume, final String issueNumber, final boolean skipCache)
      throws ScrapingException {
    String issue = issueNumber;
    while (!issue.isEmpty()
        && !issue.equals("0")
        && "123456789%ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(issue.toUpperCase().substring(0, 1))
            == -1) {
      issue = issue.substring(1);
    }

    return this.doGetIssue(apiKey, volume, issue, skipCache);
  }

  /**
   * Must be overridden by child classes to provide the actual issue fetching implementation.
   *
   * @param apiKey the api key
   * @param volume the vname
   * @param issueNumber the issue number
   * @param skipCache the skip cache flag
   * @return the issue
   * @throws ScrapingException
   */
  protected abstract ScrapingIssue doGetIssue(
      final String apiKey, final Integer volume, final String issueNumber, final boolean skipCache)
      throws ScrapingException;
}
