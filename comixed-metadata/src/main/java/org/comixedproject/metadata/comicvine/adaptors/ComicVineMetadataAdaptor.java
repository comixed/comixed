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

package org.comixedproject.metadata.comicvine.adaptors;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.metadata.MetadataException;
import org.comixedproject.metadata.adaptors.AbstractMetadataAdaptor;
import org.comixedproject.metadata.adaptors.MetadataAdaptor;
import org.comixedproject.metadata.comicvine.actions.ComicVineGetIssueAction;
import org.comixedproject.metadata.comicvine.actions.ComicVineGetIssueDetailsAction;
import org.comixedproject.metadata.comicvine.actions.ComicVineGetVolumesAction;
import org.comixedproject.metadata.model.IssueDetailsMetadata;
import org.comixedproject.metadata.model.IssueMetadata;
import org.comixedproject.metadata.model.VolumeMetadata;
import org.comixedproject.model.metadata.MetadataSource;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ComicVineMetadataAdaptor</code> provides an implementation of {@link MetadataAdaptor} for
 * ComicVine.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicVineMetadataAdaptor extends AbstractMetadataAdaptor {
  public static final String BASE_URL = "https://comicvine.gamespot.com";
  static final String API_KEY = "api-key";

  @Autowired private ObjectFactory<ComicVineGetVolumesAction> getVolumesActionObjectFactory;
  @Autowired private ObjectFactory<ComicVineGetIssueAction> getIssueActionObjectFactory;

  @Autowired
  private ObjectFactory<ComicVineGetIssueDetailsAction> getIssueDetailsActionObjectFactory;

  public ComicVineMetadataAdaptor() {
    super("ComiXed ComicVine Scraper", "comicvine");
  }

  @Override
  public List<VolumeMetadata> getVolumes(
      final String seriesName, final Integer maxRecords, final MetadataSource metadataSource)
      throws MetadataException {
    log.debug("Fetching volumes from ComicVine: seriesName={}", seriesName);

    final ComicVineGetVolumesAction action = this.getVolumesActionObjectFactory.getObject();
    action.setBaseUrl(BASE_URL);
    action.setApiKey(this.getSourcePropertyByName(metadataSource.getProperties(), API_KEY, true));
    action.setSeries(seriesName);
    action.setMaxRecords(maxRecords);

    log.debug("Executing action");
    final List<VolumeMetadata> result = action.execute();

    log.debug("Returning {} volume{}", result.size(), result.size() == 1 ? "" : "s");
    return result;
  }

  @Override
  public IssueMetadata doGetIssue(
      final Integer volume, final String issueNumber, final MetadataSource metadataSource)
      throws MetadataException {
    log.debug("Fetching issue from ComicVine: volume={} issueNumber={}", volume, issueNumber);

    final ComicVineGetIssueAction getIssuesAction = this.getIssueActionObjectFactory.getObject();

    getIssuesAction.setBaseUrl(BASE_URL);
    getIssuesAction.setApiKey(
        this.getSourcePropertyByName(metadataSource.getProperties(), API_KEY, true));
    getIssuesAction.setVolumeId(volume);
    getIssuesAction.setIssueNumber(issueNumber);

    final List<IssueMetadata> result = getIssuesAction.execute();

    return result.isEmpty() ? null : result.get(0);
  }

  @Override
  public IssueDetailsMetadata getIssueDetails(
      final String issueId, final MetadataSource metadataSource) throws MetadataException {
    log.debug("Fetching issue details: issueId={}", issueId);

    final ComicVineGetIssueDetailsAction action =
        this.getIssueDetailsActionObjectFactory.getObject();

    action.setBaseUrl(BASE_URL);
    action.setApiKey(this.getSourcePropertyByName(metadataSource.getProperties(), API_KEY, true));
    action.setIssueId(issueId);

    return action.execute();
  }
}
