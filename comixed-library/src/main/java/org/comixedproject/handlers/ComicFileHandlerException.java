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

package org.comixedproject.handlers;

/**
 * <code>ComicFileHandlerException</code> is raised when an error occurs while working with an
 * underlying digital comic file.
 *
 * @author Darryl L. Pierce
 */
public class ComicFileHandlerException extends Exception {
  private static final long serialVersionUID = -7821301633974242512L;

  public ComicFileHandlerException(String message) {
    super(message);
  }

  public ComicFileHandlerException(String message, Exception cause) {
    super(message, cause);
  }
}
