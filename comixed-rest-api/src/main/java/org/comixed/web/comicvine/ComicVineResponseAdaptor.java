/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class ComicVineResponseAdaptor {
  @Autowired private ObjectMapper objectMapper;

  public void checkForErrors(final byte[] content) throws ComicVineAdaptorException {
    JsonNode root = null;

    this.log.debug("Verifying that the content is JSON");
    try {
      root = objectMapper.readTree(content);
    } catch (IOException error) {
      throw new ComicVineAdaptorException("content not JSON", error);
    }

    this.log.debug("Checking the response node count");
    if (root.size() == 0) {
      throw new ComicVineAdaptorException("content is empty JSON");
    }

    this.log.debug("Checking the error node value");
    String errorValue = "";

    try {
      errorValue = root.get("error").asText();
    } catch (NullPointerException error) {
      throw new ComicVineAdaptorException("missing error node");
    }

    this.log.debug("Node value={}", errorValue);

    if (!"OK".equals(errorValue)) {
      throw new ComicVineAdaptorException("error response received");
    }
  }
}
