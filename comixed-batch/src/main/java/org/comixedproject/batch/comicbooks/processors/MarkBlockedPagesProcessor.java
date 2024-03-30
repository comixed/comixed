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

import static org.comixedproject.batch.comicbooks.AddComicsConfiguration.PARAM_SKIP_BLOCKING_PAGES;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.PageState;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.service.comicpages.BlockedHashService;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>MarkBlockedPagesProcessor</code> processes comics, marking blocked pages for deletion.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class MarkBlockedPagesProcessor
    implements ItemProcessor<ComicBook, ComicBook>, StepExecutionListener {
  @Autowired private BlockedHashService blockedHashService;
  @Autowired private ConfigurationService configurationService;

  private JobParameters jobParameters;

  @Override
  public ComicBook process(final ComicBook comicBook) {
    final boolean skipBlockingPages =
        !this.configurationService.isFeatureEnabled(ConfigurationService.CFG_MANAGE_BLOCKED_PAGES)
            || (this.jobParameters.getParameters().containsKey(PARAM_SKIP_BLOCKING_PAGES)
                && Boolean.valueOf(this.jobParameters.getString(PARAM_SKIP_BLOCKING_PAGES)));
    if (skipBlockingPages) {
      log.trace("Skip blocking pages enabled");
      return comicBook;
    }
    log.debug("Marking blocked pages for comicBook: id={}", comicBook.getId());
    comicBook
        .getPages()
        .forEach(
            page -> {
              final String hash = page.getHash();
              log.trace("Checking if page has is blocked: {}", hash);
              final boolean deleted = this.blockedHashService.isHashBlocked(hash);
              log.trace("Setting deleted state: {}", deleted);
              page.setPageState(deleted ? PageState.DELETED : PageState.STABLE);
            });
    return comicBook;
  }

  @Override
  public void beforeStep(final StepExecution stepExecution) {
    this.jobParameters = stepExecution.getJobExecution().getJobParameters();
  }

  @Override
  public ExitStatus afterStep(final StepExecution stepExecution) {
    return null;
  }
}
