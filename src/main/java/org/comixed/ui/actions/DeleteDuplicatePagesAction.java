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
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.swing.AbstractAction;

import org.comixed.library.model.Page;
import org.comixed.repositories.PageRepository;
import org.comixed.ui.components.DuplicatePagesPanel;
import org.comixed.ui.dialogs.DuplicatePagesDialog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class DeleteDuplicatePagesAction extends AbstractAction
{
    private static final long serialVersionUID = 1708382112296501389L;
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private PageRepository pageRepository;

    @Autowired
    private DuplicatePagesDialog duplicatePagesDialog;

    @Autowired
    private DuplicatePagesPanel duplicatePagesPanel;

    @Override
    public void actionPerformed(ActionEvent e)
    {
        logger.debug("Deleting duplicate pages...");

        List<Page> duplicatePages = pageRepository.getDuplicatePageList();
        Map<String,
            List<Page>> hashes = new HashMap<>();
        for (Page page : duplicatePages)
        {
            List<Page> pages = hashes.get(page.getHash());
            if (pages == null)
            {
                logger.debug(MessageFormat.format("Adding {0} to page list", page.getHash()));
                pages = new ArrayList<>();
                hashes.put(page.getHash(), pages);
            }
            pages.add(page);
        }

        duplicatePagesPanel.setHashes(hashes);
        duplicatePagesDialog.setVisible(true);
    }
}
