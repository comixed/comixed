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

package org.comixedproject.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.user.ComiXedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * <code>AbstactPublishAction</code> provides a foundation for building new {@link PublishAction}
 * types.
 *
 * @param <T> the event type
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public abstract class AbstractPublishAction<T> implements PublishAction<T> {
  @Autowired private SimpMessagingTemplate messagingTemplate;
  @Autowired private ObjectMapper objectMapper;

  /**
   * Publishes a message to the given destination.
   *
   * @param destination the destination
   * @param subject the message subject
   * @param viewClass the view class
   * @throws PublishingException if an error occurs
   */
  protected void doPublish(final String destination, final Object subject, final Class<?> viewClass)
      throws PublishingException {
    log.trace("Publishing object to {}", destination);
    try {
      final String payload =
          this.objectMapper.writerWithView(viewClass).writeValueAsString(subject);
      log.debug("Payload: {}", payload);
      this.messagingTemplate.convertAndSend(destination, payload);
    } catch (JsonProcessingException error) {
      throw new PublishingException(error);
    }
  }

  /**
   * Publishes a message to the given destination for the current user.
   *
   * @param user the user
   * @param destination the destination
   * @param subject the message subject
   * @param viewClass the view class
   * @throws PublishingException if an error occurs
   */
  protected void doPublishToUser(
      final ComiXedUser user,
      final String destination,
      final Object subject,
      final Class<?> viewClass)
      throws PublishingException {
    log.trace("Publishing object to {}", destination);
    try {
      final String payload =
          this.objectMapper.writerWithView(viewClass).writeValueAsString(subject);
      log.debug("Payload: {}", payload);
      this.messagingTemplate.convertAndSendToUser(user.getEmail(), destination, payload);
    } catch (JsonProcessingException error) {
      throw new PublishingException(error);
    }
  }

  /**
   * Publishes a message to a specific user.
   *
   * @param owner the user
   * @param destination the destination
   * @param subject the message subject
   * @param viewClass the view class
   * @throws PublishingException if an error occurs
   */
  protected void doPublish(
      final ComiXedUser owner,
      final String destination,
      final Object subject,
      final Class<?> viewClass)
      throws PublishingException {
    final String email = owner.getEmail();
    log.trace("Publishing object to {} for {}", destination, email);
    try {
      this.messagingTemplate.convertAndSendToUser(
          email,
          destination,
          this.objectMapper.writerWithView(viewClass).writeValueAsString(subject));
    } catch (JsonProcessingException error) {
      throw new PublishingException(error);
    }
  }
}
