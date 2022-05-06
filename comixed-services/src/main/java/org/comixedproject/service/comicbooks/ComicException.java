/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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

package org.comixedproject.service.comicbooks;

import org.comixedproject.model.comicbooks.ComicBook;

/**
 * <code>ComicException</code> is raised if an error occurs while working with instances of {@link
 * ComicBook}.
 *
 * @author Darryl L. Pierce
 */
public class ComicException extends Exception {
  public ComicException(final String message) {
    super(message);
  }

  public ComicException(final String message, final Exception error) {}
}
