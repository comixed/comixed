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

import lombok.extern.log4j.Log4j2;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * <code>ComiXedWebSocketSecurityConfiguration</code> provides the configuration for using
 * websockets.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@EnableWebSocketMessageBroker
@Log4j2
public class ComiXedWebSocketSecurityConfiguration implements WebSocketMessageBrokerConfigurer {

  @Bean
  public AuthorizationManager<Message<?>> messageAuthorizationManager() {
    var messages = MessageMatcherDelegatingAuthorizationManager.builder();

    messages
        .nullDestMatcher()
        .permitAll()
        .simpTypeMatchers(
            SimpMessageType.CONNECT, SimpMessageType.DISCONNECT, SimpMessageType.UNSUBSCRIBE)
        .permitAll();

    return messages.build();
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.ignoringRequestMatchers("/ws/**"))
        .authorizeHttpRequests(
            auth -> auth.requestMatchers("/ws/**").permitAll().anyRequest().authenticated())
        .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin));

    return http.build();
  }

  @Override
  public void configureMessageBroker(MessageBrokerRegistry registry) {
    log.trace("Configuring websocket message broker");
    registry.enableSimpleBroker("/topic", "/queue", "/secured/user");
    registry.setApplicationDestinationPrefixes("/comixed");
    registry.setUserDestinationPrefix("/secured/user");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    log.trace("Configuration STOMP endpoints");
    registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
  }
}
