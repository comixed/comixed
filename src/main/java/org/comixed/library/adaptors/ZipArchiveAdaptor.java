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
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Enumeration;

import org.apache.commons.compress.archivers.ArchiveException;
import org.apache.commons.compress.archivers.ArchiveStreamFactory;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveOutputStream;
import org.apache.commons.compress.archivers.zip.ZipFile;
import org.comixed.library.model.Comic;
import org.comixed.library.model.Page;
import org.springframework.stereotype.Component;

/**
 * <code>ZipArchiveAdaptor</code> provides a concrete implementation of
 * {@link ArchiveAdaptor} for ZIP files.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class ZipArchiveAdaptor extends AbstractArchiveAdaptor
{
    public ZipArchiveAdaptor()
    {
        super("cbz");
    }

    protected byte[] loadComicInternal(Comic comic, String entryName) throws ArchiveAdaptorException
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
            throw new ArchiveAdaptorException("unable to open file: " + file.getAbsolutePath(), error);
        }
    }

    void saveComicInternal(Comic source, String filename) throws ArchiveAdaptorException
    {
        logger.debug("Creating temporary file: " + filename);

        ZipArchiveOutputStream zoutput = null;
        try
        {
            zoutput = (ZipArchiveOutputStream )new ArchiveStreamFactory().createArchiveOutputStream(ArchiveStreamFactory.ZIP,
                                                                                                    new FileOutputStream(filename));

            // TODO write the comic meta-data to the archive
            for (int index = 0;
                 index < source.getPageCount();
                 index++)
            {
                // TODO if the page is deleted, then skip it
                Page page = source.getPage(index);
                logger.debug("Adding entry: " + page.getFilename() + " size=" + page.getContent().length);
                ZipArchiveEntry entry = new ZipArchiveEntry(page.getFilename());
                entry.setSize(page.getContent().length);
                zoutput.putArchiveEntry(entry);
                zoutput.write(page.getContent());
                zoutput.closeArchiveEntry();
            }

            zoutput.finish();
            zoutput.close();
        }
        catch (IOException
               | ArchiveException error)
        {
            throw new ArchiveAdaptorException("error creating comic archive", error);
        }
    }
}
