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

package org.comixedproject.batch.comicpages.readers;

import static org.comixedproject.batch.comicpages.UnmarkPagesWithHashConfiguration.PARAM_UNMARK_PAGES_TARGET_HASH;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.service.comicpages.PageService;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.StepExecutionListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

/**
 * <code>UnmarkPageWithHashReader</code> defines a reader that loads pages based on their hash and
 * deletion state.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class UnmarkPageWithHashReader extends AbstractPageReader implements StepExecutionListener {
  @Autowired private PageService pageService;

  String targetHash;

  @Override
  protected List<Page> doLoadPages() {
    log.trace("Loading pages with hash: {}", this.targetHash);
    return this.pageService.getMarkedWithHash(this.targetHash);
  }

  @Override
  public void beforeStep(final StepExecution stepExecution) {
    this.targetHash = stepExecution.getJobParameters().getString(PARAM_UNMARK_PAGES_TARGET_HASH);
  }

  @Override
  public ExitStatus afterStep(final StepExecution stepExecution) {
    return null;
  }
}
