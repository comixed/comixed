/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.scrapers.actions;

import org.comixedproject.scrapers.ScrapingException;

/**
 * <code>ScrapingAction</code> defines a type that performs an action as part of the scraping
 * process.
 *
 * @param <T> the result for the action
 * @author Darryl L. Pierce
 */
public interface ScrapingAction<T> {
  /**
   * Performs the scraping action.
   *
   * @return the return value
   * @throws ScrapingException if an error occurs
   */
  public T execute() throws ScrapingException;
}
