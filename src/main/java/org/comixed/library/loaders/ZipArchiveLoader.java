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

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Enumeration;

import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveOutputStream;
import org.apache.commons.compress.archivers.zip.ZipFile;
import org.comixed.library.model.Comic;
import org.comixed.library.model.Page;
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
    public ZipArchiveLoader()
    {
        super("cbz");
    }

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

    void saveComicInternal(Comic source, String filename) throws ArchiveLoaderException
    {
        logger.debug("Creating temporary file: " + filename);

        ZipArchiveOutputStream zoutput;
        try
        {
            zoutput = new ZipArchiveOutputStream(new FileOutputStream(filename));
        }
        catch (FileNotFoundException error)
        {
            throw new ArchiveLoaderException("error opening output comic archive", error);
        }

        // TODO write the comic meta-data to the archive
        for (int index = 0;
             index < source.getPageCount();
             index++)
        {
            // TODO if the page is deleted, then skip it
            Page page = source.getPage(index);
            ZipArchiveEntry entry = new ZipArchiveEntry(page.getFilename());
            try
            {
                logger.debug("Adding entry: " + page.getFilename() + " size=" + page.getContent().length);
                // entry.setSize(page.getContent().length);
                zoutput.addRawArchiveEntry(entry, new ByteArrayInputStream(page.getContent()));
                zoutput.putArchiveEntry(entry);
                zoutput.write(page.getContent(), 0, page.getContent().length);
                zoutput.closeArchiveEntry();
            }
            catch (IOException error)
            {
                throw new ArchiveLoaderException("unable to create archive entry: " + page.getFilename(), error);
            }
        }

        try
        {
            zoutput.close();
        }
        catch (IOException error)
        {
            throw new ArchiveLoaderException("error closing output comic archive", error);
        }
    }

    private void saveContent(String entryName, byte[] content, OutputStream output) throws ArchiveLoaderException
    {
        logger.debug("Writing archive entry: " + entryName + " size=" + content.length);
        ZipArchiveEntry entry = new ZipArchiveEntry(entryName);
        entry.setSize(content.length);
        try
        {
            output.write(content);
        }
        catch (IOException error)
        {
            throw new ArchiveLoaderException("Failed to write archive entry: " + entryName, error);
        }
    }
}
