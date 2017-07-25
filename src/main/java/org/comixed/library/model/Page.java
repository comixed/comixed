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

import java.awt.Image;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.swing.ImageIcon;

import org.comixed.library.adaptors.ArchiveAdaptorException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <code>Page</code> represents a single page from a comic.
 *
 * @author Darryl L. Pierce
 *
 */
@Entity
@Table(name = "pages")
public class Page
{
    @Transient
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "comic_id")
    private Comic comic;

    @Column(name = "filename",
            updatable = true,
            nullable = false)
    private String filename;

    @Column(name = "hash",
            updatable = true,
            nullable = false)
    private String hash;

    @Transient
    private byte[] content;

    @Transient
    private ImageIcon icon;

    /**
     * Default constructor.
     */
    public Page()
    {}

    /**
     * Creates a new instance with the given filename and image content.
     *
     * @param filename
     *            the filename
     * @param content
     *            the content
     */
    public Page(String filename, byte[] content)
    {
        this.logger.debug("Creating page: filename=" + filename + " content.size=" + content.length);
        this.filename = filename;
        this.content = content;
        this.hash = this.createHash(content);
    }

    private String createHash(byte[] bytes)
    {
        this.logger.debug("Generating MD5 hash");
        String result = "";
        MessageDigest md;
        try
        {
            md = MessageDigest.getInstance("MD5");
            md.update(bytes);
            result = new BigInteger(1, md.digest()).toString(16).toUpperCase();
        }
        catch (NoSuchAlgorithmException error)
        {
            this.logger.error("Failed to generate hash", error);
        }
        this.logger.debug("Returning: " + result);
        return result;
    }

    @Override
    public boolean equals(Object obj)
    {
        if (this == obj) return true;
        if (obj == null) return false;
        if (this.getClass() != obj.getClass()) return false;
        Page other = (Page )obj;
        if (this.filename == null)
        {
            if (other.filename != null) return false;
        }
        else if (!this.filename.equals(other.filename)) return false;
        if (this.hash == null)
        {
            if (other.hash != null) return false;
        }
        else if (!this.hash.equals(other.hash)) return false;
        return true;
    }

    /**
     * Returns the owning comic.
     *
     * @return the comic
     */
    public Comic getComic()
    {
        return this.comic;
    }

    /**
     * Returns the content for the page.
     *
     * @return the content
     */
    public byte[] getContent()
    {
        if (this.content == null)
        {
            try
            {
                if (this.comic.archiveType == null)
                {
                    logger.debug("WTF?");
                }
                this.content = this.comic.archiveType.getArchiveAdaptor().loadSingleFile(this.comic, this.filename);
            }
            catch (ArchiveAdaptorException error)
            {
                logger.warn("failed to load entry: " + this.filename + " comic=" + this.comic.getFilename(), error);
            }
        }
        return this.content;
    }

    /**
     * Returns the filename for the page.
     *
     * @return the filename
     */
    public String getFilename()
    {
        return this.filename;
    }

    public String getHash()
    {
        return this.hash;
    }

    /**
     * Returns the original image for the page.
     *
     * @return the image
     */
    public ImageIcon getImage()
    {
        if (this.icon == null)
        {
            this.logger.debug("Generating image from content");
            this.icon = new ImageIcon(this.content);
        }
        return this.icon;
    }

    /**
     * Returns the image, resized so that the width is the specified width.
     *
     * @param width
     *            the maximum width
     * @return the resized image
     */
    public ImageIcon getImage(int width)
    {
        ImageIcon image = this.getImage();
        int oldWidth = image.getIconWidth();
        int oldHeight = image.getIconHeight();
        int height = (int )(((float )width / (float )oldWidth) * oldHeight);
        this.logger.debug("Fetching resized image: " + width + "x" + height);

        return new ImageIcon(this.icon.getImage().getScaledInstance(width, height, Image.SCALE_FAST));
    }

    @Override
    public int hashCode()
    {
        final int prime = 31;
        int result = 1;
        result = (prime * result) + ((this.filename == null) ? 0 : this.filename.hashCode());
        result = (prime * result) + ((this.hash == null) ? 0 : this.hash.hashCode());
        return result;
    }

    void setComic(Comic comic)
    {
        this.comic = comic;
    }

    /**
     * Sets a new filename for the page.
     *
     * @param filename
     *            the new filename
     */
    public void setFilename(String filename)
    {
        this.logger.debug("Changing filename: " + this.filename + " -> " + filename);
        this.filename = filename;
    }
}
