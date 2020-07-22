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

package org.comixedproject.scrapers.adaptors;

import org.comixedproject.scrapers.ScrapingException;

/**
 * <code>ScrapingCacheValueProcessor</code> defines a lambda that processes a single record from the
 * cache.
 *
 * @author Darryl L. Pierce
 */
@FunctionalInterface
public interface ScrapingCacheValueProcessor {
  void processValue(final String value) throws ScrapingException;
}
