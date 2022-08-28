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

package org.comixedproject.batch.metadata.processors;

import static org.comixedproject.batch.metadata.MetadataProcessConfiguration.PARAM_SKIP_CACHE;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicMetadataSource;
import org.comixedproject.service.metadata.MetadataService;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ScrapeComicBookProcessor</code> performs the work of actually loading and applying metadata
 * to a comic.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ScrapeComicBookProcessor
    implements ItemProcessor<ComicBook, ComicBook>, StepExecutionListener {
  @Autowired private MetadataService metadataService;

  private JobParameters jobParameters;

  @Override
  public ComicBook process(final ComicBook comicBook) throws Exception {
    ComicBook result = comicBook;
    if (comicBook.getMetadata() == null || comicBook.getMetadata().getId() == null) {
      log.error("No metadata source associated with comic: {}", comicBook.getId());
    } else {
      final boolean skipCache =
          Boolean.parseBoolean(this.jobParameters.getString(PARAM_SKIP_CACHE));
      log.info("Scraping comic book: id={}", comicBook.getId());
      final ComicMetadataSource source = comicBook.getMetadata();
      result =
          this.metadataService.scrapeComic(
              source.getMetadataSource().getId(),
              comicBook.getId(),
              source.getReferenceId(),
              skipCache);
    }
    log.debug("Turning off batch metadata update flag");
    result.setBatchMetadataUpdate(false);
    return result;
  }

  @Override
  public void beforeStep(final StepExecution stepExecution) {
    log.trace("Storing step execution reference");
    this.jobParameters = stepExecution.getJobParameters();
  }

  @Override
  public ExitStatus afterStep(final StepExecution stepExecution) {
    return null;
  }
}
