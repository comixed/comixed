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

package org.comixedproject.messaging.lists;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.AbstractPublishAction;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.views.View;
import org.springframework.stereotype.Component;

/**
 * <code>PublishReadingListUpdateAction</code> publishes updates to a reading list.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class PublishReadingListUpdateAction extends AbstractPublishAction<ReadingList> {
  /** Topic which receives reading list updates. */
  public static final String READING_LIST_UPDATE_TOPIC = "/topic/reading-list.%d.update";
  /** Topic which receives reading list updates. */
  public static final String READING_LISTS_UPDATE_TOPIC = "/topic/reading-lists.update";

  @Override
  public void publish(final ReadingList readingList) throws PublishingException {
    log.trace("Publishing reading lists update");
    this.doPublish(
        readingList.getOwner(), READING_LISTS_UPDATE_TOPIC, readingList, View.ReadingLists.class);
    log.trace("Publishing reading list detail update");
    this.doPublish(
        readingList.getOwner(),
        String.format(READING_LIST_UPDATE_TOPIC, readingList.getId()),
        readingList,
        View.ReadingListDetail.class);
  }
}
