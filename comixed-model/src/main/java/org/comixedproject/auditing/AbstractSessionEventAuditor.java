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

package org.comixedproject.auditing;

import java.util.ArrayList;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.auditlog.SessionUpdateEventHandler;
import org.comixedproject.model.session.SessionUpdateEventType;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

/**
 * <code>AbstractSessionEventAuditor</code> provides an implementation of {@link
 * SessionEventAuditor}.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public class AbstractSessionEventAuditor implements SessionEventAuditor, ApplicationContextAware {
  private static ApplicationContext applicationContext;

  private List<SessionUpdateEventHandler> handlers = new ArrayList<>();

  /**
   * Adds an event handler.
   *
   * @param handler the handler
   */
  @Override
  public void addHandler(final SessionUpdateEventHandler handler) {
    this.handlers.add(handler);
  }

  /**
   * Fires off notifications to all handlers when an event occurs.
   *
   * @param eventType the event type
   * @param value the event value
   */
  public void fireNotifications(final SessionUpdateEventType eventType, final Object value) {
    final AbstractSessionEventAuditor bean = this.getBean();
    bean.handlers.forEach(handler -> handler.processEvent(eventType, value));
  }

  /**
   * To be totally honest, this is a HACK to get around the limitation of not being able to use
   * spring beans as entity listeners.
   *
   * @return the actual bean to use
   */
  protected AbstractSessionEventAuditor getBean() {
    final String name =
        this.getClass().getSimpleName().toLowerCase().substring(0, 1)
            + this.getClass().getSimpleName().substring(1);
    return (AbstractSessionEventAuditor)
        AbstractSessionEventAuditor.applicationContext.getBean(name);
  }

  @Override
  public void setApplicationContext(final ApplicationContext applicationContext)
      throws BeansException {
    AbstractSessionEventAuditor.applicationContext = applicationContext;
  }
}
