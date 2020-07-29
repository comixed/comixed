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
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.model.ScrapingIssue;
import org.comixedproject.scrapers.model.ScrapingIssueDetails;
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
   * <p>If <code>maxRecords</code> is a non-positive value then all records are returned.
   *
   * @param apiKey the API key
   * @param seriesName the series name
   * @param maxRecords the maximum records to fetch
   * @return the list of volumes
   * @throws ScrapingException if an error occurs
   */
  List<ScrapingVolume> getVolumes(String apiKey, String seriesName, Integer maxRecords)
      throws ScrapingException;

  /**
   * Generates a consistent key for storing a fetching details for a single comic.
   *
   * @param issueId the issue number
   * @return the key value
   */
  String getIssueDetailsKey(Integer issueId);

  /**
   * Returns a single issue.
   *
   * @param apiKey the API key
   * @param volume the volume
   * @param issueNumber the issue number within the volume
   * @return the issue or null
   * @throws ScrapingException if an error occurs
   */
  ScrapingIssue getIssue(String apiKey, Integer volume, String issueNumber)
      throws ScrapingException;

  /**
   * Returns ta single issue with details.
   *
   * @param apiKey the api key
   * @param issueId the issue id
   * @return the issue details
   * @throws ScrapingException if an error occurs
   */
  ScrapingIssueDetails getIssueDetails(String apiKey, Integer issueId) throws ScrapingException;

  /**
   * Generates a consistent key for storing and fetching issue data.
   *
   * @param volume the volume id
   * @param issueNumber the issue number
   * @return the key value
   */
  String getIssueKey(Integer volume, String issueNumber);
}
