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

package org.comixed.library.loaders;

import java.io.File;
import java.io.IOException;
import java.util.Enumeration;

import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipFile;
import org.comixed.library.model.Comic;
import org.springframework.stereotype.Component;

/**
 * <code>ZipArchiveLoader</code> provides a concrete implementation of
 * {@link ArchiveLoader} for ZIP files.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class ZipArchiveLoader extends AbstractArchiveLoader
{
    protected byte[] loadComicInternal(Comic comic, String entryName) throws ArchiveLoaderException
    {
        File file = validateFile(comic);

        try
        {
            // FileInputStream istream = new FileInputStream(file);
            // ZipArchiveInputStream input = (ZipArchiveInputStream )new
            // ArchiveStreamFactory().createArchiveInputStream(ArchiveStreamFactory.ZIP,
            // istream);

            ZipFile input = new ZipFile(file);
            byte[] result = null;
            Enumeration<ZipArchiveEntry> entries = input.getEntries();

            while (entries.hasMoreElements())
            {
                ZipArchiveEntry entry = entries.nextElement();
                String filename = entry.getName();
                if (entryName == null || entryName.equals(filename))
                {
                    byte[] content = this.loadContent(entry.getName(), entry.getSize(), input.getInputStream(entry));
                    // if we were looking for a file, then we're done
                    if (entryName != null)
                    {
                        logger.debug("Return content for entry");
                        result = content;
                        break;
                    }
                    else
                    {
                        logger.debug("Processing entry content");
                        processContent(comic, filename, content);
                    }
                }
            }

            input.close();

            return result;
        }
        catch (IOException error)
        {
            throw new ArchiveLoaderException("unable to open file: " + file.getAbsolutePath(), error);
        }
    }
}
