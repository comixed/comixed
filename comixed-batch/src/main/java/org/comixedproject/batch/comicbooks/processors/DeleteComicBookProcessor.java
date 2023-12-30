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

import static org.comixedproject.batch.comicbooks.ConsolidationConfiguration.PARAM_DELETE_REMOVED_COMIC_FILES;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>DeleteComicBookProcessor</code> deletes comics, removing the file from the database as well
 * as from the physical file if requested.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class DeleteComicBookProcessor
    implements ItemProcessor<ComicBook, ComicBook>, StepExecutionListener {
  @Autowired private ComicBookService comicBookService;
  @Autowired private FileAdaptor fileAdaptor;
  @Autowired private ComicBookAdaptor comicBookAdaptor;

  private ExecutionContext executionContext;

  @Override
  public ComicBook process(final ComicBook comicBook) {
    log.debug("Removing comicBook from database: id={}", comicBook.getId());
    this.comicBookService.deleteComicBook(comicBook);
    if (Boolean.parseBoolean(
        this.executionContext.getString(PARAM_DELETE_REMOVED_COMIC_FILES, String.valueOf(false)))) {
      log.trace("Deleting physical file: {}", comicBook.getComicDetail().getFilename());
      this.fileAdaptor.deleteFile(comicBook.getComicDetail().getFile());
      this.comicBookAdaptor.deleteMetadataFile(comicBook);
    }
    return comicBook;
  }

  @Override
  public void beforeStep(final StepExecution stepExecution) {
    log.trace("Loading job context");
    this.executionContext = stepExecution.getJobExecution().getExecutionContext();
  }

  @Override
  public ExitStatus afterStep(final StepExecution stepExecution) {
    return null;
  }
}
