/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project.
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
import org.comixedproject.model.net.library.DuplicatePageUpdate;
import org.comixedproject.views.View;
import org.springframework.stereotype.Component;

/**
 * <code>PublishDuplicatePageListUpdateAction</code> publishes updates to the list of duplicate
 * pages.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class PublishDuplicatePageListUpdateAction
    extends AbstractPublishAction<DuplicatePageUpdate> {
  /** Topic which receives notices when the duplicate page list is updated. */
  public static final String DUPLICATE_PAGE_LIST_UPDATE_TOPIC = "/topic/duplicate-page-list.update";

  @Override
  public void publish(final DuplicatePageUpdate update) throws PublishingException {
    log.trace("Publishing duplicate page list");
    this.doPublish(DUPLICATE_PAGE_LIST_UPDATE_TOPIC, update, View.DuplicatePageList.class);
  }
}
