/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.service.app;

import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.FeedException;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import java.io.IOException;
import java.net.URL;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.net.app.LatestReleaseDetails;
import org.springframework.stereotype.Component;

/**
 * <code>GetLatestReleaseAction</code> fetches the release feed from the ComiXed Github feed and
 * returns details for the latest release.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class GetLatestReleaseAction {
  @Getter @Setter private String url = "https://github.com/comixed/comixed/releases.atom";

  /**
   * Executes the action.
   *
   * @return the latest release details
   */
  public LatestReleaseDetails execute() {
    try (XmlReader reader = new XmlReader(new URL(this.getUrl()))) {
      final SyndFeed feed = new SyndFeedInput().build(reader);
      log.debug("Loaded feed: {}", feed.getTitle());
      if (!feed.getEntries().isEmpty()) {
        log.debug("Processing latest entry");
        final SyndEntry entry = feed.getEntries().get(0);
        final String version = this.loadVersion(entry.getLink());
        return new LatestReleaseDetails(version, entry.getLink(), entry.getUpdatedDate());
      }
    } catch (FeedException | IOException error) {
      log.error("Failed to load ComiXed release feed", error);
    }
    log.debug("No release data found");
    return new LatestReleaseDetails();
  }

  private String loadVersion(final String link) {
    log.debug("Extracting version from link: {}", link);
    return link.substring(link.lastIndexOf("/") + 1);
  }
}
