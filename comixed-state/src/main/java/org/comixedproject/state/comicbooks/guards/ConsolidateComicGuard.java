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

package org.comixedproject.state.comicbooks.guards;

import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_RENAMING_RULE;
import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_TARGET_DIRECTORY;

import java.io.File;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.statemachine.StateContext;
import org.springframework.stereotype.Component;

/**
 * <code>ConsolidateComicGuard</code> checks if the comic already has the target filename.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ConsolidateComicGuard extends AbstractComicGuard {
  @Autowired private ComicFileAdaptor comicFileAdaptor;
  @Autowired private FileAdaptor fileAdaptor;

  @Override
  public boolean evaluate(final StateContext<ComicState, ComicEvent> context) {
    log.trace("Fetching comicBook");
    final ComicBook comicBook = this.fetchComic(context);
    log.trace("Fetching target directory");
    final String targetDirectory =
        context.getMessageHeaders().get(HEADER_TARGET_DIRECTORY, String.class);
    log.trace("Fetching renaming rule");
    final String renamingRule = context.getMessageHeaders().get(HEADER_RENAMING_RULE, String.class);
    log.trace("Generating target name");
    final String targetName =
        this.comicFileAdaptor.createFilenameFromRule(comicBook, renamingRule, targetDirectory);
    log.trace("Ensuring the comicBook filename would be different");
    return !this.fileAdaptor.sameFile(comicBook.getComicDetail().getFile(), new File(targetName));
  }
}
