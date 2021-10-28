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

package org.comixedproject.dbtool.commands;

/**
 * <code>DatabaseCommandException</code> is thrown when an error occurs while working with the
 * database.
 */
public class DatabaseCommandException extends Exception {
  public DatabaseCommandException(final String message) {
    super(message);
  }

  public DatabaseCommandException(final String message, final Exception cause) {
    super(message, cause);
  }
}
