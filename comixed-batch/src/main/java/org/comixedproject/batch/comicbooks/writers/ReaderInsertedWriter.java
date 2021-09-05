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

import lombok.extern.log4j.Log4j2;
import org.comixedproject.state.comic.ComicEvent;
import org.springframework.stereotype.Component;

/**
 * <code>ReaderInsertedWriter</code> fires an event to announce that comics have been inserted into
 * the database.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ReaderInsertedWriter extends AbstractComicWriter {
  public ReaderInsertedWriter() {
    super(ComicEvent.recordInserted);
  }
}
