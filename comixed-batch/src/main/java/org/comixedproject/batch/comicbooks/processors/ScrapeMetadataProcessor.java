/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

import static org.comixedproject.batch.comicbooks.ScrapeMetadataConfiguration.SCRAPE_METADATA_JOB_ERROR_THRESHOLD;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.ComicCheckOutManager;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.metadata.MetadataService;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ScrapeMetadataProcessor</code> performs the scraping of comic books.
 *
 * <p>It tracks the number of errors that have occurred while scraping comics and, after a threshold
 * has been met, will abort the process.
 *
 * @author Darryl L. Pierce
 */
@Component
@StepScope
@Log4j2
public class ScrapeMetadataProcessor
    implements ItemProcessor<ComicBook, ComicBook>, StepExecutionListener {
  @Autowired private MetadataService metadataService;
  @Autowired private ComicBookService comicBookService;
  @Autowired private ComicCheckOutManager comicCheckOutManager;

  StepExecution stepExecution = null;
  long errorThreshold = 0L;

  @Override
  public void beforeStep(final StepExecution stepExecution) {
    this.errorThreshold =
        stepExecution
            .getJobExecution()
            .getJobParameters()
            .getLong(SCRAPE_METADATA_JOB_ERROR_THRESHOLD);
    this.stepExecution = stepExecution;
  }

  @Override
  public ExitStatus afterStep(final StepExecution stepExecution) {
    if (isInFailedState()) {
      return ExitStatus.FAILED;
    }
    return null;
  }

  private boolean isInFailedState() {
    return this.stepExecution.getSkipCount() >= this.errorThreshold;
  }

  @Override
  public ComicBook process(final ComicBook comicBook) {
    if (comicBook.isFileContentsLoaded() == false || comicBook.isPurging()) {
      log.debug("Comic not ready for batch scraping: id={}", comicBook.getComicBookId());
      return null;
    }

    if (this.isInFailedState()) {
      log.debug(
          "Abort scraping: error threshold exceeded ({} > {})",
          stepExecution.getSkipCount(),
          this.errorThreshold);
      return comicBook;
    }

    log.debug("Batch scraping comic book: id={}", comicBook.getComicBookId());
    try {
      this.comicCheckOutManager.checkOut(comicBook.getComicBookId());
      final ComicMetadataSource metadata = comicBook.getMetadata();
      log.debug("Turning off batch scraping flag: id={}", comicBook.getComicBookId());
      comicBook.setBatchScraping(false);
      this.comicBookService.save(comicBook);
      log.debug("Scraping comic");
      this.metadataService.scrapeComic(
          metadata.getMetadataSource().getMetadataSourceId(),
          comicBook.getComicBookId(),
          metadata.getReferenceId(),
          false);
    } catch (Exception error) {
      log.error("Failed to batch scrape comic book", error);
      this.stepExecution.setProcessSkipCount(this.stepExecution.getProcessSkipCount() + 1);
    } finally {
      this.comicCheckOutManager.checkIn(comicBook.getComicBookId());
    }
    return comicBook;
  }
}
