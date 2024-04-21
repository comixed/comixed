/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project.
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

package org.comixedproject.messaging.batch;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.AbstractPublishAction;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.batch.BatchProcessDetail;
import org.comixedproject.views.View;
import org.springframework.stereotype.Component;

/**
 * <code>PublishBatchProcessDetailUpdateAction</code> publishes status for a single batch job.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class PublishBatchProcessDetailUpdateAction
    extends AbstractPublishAction<BatchProcessDetail> {
  private static final String BATCH_PROCESS_LIST_UPDATE_TOPIC_NAME =
      "/topic/batch-process-list.update";
  private static final String BATCH_PROCESS_DETAIL_UPDATE_TOPIC_NAME =
      "/topic/batch-process-detail.update.%d";

  @Override
  public void publish(final BatchProcessDetail detail) throws PublishingException {
    log.debug("Publishing batch process list status: job_id={}", detail.getJobId());
    this.doPublish(BATCH_PROCESS_LIST_UPDATE_TOPIC_NAME, detail, View.GenericObjectView.class);
    log.debug("Publishing batch process detail status: job_id={}", detail.getJobId());
    this.doPublish(
        String.format(BATCH_PROCESS_DETAIL_UPDATE_TOPIC_NAME, detail.getJobId()),
        detail,
        View.GenericObjectView.class);
  }
}
