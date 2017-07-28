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

import javax.swing.JPanel;
import javax.swing.border.BevelBorder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <code>DetailsPanel</code> provides a base class for all detail panels.
 * 
 * @author Darryl L. Pierce
 *
 */
public abstract class DetailsPanel extends JPanel
{
    private static final long serialVersionUID = -8991341093113964735L;
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    public DetailsPanel()
    {
        super(true);
        this.setBorder(new BevelBorder(BevelBorder.LOWERED));
    }
}
