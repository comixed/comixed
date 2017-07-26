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

package org.comixed.ui.actions;

import java.awt.event.ActionEvent;

import javax.swing.AbstractAction;

import org.comixed.library.model.ComicSelectionModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>RefreshDisplayAction</code> instructs the current views to refresh by
 * notifying the selection model to reload its content.
 * 
 * @author Darryl L. Pierce
 *
 */
@Component
public class RefreshDisplayAction extends AbstractAction
{
    private static final long serialVersionUID = 5309197704080743070L;
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicSelectionModel comicSelectionModel;

    @Override
    public void actionPerformed(ActionEvent e)
    {
        logger.debug("Refreshing views");
        comicSelectionModel.reload();
    }
}
