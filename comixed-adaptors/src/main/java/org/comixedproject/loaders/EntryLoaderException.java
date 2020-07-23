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

import javax.xml.stream.XMLStreamException;

/**
 * <code>EntryLoaderException</code> is thrown when an error occurs while processing a comic entry.
 *
 * @author Darryl L. Pierce
 */
public class EntryLoaderException extends Exception {
  private static final long serialVersionUID = -5175358262813656987L;

  public EntryLoaderException(XMLStreamException cause) {
    super(cause);
  }
}
