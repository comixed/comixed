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

package org.comixedproject.batch.comicbooks.writers;

import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

/**
 * <code>LoadFileContentsWriter</code> provides an {@link ItemWriter} for instances of {@link
 * ComicBook} that have had their contents loaded.
 *
 * @author Darryl L. Pierce
 */
@Component
public class LoadFileContentsWriter extends AbstractComicBookWriter {
  public LoadFileContentsWriter() {
    super(ComicEvent.fileContentsLoaded);
  }
}
