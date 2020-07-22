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

import java.util.List;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.model.ScrapingIssue;
import org.comixedproject.scrapers.model.ScrapingVolume;

/**
 * A <code>ScrapingAdaptor</code> manages running the scraping actions for a given scraping source
 * and caching data retrieved.
 *
 * @author Darryl L. Pierce
 */
public interface ScrapingAdaptor {
  /**
   * Returns a list of volumes for the given series name.
   *
   * @param apiKey the API key
   * @param seriesName the series name
   * @param skipCache the skip cache flag
   * @return the list of volumes
   * @throws ScrapingException if an error occurs
   */
  List<ScrapingVolume> getVolumes(String apiKey, String seriesName, boolean skipCache)
      throws ScrapingException;

  /**
   * Returns a single issue.
   *
   * @param apiKey the API key
   * @param volume the volume
   * @param issueNumber the issue number within the volume
   * @param skipCache the skip cache flag
   * @return the issue or null
   * @throws ScrapingException if an error occurs
   */
  ScrapingIssue getIssue(String apiKey, Integer volume, String issueNumber, boolean skipCache)
      throws ScrapingException;

  /**
   * Retrieves the metadata for an issue and applies it to the given {@link Comic}.
   *
   * <p><em>NOTE:</em> This method does NOT save the updated comic.
   *
   * @param apiKey the API key
   * @param issueId the issue id
   * @param skipCache the skip cache flag
   * @param comic the comic id
   * @throws ScrapingException if an error occurs
   */
  void scrapeComic(
      final String apiKey, final String issueId, final Boolean skipCache, final Comic comic)
      throws ScrapingException;
}
