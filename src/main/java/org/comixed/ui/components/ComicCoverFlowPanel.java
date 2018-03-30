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

import java.awt.event.ComponentEvent;
import java.awt.event.ComponentListener;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.swing.JPanel;

import org.comixed.library.model.Comic;
import org.comixed.library.model.ComicSelectionListener;
import org.comixed.library.model.ComicSelectionModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * <code>ComicCoverFlowPanel</code> shows the covers for the current selection
 * of
 * comics.
 *
 * @author Darryl L. Pierce
 *
 */
public class ComicCoverFlowPanel extends JPanel implements
                                 InitializingBean,
                                 ComicSelectionListener
{
    private static final long serialVersionUID = 1101496443624366432L;
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicSelectionModel comicSelectionModel;
    @Autowired
    private ObjectFactory<ComicCoverDetails> comicCoverDetailsFactory;
    private int lastHash = -1;
    private List<String> coverHashes = new ArrayList<>();
    private Map<String,
                ComicCoverDetails> comicCovers = new HashMap<>();

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.comicSelectionModel.addComicSelectionListener(this);

        this.addComponentListener(new ComponentListener()
        {
            @Override
            public void componentHidden(ComponentEvent e)
            {}

            @Override
            public void componentMoved(ComponentEvent e)
            {}

            @Override
            public void componentResized(ComponentEvent e)
            {
                ComicCoverFlowPanel.this.redisplayCovers(true);
            }

            @Override
            public void componentShown(ComponentEvent e)
            {}
        });
    }

    @Override
    public void comicListChanged()
    {
        this.logger.debug("Removing all covers");
        this.redisplayCovers(false);
    }

    private void redisplayCovers(boolean refresh)
    {
        this.logger.debug("Refreshing comic covers view");
        List<Comic> allComics = this.comicSelectionModel.getSelectedComics()
                                                        .isEmpty() ? this.comicSelectionModel.getAllComics()
                                                                   : this.comicSelectionModel.getSelectedComics();

        if (!refresh && (this.lastHash == allComics.hashCode()))
        {
            this.logger.debug("Not refreshing and no selection change, so returning");
            return;
        }

        if ((this.lastHash == -1) || (this.lastHash != allComics.hashCode()))
        {
            this.removeUnselectedComics(allComics);
            this.logger.debug("Reloading comic covers");
            // add only the covers for comics not previously displayed
            for (Comic comic : allComics)
            {
                if (!this.comicCovers.containsKey(comic.getFilename()))
                {
                    this.logger.debug("Adding cover for " + comic.getFilename());
                    ComicCoverDetails cover = this.comicCoverDetailsFactory.getObject();
                    cover.setComic(comic);
                    cover.setParentHeight((int )this.getVisibleRect().getHeight());
                    this.add(cover);
                    this.comicCovers.put(comic.getFilename(), cover);
                }
            }
            this.lastHash = allComics.hashCode();
        }
        else
        {
            this.logger.debug("No need to reload comics");
        }

        ComicCoverFlowPanel.this.repaint();
        ComicCoverFlowPanel.this.revalidate();
    }

    /**
     * Removes any covers that are displayed but no longer selected.
     *
     * @param allComics
     *            The set of all currently selected comics
     */
    private void removeUnselectedComics(List<Comic> allComics)
    {
        this.logger.debug("Remove any comic not in the selection set");
        for (java.awt.Component component : this.getComponents())
        {
            ComicCoverDetails coverDetails = (ComicCoverDetails )component;

            if (!allComics.contains(coverDetails.getComic()))
            {
                this.logger.debug("Removing cover for comic: " + coverDetails.getComic().getFilename());
                this.comicCovers.remove(coverDetails.getComic().getFilename());
                this.remove(coverDetails);
            }
        }
    }

    @Override
    public void selectionChanged()
    {
        this.redisplayCovers(true);
    }
}
