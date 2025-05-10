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

package org.comixedproject.messaging.lists;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.AbstractPublishAction;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.lists.ScrapedStory;
import org.comixedproject.views.View;
import org.springframework.stereotype.Component;

/**
 * <code>PublishStoryListUpdateAction</code> publishes the update to a {@link ScrapedStory}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class PublishStoryListUpdateAction extends AbstractPublishAction<ScrapedStory> {
  /** Topic which receives story list updates. */
  public static final String STORY_LIST_UPDATE_TOPIC = "/topic/story-list.update";

  /** Topic which receives story updates. */
  public static final String STORY_UPDATE_TOPIC = "/topic/story-list.%d.update";

  @Override
  public void publish(final ScrapedStory story) throws PublishingException {
    log.trace("Publishing story list update");
    this.doPublish(STORY_LIST_UPDATE_TOPIC, story, View.StoryList.class);
    log.trace("Publishing story update");
    this.doPublish(String.format(STORY_UPDATE_TOPIC, story.getId()), story, View.StoryDetail.class);
  }
}
