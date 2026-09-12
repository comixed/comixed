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

package org.comixedproject.batch.library.processors;

import static org.comixedproject.batch.library.OrganizeLibraryConfiguration.ORGANIZE_LIBRARY_JOB_DELETE_REMOVED_COMIC_FILES;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.comicbooks.ComicAdaptor;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.service.comicbooks.ComicService;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.listener.StepExecutionListener;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.batch.infrastructure.item.ExecutionContext;
import org.springframework.batch.infrastructure.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>RemoveDeletedComicsProcessor</code> deletes comics, removing the file from the database as
 * well as from the physical file if requested.
 *
 * @author Darryl L. Pierce
 */
@Component
@StepScope
@Log4j2
public class RemoveDeletedComicsProcessor
    implements ItemProcessor<Comic, Comic>, StepExecutionListener {
  @Autowired private ComicService comicService;
  @Autowired private FileAdaptor fileAdaptor;
  @Autowired private ComicAdaptor comicAdaptor;

  private ExecutionContext executionContext;

  @Override
  public Comic process(final Comic comic) {
    if (comic.isLoadingFileContents()
        || comic.isPurging()
        || comic.isBatchUpdatingMetadata()
        || comic.isEditingMetadata()
        || comic.getTargetArchiveType() != null
        || comic.isUpdatingMetadata()) {
      log.debug("Comic not ready for removal, skipping: id={}", comic.getComicDetailId());
    }
    log.debug("Removing comicBook from database: id={}", comic.getComicDetailId());
    this.comicService.deleteComic(comic);
    if (Boolean.parseBoolean(
        this.executionContext.getString(
            ORGANIZE_LIBRARY_JOB_DELETE_REMOVED_COMIC_FILES, String.valueOf(false)))) {
      log.trace("Deleting physical file: {}", comic.getFilename());
      this.fileAdaptor.deleteFile(comic.getFile());
      this.comicAdaptor.deleteMetadataFile(comic);
    }
    return comic;
  }

  @Override
  public void beforeStep(final StepExecution stepExecution) {
    log.trace("Loading job context");
    this.executionContext = stepExecution.getJobExecution().getExecutionContext();
  }
}
