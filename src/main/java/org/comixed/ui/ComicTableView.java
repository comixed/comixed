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

package org.comixed.ui;

import javax.swing.JTable;

import org.comixed.library.model.ComicSelectionModel;
import org.comixed.library.model.ComicTableModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>ComicTableView</code> provides a detailed view of the comics in the
 * library.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class ComicTableView extends JTable implements
                            InitializingBean
{
    private static final long serialVersionUID = -4512908003749212065L;
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComicTableModel comicTableModel;

    @Autowired
    private ComicSelectionModel comicSelectionModel;

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.logger.debug("Connecting comic table to underlying model");
        this.setModel(this.comicTableModel);
        this.logger.debug("Subscribing selection model to table view updates");
        this.getSelectionModel().addListSelectionListener(this.comicSelectionModel);
    }
}
