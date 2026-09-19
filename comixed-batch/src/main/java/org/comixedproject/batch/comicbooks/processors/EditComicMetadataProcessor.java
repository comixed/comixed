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

package org.comixedproject.batch.comicbooks.processors;

import static org.comixedproject.batch.comicbooks.EditComicMetadataConfiguration.*;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicType;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.listener.StepExecutionListener;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.batch.infrastructure.item.ItemProcessor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>UpdateComicBooksProcess</code> updates the details for comic books.
 *
 * @author Darryl L. Pierce
 */
@Component
@StepScope
@Log4j2
public class EditComicMetadataProcessor
    implements ItemProcessor<Comic, Comic>, StepExecutionListener {
  private JobParameters jobParameters;

  @Override
  public Comic process(final Comic comic) throws Exception {
    if (comic.isLoadingFileContents() || comic.isPurging() || comic.isBatchUpdatingMetadata()) {
      log.debug("Comic book not ready for metadata update, skipping: id={}", comic.getComicId());
      return null;
    }
    log.trace("Loading job parameters");
    final String publisher = this.jobParameters.getString(EDIT_COMIC_METADATA_JOB_PUBLISHER);
    final String series = this.jobParameters.getString(EDIT_COMIC_METADATA_JOB_SERIES);
    final String volume = this.jobParameters.getString(EDIT_COMIC_METADATA_JOB_VOLUME);
    final String issueNumber = this.jobParameters.getString(EDIT_COMIC_METADATA_JOB_ISSUE_NUMBER);
    final String imprint = this.jobParameters.getString(EDIT_COMIC_METADATA_JOB_IMPRINT);
    final String comicType = this.jobParameters.getString(EDIT_COMIC_METADATA_JOB_COMIC_TYPE);

    if (StringUtils.hasLength(publisher)) {
      log.debug("Setting publisher to {}", publisher);
      comic.setPublisher(publisher);
    }
    if (StringUtils.hasLength(series)) {
      log.debug("Setting series to {}", series);
      comic.setSeries(series);
    }
    if (StringUtils.hasLength(volume)) {
      log.debug("Setting volume to {}", volume);
      comic.setVolume(volume);
    }
    if (StringUtils.hasLength(issueNumber)) {
      log.debug("Setting issue number to {}", issueNumber);
      comic.setIssueNumber(issueNumber);
    }
    if (StringUtils.hasLength(imprint)) {
      log.debug("Setting imprint to {}", imprint);
      comic.setImprint(imprint);
    }
    if (StringUtils.hasLength(comicType)) {
      log.debug("Setting comic type: {}", comicType);
      comic.setComicType(ComicType.valueOf(comicType));
    }

    comic.setEditingMetadata(false);

    return comic;
  }

  @Override
  public void beforeStep(final StepExecution stepExecution) {
    log.trace("Loading execution context");
    this.jobParameters = stepExecution.getJobExecution().getJobParameters();
  }
}
