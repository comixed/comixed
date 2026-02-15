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

import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.batch.ComicCheckOutManager;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.admin.ConfigurationService;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.infrastructure.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>UpdateMetadataProcessor</code> updates the metadata in a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@StepScope
@Log4j2
public class UpdateMetadataProcessor implements ItemProcessor<ComicBook, ComicBook> {
  @Autowired private ComicBookAdaptor comicBookAdaptor;
  @Autowired private ConfigurationService configurationService;
  @Autowired private ComicCheckOutManager comicCheckOutManager;

  @Override
  public ComicBook process(final ComicBook comicBook) {
    if (comicBook.getComicDetail().isMissing()) {
      log.debug("Comic file is missing, skipping: id={}", comicBook.getComicBookId());
      return null;
    }
    if (comicBook.isFileContentsLoaded() == false
        || comicBook.isPurging()
        || comicBook.isBatchMetadataUpdate()
        || comicBook.isEditDetails()) {
      log.debug("Comic not ready for metadata update, skipping: id={}", comicBook.getComicBookId());
      return null;
    }

    if (this.configurationService.isFeatureEnabled(
        ConfigurationService.CREATE_EXTERNAL_METADATA_FILE)) {
      log.debug("Creating external metadata file for comic: id={}", comicBook.getComicBookId());
      try {
        this.comicCheckOutManager.checkOut(comicBook.getComicBookId());
        this.comicBookAdaptor.saveMetadataFile(comicBook);
      } catch (AdaptorException error) {
        log.error("Failed to create external metadata file file comic", error);
      } finally {
        this.comicCheckOutManager.checkIn(comicBook.getComicBookId());
      }
    }

    if (this.configurationService.isFeatureEnabled(
            ConfigurationService.CFG_LIBRARY_NO_COMICINFO_ENTRY)
        || this.configurationService.isFeatureEnabled(
            ConfigurationService.CFG_LIBRARY_NO_RECREATE_COMICS)) {
      log.debug("Writing ComicInfo.xml entries disabled: skipping");
      return comicBook;
    }

    if (comicBook.getComicDetail().getArchiveType() == ArchiveType.CBR) {
      log.warn("Cannot write comic metadata entry for CBR files: skipping");
      return comicBook;
    }

    try {
      this.comicCheckOutManager.checkOut(comicBook.getComicBookId());
      log.debug("Updating comic book metadata: id={}", comicBook.getComicBookId());
      this.comicBookAdaptor.save(comicBook, comicBook.getComicDetail().getArchiveType(), false, "");
    } catch (AdaptorException error) {
      log.error("Failed to update metadata for comic book", error);
    } finally {
      this.comicCheckOutManager.checkIn(comicBook.getComicBookId());
    }
    return comicBook;
  }
}
