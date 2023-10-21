/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project.
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

package org.comixedproject.messaging.comicbooks;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.AbstractPublishAction;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.views.View;
import org.springframework.stereotype.Component;

/**
 * <code>PublishComicBookSelectionStateAction</code> publishes the current set of selected ids for a
 * user.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class PublishComicBookSelectionStateAction extends AbstractPublishAction<List> {
  static final String COMIC_BOOK_SELECTION_UPDATE_TOPIC = "/topic/user/comic-book-selection.update";

  @Override
  public void publish(final List ids) throws PublishingException {
    log.debug(
        "Publishing update of {} selected comic book id{}", ids.size(), ids.size() == 1 ? "" : "s");
    this.doPublish(COMIC_BOOK_SELECTION_UPDATE_TOPIC, ids, View.GenericObjectView.class);
  }
}
