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

package org.comixedproject.controller.comic;

import java.io.IOException;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.IOUtils;
import org.comixedproject.model.comic.Publisher;
import org.comixedproject.service.comic.PublisherException;
import org.comixedproject.service.comic.PublisherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Log4j2
public class PublisherController {
  @Autowired private PublisherService publisherService;

  @GetMapping(value = "/api/publishers/{name}", produces = MediaType.APPLICATION_JSON_VALUE)
  public Publisher getByName(@PathVariable("name") String name) {
    log.info("Getting publisher: name={}", name);
    return this.publisherService.getByName(name);
  }

  @GetMapping(
      value = "/api/publishers/{name}/thumbnail",
      produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<byte[]> getThumbnail(@PathVariable("name") String name) throws IOException {
    log.debug("Getting thumbnail image for publisher: {}", name);
    Publisher publisher = this.publisherService.getByName(name);
    byte[] content = null;
    if (publisher != null) {
      content = publisher.getThumbnail();
    } else {
      content =
          IOUtils.toByteArray(this.getClass().getResourceAsStream("/images/missing-publisher.png"));
    }

    return new ResponseEntity<>(content, HttpStatus.OK);
  }

  @GetMapping(value = "/api/publishers/{name}/logo", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<byte[]> getLogo(@PathVariable("name") String name)
      throws PublisherException, IOException {
    log.debug("Getting logo image for publisher: {}", name);
    Publisher publisher = this.publisherService.getByName(name);
    byte[] content = null;
    if (publisher != null) {
      content = publisher.getLogo();
    } else {
      content = IOUtils.toByteArray(this.getClass().getResourceAsStream("/images/missing.png"));
    }

    return new ResponseEntity<>(content, HttpStatus.OK);
  }
}
