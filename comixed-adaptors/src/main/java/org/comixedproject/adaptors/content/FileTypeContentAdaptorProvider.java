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
 * <code>FileTypeContentAdaptorProvider</code> defines a provider for registering instances of
 * {@link FileTypeContentAdaptor}.
 *
 * @author Darryl L. Pierce
 */
public interface FileTypeContentAdaptorProvider {
  /**
   * Creates a new instance of the adaptor.
   *
   * @return the adaptor
   */
  FileTypeContentAdaptor create();

  /**
   * Returns if the adaptor supports the provided content type.
   *
   * @param contentType the content type
   * @return true if the adaptor can process it
   */
  boolean supports(String contentType);
}
