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

import org.comixed.library.model.Comic;
import org.springframework.stereotype.Component;

import com.github.junrar.Archive;
import com.github.junrar.exception.RarException;
import com.github.junrar.impl.FileVolumeManager;
import com.github.junrar.rarfile.FileHeader;

/**
 * <code>RarArchiveLoader</code> provides a concrete implementation of
 * {@link ArchiveLoader} for RAR files.
 * 
 * @author Darryl L. Pierce
 *
 */
@Component
public class RarArchiveLoader extends AbstractArchiveLoader
{
    @Override
    protected byte[] loadComicInternal(Comic comic, String entryName) throws ArchiveLoaderException
    {
        File file = validateFile(comic);
        byte[] result = null;

        try
        {
            Archive archive = new Archive(new FileVolumeManager(file));
            FileHeader entry = archive.nextFileHeader();

            if (entry == null) { throw new ArchiveLoaderException("Invalid or corrupt RAR file: " + file.getName()); }

            while (entry != null)
            {
                String filename = entry.getFileNameString();

                if (entryName == null || entryName.equals(filename))
                {
                    byte[] content = this.loadContent(filename, entry.getFullUnpackSize(),
                                                      archive.getInputStream(entry));

                    if (entryName != null)
                    {
                        logger.debug("Returning content for entry");
                        result = content;
                        break;
                    }
                    else
                    {
                        logger.debug("Processing entry content");
                        processContent(comic, filename, content);
                    }
                }

                entry = archive.nextFileHeader();
            }

            archive.close();
        }
        catch (RarException
               | IOException error)
        {
            throw new ArchiveLoaderException("unable to open file: " + file.getAbsolutePath(), error);
        }
        return result;
    }
}
