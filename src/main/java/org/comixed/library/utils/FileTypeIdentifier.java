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

package org.comixed.library.utils;

import java.io.IOException;
import java.io.InputStream;

import org.apache.tika.Tika;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.mime.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>FileTypeIdentifier</code> identifies the mime type for a file or file
 * entry.
 * 
 * @author Darryl L. Pierce
 *
 */
@Component
public class FileTypeIdentifier
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private Tika tika;
    @Autowired
    private Metadata metadata;

    /**
     * Returns the MIME type for the supplied input stream.
     * 
     * @param input
     *            the input stream, which must support
     *            {@link InputStream#mark(int)} and {@link InputStream#reset()}
     * @return the MIME type
     */
    public String typeFor(InputStream input)
    {
        logger.debug("Attempting to detect mime type for stream");
        MediaType result = null;

        try
        {
            input.mark(Integer.MAX_VALUE);
            result = tika.getDetector().detect(input, metadata);
            input.reset();
        }
        catch (IOException error)
        {
            logger.error("Error determining filetype from stream", error);
        }

        logger.debug("result=" + result);
        return result != null ? result.getSubtype() : null;
    }

}
