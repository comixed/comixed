/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.library.adaptors;

import org.comixed.library.model.Comic;

/**
 * <code>ArchiveAdaptor</code> defines a type which handles loading from and
 * saving to an archive file.
 *
 * @author Darryl L. Pierce
 *
 */
public interface ArchiveAdaptor
{
    /**
     * Loads the entire comic's contents from disk.
     *
     * @param comic
     *            the comic
     * @throws ArchiveAdaptorException
     *             if an error occurs
     */
    void loadComic(Comic comic) throws ArchiveAdaptorException;

    /**
     * Loads a single file from the archive file.
     *
     * @param comic
     *            the comic
     * @param entryName
     *            the entry name
     * @return the content of the entry
     * @throws ArchiveAdaptorException
     *             if an error occurs
     */
    byte[] loadSingleFile(Comic comic, String entryName) throws ArchiveAdaptorException;

    /**
     * Saves the comic.
     *
     * The new comic will have the same base filename and directory as the
     * source, but the extension will comic be determined by the instance of
     * {@link ArchiveAdaptor}.
     *
     * If a comic already exists with the filename, it is replaced by the new
     * comic.
     *
     * @param comic
     *            the comic
     * @param renamePages
     *            true rename pages
     * @return the new comic
     * @throws ArchiveAdaptorException
     *             if an error occurs
     */
    Comic saveComic(Comic comic, boolean renamePages) throws ArchiveAdaptorException;
}