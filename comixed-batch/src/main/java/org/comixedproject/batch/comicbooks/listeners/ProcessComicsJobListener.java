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

package org.comixedproject.batch.comicbooks.listeners;

import static org.comixedproject.model.messaging.batch.ProcessComicStatus.*;

import lombok.extern.log4j.Log4j2;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.stereotype.Component;

/**
 * <code>ProcessComicsJobListener</code> relays overall job state during the comic processing batch
 * process.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ProcessComicsJobListener extends AbstractComicProcessingListener
    implements JobExecutionListener {
  @Override
  public void beforeJob(final JobExecution jobExecution) {
    log.trace("Publishing job start");
    final ExecutionContext context = jobExecution.getExecutionContext();
    context.putLong(JOB_STARTED, System.currentTimeMillis());
    context.putString(STEP_NAME, "");
    context.putLong(TOTAL_COMICS, 0);
    context.putLong(PROCESSED_COMICS, 0);
    log.trace("Publishing job statistics");
    this.doPublishState(context);
  }

  @Override
  public void afterJob(final JobExecution jobExecution) {
    log.trace("Publishing job finish");
    final ExecutionContext context = jobExecution.getExecutionContext();
    context.putLong(JOB_FINISHED, System.currentTimeMillis());
    this.doPublishState(jobExecution.getExecutionContext());
  }
}
