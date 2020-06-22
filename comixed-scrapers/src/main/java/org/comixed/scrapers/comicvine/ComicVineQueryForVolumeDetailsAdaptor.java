/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixed.scrapers.comicvine;

import lombok.extern.log4j.Log4j2;
import org.comixed.model.comic.Comic;
import org.comixed.model.scraping.ComicVineVolume;
import org.comixed.repositories.ComicVineVolumeRepository;
import org.comixed.scrapers.ComicVineVolumeDetailsWebRequest;
import org.comixed.scrapers.WebRequestException;
import org.comixed.scrapers.WebRequestProcessor;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class ComicVineQueryForVolumeDetailsAdaptor {
  @Autowired private ObjectFactory<ComicVineVolumeDetailsWebRequest> requestFactory;
  @Autowired private WebRequestProcessor webRequestProcessor;
  @Autowired private ComicVineVolumeDetailsResponseProcessor responseProcessor;
  @Autowired private ComicVineVolumeRepository comicVineVolumeRepository;

  public String execute(String apiKey, String volumeId, Comic comic, boolean skipCache)
      throws ComicVineAdaptorException {
    String result = null;
    String content = null;
    ComicVineVolume volume = null;

    this.log.debug("Fetching volume details: volumeId={}", volumeId);

    volume = this.comicVineVolumeRepository.findByVolumeId(volumeId);

    if (skipCache || (volume == null)) {
      this.log.debug("Fetching volume details from ComicVine...");

      ComicVineVolumeDetailsWebRequest request = this.requestFactory.getObject();
      request.setApiKey(apiKey);
      request.setVolumeId(volumeId);
      try {
        content = this.webRequestProcessor.execute(request);

        if (volume != null) {
          this.comicVineVolumeRepository.delete(volume);
        }

        this.log.debug("Saving retrieved volume data...");
        volume = new ComicVineVolume();
        volume.setVolumeId(volumeId);
        volume.setContent(content.toString());

        this.comicVineVolumeRepository.save(volume);
      } catch (WebRequestException error) {
        throw new ComicVineAdaptorException("Failed to get volume details", error);
      }
    } else {
      this.log.debug("Volume found in database.");
      content = volume.getContent();
    }

    result = this.responseProcessor.process(content.getBytes(), comic);

    return result;
  }
}
