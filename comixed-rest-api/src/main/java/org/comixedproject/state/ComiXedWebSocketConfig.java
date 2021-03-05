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

package org.comixedproject.state;

import lombok.extern.log4j.Log4j2;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * <code>ComiXedWebSocketConfig</code> provides the configuration for using websockets.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@EnableWebSocketMessageBroker
@Log4j2
public class ComiXedWebSocketConfig implements WebSocketMessageBrokerConfigurer {
  @Override
  public void configureMessageBroker(final MessageBrokerRegistry registry) {
    log.trace("Configuring websocket message broker");
    registry.enableSimpleBroker("/topic");
    registry.setApplicationDestinationPrefixes("/comixed");
    registry.setUserDestinationPrefix("/secured/user");
  }

  @Override
  public void registerStompEndpoints(final StompEndpointRegistry registry) {
    log.trace("Configuration STOMP endpoints");
    registry.addEndpoint("/ws").setAllowedOrigins("*").withSockJS();
  }
}
