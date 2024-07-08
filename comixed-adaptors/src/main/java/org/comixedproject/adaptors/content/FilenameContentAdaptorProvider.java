/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

/**
 * <code>FilenameContentAdaptorProvider</code> defines a provider for registering instances of *
 * {@link FilenameContentAdaptor}.
 */
public interface FilenameContentAdaptorProvider {
  /**
   * Creates a new instance of the adaptor.
   *
   * @return the adaptor
   */
  FilenameContentAdaptor create();

  /**
   * Returns if the filename is supported.
   *
   * @param filename the filename
   * @return true if the filename is supported
   */
  boolean supports(String filename);
}
