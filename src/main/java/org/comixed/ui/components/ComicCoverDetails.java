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

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Image;

import javax.swing.JPanel;

import org.comixed.library.model.Comic;

/**
 * <code>ComicCoverDetails</code> shows a single comic's cover and the details
 * for the comic.
 *
 * @author Darryl L. Pierce
 *
 */
public class ComicCoverDetails extends JPanel
{
    private static final long serialVersionUID = 5410694331744499379L;
    private static final int IMAGE_BORDER_WIDTH = 5;

    private Comic comic;
    private boolean selected;
    private Image image = null;
    private Dimension dimensions;
    private int parentHeight;

    public ComicCoverDetails(Comic comic, int parentHeight)
    {
        this.comic = comic;
        this.parentHeight = parentHeight;
    }

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
        if (this.image == null)
        {
            this.loadImage();
        }
        return this.dimensions;
    }

    private void loadImage()
    {
        this.image = null;
        this.image = this.comic.getCover().getImage(0, this.parentHeight - (2 * IMAGE_BORDER_WIDTH));
        this.dimensions = new Dimension(this.image.getWidth(null) + (2 * IMAGE_BORDER_WIDTH),
                                        this.image.getHeight(null) + (2 * IMAGE_BORDER_WIDTH));
    }

    @Override
    public void paint(Graphics g)
    {
        if (this.image == null)
        {
            this.loadImage();
        }
        g.drawImage(this.image, IMAGE_BORDER_WIDTH, IMAGE_BORDER_WIDTH, this);
        if (this.selected)
        {
            g.setColor(Color.RED);
            g.draw3DRect(0, 0, this.getWidth(), this.getHeight(), true);
        }
    }

    public void setSelected(boolean selected)
    {
        this.selected = selected;
    }
}