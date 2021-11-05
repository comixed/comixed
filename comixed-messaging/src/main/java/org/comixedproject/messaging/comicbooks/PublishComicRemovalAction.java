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

package org.comixedproject.messaging.comicbooks;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.AbstractPublishAction;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.messaging.Constants;
import org.comixedproject.views.View;
import org.springframework.stereotype.Component;

/**
 * <code>PublishComicRemovalAction</code> publishes a message when a comic is removed from the
 * library.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class PublishComicRemovalAction extends AbstractPublishAction<Comic> {
  @Override
  public void publish(final Comic comic) throws PublishingException {
    log.trace("Publishing comic list removal");
    this.doPublish(Constants.COMIC_LIST_REMOVAL_TOPIC, comic, View.ComicListView.class);
    log.trace("Publishing comic book removal");
    this.doPublish(
        String.format(Constants.COMIC_BOOK_REMOVAL_TOPIC, comic.getId()),
        comic,
        View.ComicDetailsView.class);
  }
}
