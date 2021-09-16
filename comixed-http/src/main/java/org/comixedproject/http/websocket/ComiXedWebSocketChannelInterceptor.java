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

package org.comixedproject.http.websocket;

import java.util.Collections;
import java.util.Optional;
import java.util.stream.Stream;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auth.ComiXedUserDetailsService;
import org.comixedproject.auth.JwtTokenUtil;
import org.comixedproject.model.websocket.StompPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>ComiXedWebSocketChannelInterceptor</code> provides a security interceptor to create the
 * principal for the messaging layer.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComiXedWebSocketChannelInterceptor implements ChannelInterceptor {
  private static final String HEADER_STRING = "Authorization";
  static final String TOKEN_PREFIX = "Bearer ";

  @Autowired private ComiXedUserDetailsService userDetailsService;
  @Autowired private JwtTokenUtil jwtTokenUtil;

  @Override
  public Message<?> preSend(final Message<?> message, final MessageChannel channel) {
    StompHeaderAccessor accessor =
        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
    if (accessor != null) {
      log.debug("Received STOMP command: {}", accessor.getCommand());
      if (StompCommand.CONNECT.equals(accessor.getCommand())) {
        final Optional<String> optionalToken =
            Optional.ofNullable(accessor.getNativeHeader(HEADER_STRING))
                .orElse(Collections.emptyList()).stream()
                .flatMap(Stream::ofNullable)
                .findFirst();
        optionalToken.ifPresent(
            token -> {
              log.trace("Auth token found");
              createPrincipal(accessor, token);
            });
      }
    }
    return message;
  }

  void createPrincipal(final StompHeaderAccessor accessor, final String token) {
    String username = null;
    if (!StringUtils.isEmpty(token)) {
      try {
        username = this.jwtTokenUtil.getEmailFromToken(token);
      } catch (Exception error) {
        log.error("Unable to extract username from auth token", error);
      }
    }
    if (!StringUtils.isEmpty(username)) {
      UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

      if (Boolean.TRUE.equals(this.jwtTokenUtil.validateToken(token, userDetails))) {
        log.debug("authenticated user " + username + ", setting security context");
        accessor.setUser(new StompPrincipal(username));
      }
    }
  }
}
