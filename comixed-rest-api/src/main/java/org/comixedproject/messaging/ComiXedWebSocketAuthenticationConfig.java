package org.comixedproject.messaging;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@Log4j2
public class ComiXedWebSocketAuthenticationConfig implements WebSocketMessageBrokerConfigurer {
  @Autowired private ComiXedWebSocketChannelInterceptor webSocketChannelTokenInterceptor;

  @Override
  public void configureClientInboundChannel(final ChannelRegistration registration) {
    log.trace("Configuring websocket inbound channel");
    registration.interceptors(webSocketChannelTokenInterceptor);
  }
}
