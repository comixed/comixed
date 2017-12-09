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

import java.awt.Graphics;

import javax.swing.JTable;
import javax.swing.table.DefaultTableCellRenderer;

import org.comixed.library.model.Page;
import org.springframework.stereotype.Component;

/**
 * <code>TableCellPageRenderer</code> captures the logic for displaying a
 * {@link Page} in a {@link JTable}.
 * 
 * @author Darryl L. Pierce
 *
 */
@Component
public class TableCellPageRenderer extends DefaultTableCellRenderer
{
    private static final long serialVersionUID = -1913616697134663978L;
    private Page page;

    @Override
    public void paint(Graphics g)
    {
        // constrain the image to the width of the cell
        g.drawImage(this.page.getImage(this.getWidth(), -1), 0, 0, null);
    }

    @Override
    protected void setValue(Object value)
    {
        this.page = (Page )value;
    }
}
