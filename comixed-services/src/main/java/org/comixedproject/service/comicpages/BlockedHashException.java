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

package org.comixedproject.service.comicpages;

import org.comixedproject.model.comicpages.BlockedHash;

/**
 * <code>BlockedHashException</code> is thrown when an error occurs while working with instances of
 * {@link BlockedHash}.
 *
 * @author Darryl L. Pierce
 */
public class BlockedHashException extends Exception {
  /**
   * Creates an instance with the given message.
   *
   * @param message the message
   */
  public BlockedHashException(final String message) {
    super(message);
  }
}
