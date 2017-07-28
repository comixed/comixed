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

import javax.swing.BoxLayout;
import javax.swing.JLabel;

import org.comixed.library.model.ComicSelectionListener;
import org.comixed.library.model.ComicSelectionModel;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

/**
 * <code>LibraryDetailsPanel</code> shows details about the current state of the
 * library.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class LibraryDetailsPanel extends DetailsPanel implements
                                 InitializingBean,
                                 ComicSelectionListener
{
    private static final long serialVersionUID = -8742844084547538845L;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private ComicSelectionModel comicSelectionModel;

    private JLabel totalComics = new JLabel();
    private JLabel displayedComics = new JLabel();

    public LibraryDetailsPanel()
    {
        super();
    }

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.comicSelectionModel.addComicSelectionListener(this);
        this.buildLayout();
        this.updateDisplayedComicCount();
        this.updateTotalComicCount();
    }

    private void buildLayout()
    {
        this.logger.debug("Laying out UI components");
        this.setLayout(new BoxLayout(this, BoxLayout.PAGE_AXIS));
        this.add(this.totalComics);
        this.add(this.displayedComics);
    }

    @Override
    public void comicListChanged()
    {
        this.updateTotalComicCount();
    }

    @Override
    public void selectionChanged()
    {
        this.updateDisplayedComicCount();
    }

    private void updateDisplayedComicCount()
    {
        this.logger.debug("Updating displayed comic count");
        this.displayedComics.setText(this.messageSource.getMessage("view.details.library.displayed-comics.text",
                                                                   new Object[]
                                                                   {this.comicSelectionModel.getComicCount()},
                                                                   this.getLocale()));
    }

    private void updateTotalComicCount()
    {
        this.logger.debug("Updating total comic count");
        this.totalComics.setText(this.messageSource.getMessage("view.details.library.total-comics.text", new Object[]
        {this.comicSelectionModel.getTotalComics()}, this.getLocale()));
    }
}
