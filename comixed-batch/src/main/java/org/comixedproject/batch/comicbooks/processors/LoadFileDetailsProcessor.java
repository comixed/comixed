/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.batch.comicbooks.processors;

import java.io.FileInputStream;
import java.io.IOException;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.GenericUtilitiesAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicFileDetails;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>LoadFileDetailsProcessor</code> loads the file details for a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class LoadFileDetailsProcessor implements ItemProcessor<ComicBook, ComicBook> {
  @Autowired private GenericUtilitiesAdaptor genericUtilitiesAdaptor;

  @Override
  public ComicBook process(final ComicBook comicBook) {
    ComicFileDetails fileDetails = comicBook.getFileDetails();
    if (fileDetails == null) {
      log.debug("Creating file details container: id={}", comicBook.getId());
      fileDetails = new ComicFileDetails(comicBook);
      comicBook.setFileDetails(fileDetails);
    }
    log.trace("Getting comicBook file hash");
    try {
      fileDetails.setHash(
          this.genericUtilitiesAdaptor.createHash(new FileInputStream(comicBook.getFilename())));

      return comicBook;
    } catch (IOException error) {
      log.error("Error loading comic file details", error);
      return null;
    }
  }
}
