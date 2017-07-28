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

import java.awt.GridLayout;

import javax.swing.JPanel;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * <code>SystemStatusPanel</code> shows details of the library, and of any
 * selected comics, in the main window frame of the application.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class SystemStatusPanel extends JPanel implements
                               InitializingBean
{
    private static final long serialVersionUID = -2506202865075901419L;
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private LibraryDetailsPanel libraryDetailsPanel;

    @Autowired
    private WorkerQueueDetailsPanel workerQueueDetailsPanel;

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.setLayout(new GridLayout(2, 1));
        this.add(this.libraryDetailsPanel);
        this.add(this.workerQueueDetailsPanel);
    }
}
