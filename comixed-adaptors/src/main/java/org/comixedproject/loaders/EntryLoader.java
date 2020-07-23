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

package org.comixedproject.loaders;

import org.comixedproject.model.comic.Comic;

/**
 * <code>EntryLoader</code> defines a type that processes entry content and sets it on a given
 * {@link Comic}.
 *
 * @author Darryl L. Pierce
 */
public interface EntryLoader {
  /**
   * Loads content into the specified comic.
   *
   * @param comic the comic
   * @param filename the content's filename
   * @param content the content
   * @throws EntryLoaderException if an error occurs while loading the content
   */
  void loadContent(Comic comic, String filename, byte[] content) throws EntryLoaderException;
}
