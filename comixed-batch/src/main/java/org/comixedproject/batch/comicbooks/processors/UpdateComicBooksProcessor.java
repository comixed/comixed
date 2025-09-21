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

import static org.comixedproject.batch.comicbooks.UpdateComicBooksConfiguration.*;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.batch.ComicCheckOutManager;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicType;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
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
public class UpdateComicBooksProcessor
    implements ItemProcessor<ComicBook, ComicBook>, StepExecutionListener {
  @Autowired private ComicCheckOutManager comicCheckOutManager;

  private JobParameters jobParameters;

  @Override
  public ComicBook process(final ComicBook comicBook) throws Exception {
    log.trace("Loading job parameters");
    final String publisher = this.jobParameters.getString(UPDATE_COMIC_BOOKS_JOB_PUBLISHER);
    final String series = this.jobParameters.getString(UPDATE_COMIC_BOOKS_JOB_SERIES);
    final String volume = this.jobParameters.getString(UPDATE_COMIC_BOOKS_JOB_VOLUME);
    final String issueNumber = this.jobParameters.getString(UPDATE_COMIC_BOOKS_JOB_ISSUE_NUMBER);
    final String imprint = this.jobParameters.getString(UPDATE_COMIC_BOOKS_JOB_IMPRINT);
    final String comicType = this.jobParameters.getString(UPDATE_COMIC_BOOKS_JOB_COMIC_TYPE);

    this.comicCheckOutManager.checkOut(comicBook.getComicBookId());

    if (StringUtils.hasLength(publisher)) {
      log.debug("Setting publisher to {}", publisher);
      comicBook.getComicDetail().setPublisher(publisher);
    }
    if (StringUtils.hasLength(series)) {
      log.debug("Setting series to {}", series);
      comicBook.getComicDetail().setSeries(series);
    }
    if (StringUtils.hasLength(volume)) {
      log.debug("Setting volume to {}", volume);
      comicBook.getComicDetail().setVolume(volume);
    }
    if (StringUtils.hasLength(issueNumber)) {
      log.debug("Setting issue number to {}", issueNumber);
      comicBook.getComicDetail().setIssueNumber(issueNumber);
    }
    if (StringUtils.hasLength(imprint)) {
      log.debug("Setting imprint to {}", imprint);
      comicBook.getComicDetail().setImprint(imprint);
    }
    if (StringUtils.hasLength(comicType)) {
      log.debug("Setting comic type: {}", comicType);
      comicBook.getComicDetail().setComicType(ComicType.valueOf(comicType));
    }

    this.comicCheckOutManager.checkIn(comicBook.getComicBookId());
    return comicBook;
  }

  @Override
  public void beforeStep(final StepExecution stepExecution) {
    log.trace("Loading execution context");
    this.jobParameters = stepExecution.getJobExecution().getJobParameters();
  }

  @Override
  public ExitStatus afterStep(final StepExecution stepExecution) {
    return null;
  }
}
