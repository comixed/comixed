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

package org.comixed.library.model;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import javax.swing.ImageIcon;

import org.h2.util.IOUtils;
import org.junit.Before;
import org.junit.Test;

public class PageTest
{
    private static final String TEST_JPG_FILE = "src/test/resources/example.jpg";
    private Page page;
    private static String expected_hash;
    private static byte[] content;

    static
    {
        File file = new File(TEST_JPG_FILE);
        content = new byte[(int )file.length()];
        FileInputStream input;
        try
        {
            input = new FileInputStream(file);
            IOUtils.readFully(input, content, content.length);
            input.close();
            MessageDigest md = MessageDigest.getInstance("MD5");
            md.update(content);
            expected_hash = new BigInteger(1, md.digest()).toString(16).toUpperCase();
        }
        catch (IOException
               | NoSuchAlgorithmException e)
        {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    @Before
    public void setUp() throws IOException
    {
        page = new Page(TEST_JPG_FILE, content);
    }

    @Test
    public void testHasFilename()
    {
        assertEquals(TEST_JPG_FILE, page.getFilename());
    }

    @Test
    public void testCanUpdateFilename()
    {
        String filename = TEST_JPG_FILE.substring(1);
        page.setFilename(filename);

        assertEquals(filename, page.getFilename());
    }

    @Test
    public void testHasContent()
    {
        assertNotNull(page.getContent());
        assertArrayEquals(content, page.getContent());
    }

    @Test
    public void testHasHash()
    {
        assertEquals(expected_hash, page.getHash());
    }

    @Test
    public void testHasImage()
    {
        ImageIcon result = page.getImage();

        assertNotNull(result);
        assertEquals(338, result.getIconWidth());
        assertEquals(479, result.getIconHeight());
    }

    @Test
    public void testCanResizeImages()
    {
        ImageIcon result = page.getImage(169);

        assertNotNull(result);
        assertEquals(169, result.getIconWidth());
        assertEquals(239, result.getIconHeight());
    }

    @Test
    public void testDelete()
    {
        // check the default
        assertFalse(page.isMarkedDeleted());
    }

    @Test
    public void testMarkDeleted()
    {
        page.markDeleted(true);
        assertTrue(page.isMarkedDeleted());
    }
}
