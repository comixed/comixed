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

import java.io.File;
import java.io.IOException;

import org.comixed.library.model.Comic;
import org.springframework.stereotype.Component;

import com.github.junrar.Archive;
import com.github.junrar.exception.RarException;
import com.github.junrar.impl.FileVolumeManager;
import com.github.junrar.rarfile.FileHeader;

/**
 * <code>RarArchiveAdaptor</code> provides a concrete implementation of
 * {@link ArchiveAdaptor} for RAR files.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class RarArchiveAdaptor extends AbstractArchiveAdaptor
{
    public RarArchiveAdaptor()
    {
        super("cbr");
    }

    @Override
    protected byte[] loadComicInternal(Comic comic, String entryName) throws ArchiveAdaptorException
    {
        File file = this.validateFile(comic);
        byte[] result = null;

        try
        {
            Archive archive = new Archive(new FileVolumeManager(file));
            FileHeader entry = archive.nextFileHeader();

            if (entry == null)
            {
                archive.close();
                throw new ArchiveAdaptorException("Invalid or corrupt RAR file: " + file.getName());
            }

            boolean done = false;

            while ((entry != null) && !done)
            {
                String filename = entry.getFileNameString();

                this.logger.debug("Found entry: entryName={}", entryName);
                this.logger.debug("Processing entry: filename={} size={}", entry.getFileNameString(),
                                  entry.getFullUnpackSize());
                byte[] content = this.loadContent(filename, entry.getFullUnpackSize(), archive.getInputStream(entry));

                if ((entryName != null) && entryName.equals(filename))
                {
                    this.logger.debug("Returning content for desired entry");
                    result = content;
                    done = true;
                }
                else if (entryName == null)
                {
                    this.logger.debug("Processing entry content");
                    this.processContent(comic, filename, content);
                    entry = archive.nextFileHeader();
                }
                else
                {
                    this.logger.debug("Ignoring entry: filename={}", filename);
                    entry = archive.nextFileHeader();
                }
            }

            archive.close();
        }
        catch (RarException
               | IOException error)
        {
            throw new ArchiveAdaptorException("unable to open file: " + file.getAbsolutePath(), error);
        }
        return result;
    }

    @Override
    void saveComicInternal(Comic source, String filename, boolean renamePages) throws ArchiveAdaptorException
    {
        this.logger.warn("Saving RAR comics is not supported");
        throw new ArchiveAdaptorException("Saving CBR comics is not supported");
    }
}
