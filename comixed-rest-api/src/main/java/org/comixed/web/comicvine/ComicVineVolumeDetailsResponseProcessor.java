/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

package org.comixed.web.comicvine;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import lombok.extern.log4j.Log4j2;
import org.comixed.model.library.Comic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class ComicVineVolumeDetailsResponseProcessor {
  @Autowired private ObjectMapper objectMapper;
  @Autowired private ComicVineResponseAdaptor responseAdaptor;

  public String process(byte[] content, Comic comic) throws ComicVineAdaptorException {
    this.log.debug("Verifying ComicVine response content");
    this.responseAdaptor.checkForErrors(content);

    String result = null;
    try {
      JsonNode jsonNode = objectMapper.readTree(content);

      comic.setVolume(jsonNode.get("results").get("start_year").asText());
      comic.setSeries(jsonNode.get("results").get("name").asText());
      result = jsonNode.get("results").get("publisher").get("id").asText();
    } catch (IOException error) {
      throw new ComicVineAdaptorException("Invalid response content", error);
    }

    return result;
  }
}
