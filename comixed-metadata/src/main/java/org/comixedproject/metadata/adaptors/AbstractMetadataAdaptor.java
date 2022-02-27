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

package org.comixedproject.metadata.adaptors;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import java.util.Set;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.model.metadata.MetadataSource;
import org.comixedproject.model.metadata.MetadataSourceProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;

/**
 * <code>AbstractMetadataAdaptor</code> provides a foundation for building new instances of {@link
 * MetadataAdaptor}.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
@RequiredArgsConstructor
public abstract class AbstractMetadataAdaptor implements MetadataAdaptor {
  private static final String VOLUMES_KEY = "volumes[%s]";
  private static final String ISSUE_KEY = "issues[%d-%s]";
  private static final String ISSUE_DETAILS_KEY = "issue[%d]";

  @Autowired protected ObjectMapper objectMapper;

  @Getter @NonNull private final String source;
  @Getter @NonNull private final String identifier;

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
  public IssueMetadata getIssue(
      final Integer volume, final String issueNumber, final MetadataSource metadataSource)
      throws MetadataException {
    String issue = issueNumber;
    while (!issue.isEmpty()
        && !issue.equals("0")
        && "123456789%ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(issue.toUpperCase().substring(0, 1))
            == -1) {
      issue = issue.substring(1);
    }

    return this.doGetIssue(volume, issue, metadataSource);
  }

  protected String getSourcePropertyByName(
      final Set<MetadataSourceProperty> properties, final String name, final boolean required)
      throws MetadataException {
    log.debug("Looking for metadata source property: property={} [required:{}]", name, required);
    final Optional<MetadataSourceProperty> entry =
        properties.stream().filter(property -> property.getName().equals(name)).findFirst();
    if (entry.isEmpty() || !StringUtils.hasLength(entry.get().getValue())) {
      if (required) {
        throw new MetadataException("Missing required metadata source property: " + name);
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
   * @param metadataSource the metadata source
   * @return the issue
   * @throws MetadataException if an error occurs
   */
  protected abstract IssueMetadata doGetIssue(
      final Integer volume, final String issueNumber, final MetadataSource metadataSource)
      throws MetadataException;
}
