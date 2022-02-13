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
import java.util.Optional;
import java.util.Set;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.metadata.MetadataSourceProperty;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.model.ScrapingIssue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;

/**
 * <code>AbstractScrapingAdaptor</code> provides a foundation for building new instances of {@link
 * ScrapingAdaptor}.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
@RequiredArgsConstructor
public abstract class AbstractScrapingAdaptor implements ScrapingAdaptor {
  private static final String VOLUMES_KEY = "volumes[%s]";
  private static final String ISSUE_KEY = "issues[%d-%s]";
  private static final String ISSUE_DETAILS_KEY = "issue[%d]";

  @Autowired protected ObjectMapper objectMapper;

  @Getter private final String identifier;
  @Getter private final String source;

  /**
   * Generates a consistent key for storing and fetching volume data.
   *
   * @param seriesName the series name
   * @return the key value
   */
  @Override
  public String getVolumeKey(final String seriesName) {
    log.debug("Generating volume key for: {}", seriesName);
    return String.format(VOLUMES_KEY, seriesName.toUpperCase());
  }

  @Override
  public String getIssueKey(final Integer volume, final String issueNumber) {
    return String.format(ISSUE_KEY, volume, issueNumber.toUpperCase());
  }

  @Override
  public String getIssueDetailsKey(final Integer issueId) {
    return String.format(ISSUE_DETAILS_KEY, issueId);
  }

  @Override
  public ScrapingIssue getIssue(
      final Integer volume, final String issueNumber, final Set<MetadataSourceProperty> properties)
      throws ScrapingException {
    String issue = issueNumber;
    while (!issue.isEmpty()
        && !issue.equals("0")
        && "123456789%ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(issue.toUpperCase().substring(0, 1))
            == -1) {
      issue = issue.substring(1);
    }

    return this.doGetIssue(volume, issue, properties);
  }

  protected String getSourcePropertyByName(
      final Set<MetadataSourceProperty> properties, final String name, final boolean required)
      throws ScrapingException {
    log.debug("Looking for metadata source property: property={} [required:{}]", name, required);
    final Optional<MetadataSourceProperty> entry =
        properties.stream().filter(property -> property.getName().equals(name)).findFirst();
    if (entry.isEmpty() || !StringUtils.hasLength(entry.get().getValue())) {
      if (required) {
        throw new ScrapingException("Missing required metadata source property: " + name);
      } else {
        log.debug("Property not found");
        return null;
      }
    }
    final String result = entry.get().getValue();
    log.debug("Found value: {}", result);
    return result;
  }

  /**
   * Must be overridden by child classes to provide the actual issue fetching implementation.
   *
   * @param volume the volume name
   * @param issueNumber the issue number
   * @param properties the source's properties
   * @return the issue
   * @throws ScrapingException if an error occurs
   */
  protected abstract ScrapingIssue doGetIssue(
      final Integer volume, final String issueNumber, final Set<MetadataSourceProperty> properties)
      throws ScrapingException;
}
