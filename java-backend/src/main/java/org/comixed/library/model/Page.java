/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.WeakHashMap;

import javax.imageio.ImageIO;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.comixed.library.adaptors.archive.ArchiveAdaptorException;
import org.hibernate.annotations.Formula;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;

/**
 * <code>Page</code> represents a single offset from a comic.
 *
 * @author Darryl L. Pierce
 *
 */
@Entity
@Table(name = "pages")
@NamedQueries(
{@NamedQuery(name = "Page.getDuplicatePageList",
             query = "SELECT p FROM Page p WHERE p.hash IN (SELECT d.hash FROM Page d GROUP BY d.hash HAVING COUNT(*) > 1)"),
 @NamedQuery(name = "Page.getDuplicatePageCount",
             query = "SELECT COUNT(p) FROM Page p WHERE p.hash IN (SELECT d.hash FROM Page d GROUP BY d.hash HAVING COUNT(*) > 1)"),
 @NamedQuery(name = "Page.getDuplicatePageHashes",
             query = "SELECT DISTINCT(p.hash) from Page p WHERE p.hash IN (SELECT d.hash FROM Page d GROUP BY d.hash HAVING COUNT(*) > 1)")})
public class Page
{

    public static String createImageCacheKey(int width, int height)
    {
        return String.valueOf(width) + "x" + String.valueOf(height);
    }

    @Transient
    @JsonIgnore
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonView(View.List.class)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "comic_id")
    @JsonIgnore
    private Comic comic;

    @ManyToOne
    @JoinColumn(name = "type_id")
    @JsonProperty("page_type")
    @JsonView(View.List.class)
    private PageType pageType;

    @Column(name = "filename",
            updatable = true,
            nullable = false)
    @JsonView(View.List.class)
    private String filename;

    @Column(name = "hash",
            updatable = true,
            nullable = false)
    @JsonView(View.List.class)
    private String hash;

    @Column(name = "deleted",
            updatable = true,
            nullable = false)
    @JsonView(View.List.class)
    private boolean deleted = false;

    @Column(name = "width",
            updatable = true)
    @JsonView(View.Details.class)
    private Integer width = -1;

    @Column(name = "height",
            updatable = true)
    @JsonView(View.Details.class)
    private Integer height = -1;

    @Transient
    @JsonIgnore
    private byte[] content;

    @Transient
    @JsonIgnore
    private Image icon;

    @Transient
    @JsonIgnore
    protected Map<String,
                  Image> imageCache = new WeakHashMap<>();

    @Formula("(SELECT CASE WHEN (COUNT(SELECT * FROM blocked_page_hashes b WHERE b.hash = hash) > 0) THEN true ELSE false END)")
    @JsonView(View.List.class)
    private boolean blocked;

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
     * @param pageType
     *            the offset type
     */
    public Page(String filename, byte[] content, PageType pageType)
    {
        this.logger.debug("Creating offset: filename=" + filename + " content.size=" + content.length);
        this.filename = filename;
        this.content = content;
        this.hash = this.createHash(content);
        this.pageType = pageType;
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

    @JsonProperty(value = "comic_id")
    @JsonView(View.Details.class)
    public Long getComicId()
    {
        return this.comic != null ? this.comic.getId() : null;
    }

    /**
     * Returns the content for the offset.
     *
     * @return the content
     */
    @JsonIgnore
    public byte[] getContent()
    {
        if (this.content == null)
        {
            this.logger.debug("Loading offset image: filename=" + this.filename);
            try
            {
                if (this.comic.archiveType != null)
                {
                    this.content = this.comic.archiveType.getArchiveAdaptor().loadSingleFile(this.comic, this.filename);
                }
            }
            catch (ArchiveAdaptorException error)
            {
                this.logger.warn("failed to load entry: " + this.filename + " comic=" + this.comic.getFilename(),
                                 error);
            }
        }
        return this.content;
    }

    /**
     * Returns the filename for the offset.
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
     * Returns the height of the image.
     *
     * @return the image height
     */
    public int getHeight()
    {
        if ((this.height == null) || (this.height == -1))
        {
            this.getImageMetrics();
        }
        return this.height;
    }

    /**
     * Returns the original image for the offset.
     *
     * @return the image
     */
    @JsonIgnore
    public Image getImage()
    {
        if (this.icon == null)
        {
            this.logger.debug("Generating image from content");
            try
            {
                this.icon = ImageIO.read(new ByteArrayInputStream(this.getContent()));
                this.width = this.icon.getWidth(null);
                this.height = this.icon.getHeight(null);
            }
            catch (IOException error)
            {
                this.logger.error("Failed to load image from " + this.comic.getFilename(), error);
            }
        }
        return this.icon;
    }

    /**
     * Returns a scaled copy of the offset image.
     *
     * @param maxWidth
     *            the maximum scaled width
     * @param maxHeight
     *            the maximum scaled height
     * @return the scaled image
     */
    public Image getImage(int maxWidth, int maxHeight)
    {
        this.logger.debug("Scaling offset: maxWidth=" + maxWidth + ", maxHeight=" + maxHeight);
        Image image = this.getImage();

        int boundWidth = maxWidth;
        int boundHeight = maxHeight;
        int oldWidth = image.getWidth(null);
        int oldHeight = image.getHeight(null);

        this.logger.debug("oldWidth=" + oldWidth);
        this.logger.debug("oldHeight=" + oldHeight);

        if ((boundWidth < 1) && (boundHeight < 1))
        {
            this.logger.debug("If both maxWidth and maxHeight are less than 1, then consider using getImage()");
            boundWidth = oldWidth;
            boundHeight = oldHeight;
        }
        else if (boundWidth < 1)
        {
            boundWidth = (int )(((float )oldWidth * (float )boundHeight) / oldHeight);
        }
        else if (boundHeight < 1)
        {
            boundHeight = (int )(((float )oldHeight * (float )boundWidth) / oldWidth);
        }

        Image result = null;
        String key = Page.createImageCacheKey(boundWidth, boundHeight);

        if (this.imageCache.containsKey(key))
        {
            this.logger.debug("Found image in cache: (" + boundWidth + "x" + boundHeight + ")");
            result = this.imageCache.get(key);
        }
        else
        {
            this.logger.debug("Scaling image: old=(" + oldWidth + "x" + oldHeight + ") new=(" + boundWidth + "x"
                              + boundHeight + ")");
            result = image.getScaledInstance(boundWidth, boundHeight, Image.SCALE_SMOOTH);
            this.logger.debug("Placing scaled image into cache");
            this.imageCache.put(key, result);
        }

        return result;
    }

    private void getImageMetrics()
    {
        try
        {
            if (!this.comic.isMissing())
            {
                BufferedImage bimage = ImageIO.read(new ByteArrayInputStream(this.getContent()));
                this.width = bimage.getWidth();
                this.height = bimage.getHeight();
            }
            else
            {
                this.width = this.height = 0;
            }
        }
        catch (IOException e)
        {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    /**
     * Returns the offset's index within the comic.
     *
     * @return the offset index
     */
    @Transient
    @JsonView(View.List.class)
    @JsonProperty(value = "index")
    public int getIndex()
    {
        return this.comic.getIndexFor(this);
    }

    /**
     * Returns the offset type.
     *
     * @return the offset type
     */
    public PageType getPageType()
    {
        return this.pageType;
    }

    /**
     * Returns the width of the image.
     *
     * @return the image width
     *
     */
    public int getWidth()
    {
        if ((this.width == null) || (this.width == -1))
        {
            this.getImageMetrics();
        }
        return this.width;
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

    public boolean isBlocked()
    {
        return this.blocked;
    }

    /**
     * Returns if the offset is marked for deletion.
     *
     * @return true if marked for deletion
     */
    @JsonIgnore
    public boolean isMarkedDeleted()
    {
        return this.deleted;
    }

    /**
     * Sets the deleted flag for the offset.
     *
     * @param deleted
     *            true if the offset is to be deleted
     */
    public void markDeleted(boolean deleted)
    {
        this.logger.debug("Mark deletion: " + deleted);
        this.deleted = deleted;
    }

    void setComic(Comic comic)
    {
        this.comic = comic;
    }

    /**
     * Sets the content for the offset. Also updates the hash.
     *
     * @param content
     *            the content
     */
    public void setContent(byte[] content)
    {
        this.content = content;
        this.hash = this.createHash(content);
    }

    /**
     * Sets a new filename for the offset.
     *
     * @param filename
     *            the new filename
     */
    public void setFilename(String filename)
    {
        this.logger.debug("Changing filename: " + this.filename + " -> " + filename);
        this.filename = filename;
    }

    /**
     * Sets the offset type for the offset.
     *
     * @param pageType
     *            the offset type
     */
    public void setPageType(PageType pageType)
    {
        this.logger.debug("Changing offset type: {}", pageType.getId());
        this.pageType = pageType;
    }
}
