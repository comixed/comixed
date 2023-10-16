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

package org.comixedproject.messaging.comicpages;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.AbstractPublishAction;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.comicpages.BlockedHash;
import org.comixedproject.views.View;
import org.springframework.stereotype.Component;

/**
 * <code>PublishBlockedPageRemovalAction</code> publishes messages when a {@link BlockedHash} is
 * removed.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class PublishBlockedPageRemovalAction extends AbstractPublishAction<BlockedHash> {
  /** Topic which receives blocked page removals in real time. */
  public static final String BLOCKED_HASH_LIST_REMOVAL_TOPIC = "/topic/blocked-hash-list.removal";

  @Override
  public void publish(final BlockedHash blockedHash) throws PublishingException {
    this.doPublish(BLOCKED_HASH_LIST_REMOVAL_TOPIC, blockedHash, View.BlockedHashList.class);
  }
}
