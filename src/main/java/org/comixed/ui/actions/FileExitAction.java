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
import java.awt.event.WindowEvent;

import javax.swing.AbstractAction;

import org.comixed.ui.MainFrame;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * <code>FileExitAction</code> responds to the File->Exit menu item.
 * 
 * @author Darryl L. Pierce
 *
 */
public class FileExitAction extends AbstractAction
{
    private static final long serialVersionUID = 7400132309418120634L;

    @Autowired
    private MainFrame mainFrame;

    @Override
    public void actionPerformed(ActionEvent e)
    {
        mainFrame.dispatchEvent(new WindowEvent(mainFrame, WindowEvent.WINDOW_CLOSING));
    }

}
