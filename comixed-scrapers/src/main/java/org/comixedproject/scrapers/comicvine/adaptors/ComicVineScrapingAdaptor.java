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

package org.comixedproject.scrapers.comicvine.adaptors;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.adaptors.AbstractScrapingAdaptor;
import org.comixedproject.scrapers.comicvine.actions.ComicVineGetIssueAction;
import org.comixedproject.scrapers.comicvine.actions.ComicVineGetIssueDetailsAction;
import org.comixedproject.scrapers.comicvine.actions.ComicVineGetVolumesAction;
import org.comixedproject.scrapers.model.ScrapingIssue;
import org.comixedproject.scrapers.model.ScrapingIssueDetails;
import org.comixedproject.scrapers.model.ScrapingVolume;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ComicVineScrapingAdaptor</code> provides an implementation of {@link ScrapingAdaptor} for
 * ComicVine.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicVineScrapingAdaptor extends AbstractScrapingAdaptor {
  public static final String BASE_URL = "https://comicvine.gamespot.com";

  @Autowired private ObjectFactory<ComicVineGetVolumesAction> getVolumesActionObjectFactory;
  @Autowired private ObjectFactory<ComicVineGetIssueAction> getIssueActionObjectFactory;

  @Autowired
  private ObjectFactory<ComicVineGetIssueDetailsAction> getIssueDetailsActionObjectFactory;

  public ComicVineScrapingAdaptor() {
    super("comicvine");
  }

  @Override
  public List<ScrapingVolume> getVolumes(
      final String apiKey, final String seriesName, final Integer maxRecords)
      throws ScrapingException {
    log.debug("Fetching volumes from ComicVine: seriesName={}", seriesName);

    final ComicVineGetVolumesAction action = this.getVolumesActionObjectFactory.getObject();
    action.setBaseUrl(BASE_URL);
    action.setApiKey(apiKey);
    action.setSeries(seriesName);
    action.setMaxRecords(maxRecords);

    log.debug("Executing action");
    final List<ScrapingVolume> result = action.execute();

    log.debug("Returning {} volume{}", result.size(), result.size() == 1 ? "" : "s");
    return result;
  }

  @Override
  public ScrapingIssue doGetIssue(
      final String apiKey, final Integer volume, final String issueNumber)
      throws ScrapingException {
    log.debug("Fetching issue from ComicVine: volume={} issueNumber={}", volume, issueNumber);

    final ComicVineGetIssueAction getIssuesAction = this.getIssueActionObjectFactory.getObject();

    getIssuesAction.setBaseUrl(BASE_URL);
    getIssuesAction.setApiKey(apiKey);
    getIssuesAction.setVolumeId(volume);
    getIssuesAction.setIssueNumber(issueNumber);

    final List<ScrapingIssue> result = getIssuesAction.execute();

    return result.isEmpty() ? null : result.get(0);
  }

  @Override
  public ScrapingIssueDetails getIssueDetails(final String apiKey, final Integer issueId)
      throws ScrapingException {
    log.debug("Fetching issue details: issueId={}", issueId);

    final ComicVineGetIssueDetailsAction action =
        this.getIssueDetailsActionObjectFactory.getObject();

    action.setBaseUrl(BASE_URL);
    action.setApiKey(apiKey);
    action.setIssueId(issueId);

    return action.execute();
  }
}
