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

package org.comixed.ui.components;

import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Image;

import javax.swing.JPanel;

import org.comixed.library.model.Comic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>ComicCoverDetails</code> shows a single comic's cover and the details
 * for the comic.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class ComicCoverDetails extends JPanel
{
    private static final long serialVersionUID = 5410694331744499379L;
    private static final int IMAGE_BORDER_WIDTH = 5;

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private MessageSource messageSource;

    private Comic comic;
    private Image image = null;
    private int parentHeight = 0;
    private boolean parentHeightChanged = false;

    /**
     * Returns the comic.
     *
     * @return the comic
     */
    public Comic getComic()
    {
        return this.comic;
    }

    @Override
    public Dimension getPreferredSize()
    {
        this.loadImage();
        return super.getPreferredSize();
    }

    private void loadImage()
    {
        // if we don't have a parent, then just return
        if (this.getParent() == null) return;

        if (this.parentHeight == 0)
        {
            this.logger.debug("Getting parent's height directly");
            this.parentHeight = this.getParent().getHeight();
        }
        else
        {
            int newHeight = this.getParent().getHeight();
            if (newHeight != this.parentHeight)
            {
                logger.debug("Parent height changed");
                this.parentHeight = newHeight;
                this.parentHeightChanged = true;
            }
            else
            {
                logger.debug("Parent height has not changed");
            }
        }
        // if the parent height is still 0 then just blow out
        if (this.parentHeight == 0)
        {
            this.logger.debug("No parent height, so no cover will be displayed");
            setPreferredSize(new Dimension(0, 0));
            return;
        }
        // return if we already have an image and our height hasn't changed
        if ((this.image != null) && !this.parentHeightChanged) return;

        // turn off the parent height changed flag
        this.parentHeightChanged = false;
        this.logger.debug("The parent height is " + this.parentHeight);
        this.image = null;
        this.image = this.comic.getCover().getImage(0, this.parentHeight - (2 * IMAGE_BORDER_WIDTH));
        setPreferredSize(new Dimension(this.image.getWidth(null), this.image.getHeight(null)));
    }

    @Override
    public void paint(Graphics g)
    {
        this.loadImage();
        g.drawImage(this.image, IMAGE_BORDER_WIDTH, IMAGE_BORDER_WIDTH, this);
    }

    /**
     * Sets the comic displayed by this panel.
     *
     * @param comic
     *            the comic
     */
    public void setComic(Comic comic)
    {
        this.logger.debug("Setting the comic: filename=" + comic.getFilename());
        this.comic = comic;
        this.setPopupDetails();
    }

    /**
     * Sets the height of the parent component.
     *
     * @param parentHeight
     *            the height
     */
    public void setParentHeight(int parentHeight)
    {
        // only set the parent height if it's changed
        if (parentHeight != this.parentHeight)
        {
            this.logger.debug("Setting the parent height: " + parentHeight);
            this.parentHeight = parentHeight;
            this.parentHeightChanged = true;
        }
    }

    private void setPopupDetails()
    {
        this.logger.debug("Creating the tool tip text details");
        this.setToolTipText(this.messageSource.getMessage("view.cover.hover_text", new Object[]
        {this.comic.getSeries(),
         this.comic.getPublisher(),
         this.comic.getVolume(),
         this.comic.getIssueNumber(),
         this.comic.getCoverDate(),
         this.comic.getFilename()}, this.getLocale()));
    }
}