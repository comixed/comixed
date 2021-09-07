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

package org.comixedproject.messaging.library;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.AbstractPublishAction;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.state.messaging.ImportCountMessage;
import org.comixedproject.views.View;
import org.springframework.stereotype.Component;

/**
 * <code>PublishImportCountAction</code> publishes updates to the current import count.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class PublishImportCountAction extends AbstractPublishAction<ImportCountMessage> {
  static final String IMPORT_COUNT_TOPIC = "/topic/import.count";

  @Override
  public void publish(final ImportCountMessage subject) throws PublishingException {
    log.trace(
        "Publishing import count update: add={} processing={}",
        subject.getAddCount(),
        subject.getProcessingCount());
    this.doPublish(IMPORT_COUNT_TOPIC, subject, View.GenericResponseView.class);
  }
}
