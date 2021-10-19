/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixedproject.adaptors.content;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

/**
 * <code>AbstractContentAdaptor</code> provides a base class for creating new implementations of
 * {@link ContentAdaptor}.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public abstract class AbstractContentAdaptor implements ContentAdaptor {
  @Autowired private ApplicationContext applicationContext;

  protected ContentAdaptor getBean(final String name) throws ContentAdaptorException {
    try {
      return this.applicationContext.getBean(name, ContentAdaptor.class);
    } catch (BeansException error) {
      throw new ContentAdaptorException("Failed to load bean: " + name, error);
    }
  }
}
