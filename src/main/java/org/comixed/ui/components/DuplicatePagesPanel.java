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

import java.awt.BorderLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ComponentEvent;
import java.awt.event.ComponentListener;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.swing.AbstractAction;
import javax.swing.AbstractListModel;
import javax.swing.BoxLayout;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.ListSelectionModel;
import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;

import org.comixed.library.model.Page;
import org.comixed.repositories.ComicRepository;
import org.comixed.ui.dialogs.DuplicatePagesDialog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;

public class DuplicatePagesPanel extends JPanel implements
                                 InitializingBean,
                                 ListSelectionListener
{
    public class HashListModel extends AbstractListModel<String>
    {
        private static final long serialVersionUID = -7373920040413736335L;
        private List<String> hashes = new ArrayList<>();

        @Override
        public String getElementAt(int index)
        {
            if ((index > -1) && (index < this.hashes.size())) return this.hashes.get(index);
            return null;
        }

        @Override
        public int getSize()
        {
            return this.hashes.size();
        }

        public void setHashes(Set<String> hashes)
        {
            this.hashes.clear();
            this.hashes.addAll(hashes);
            this.fireContentsChanged(this, 0, this.hashes.size());
        }
    }

    private static final long serialVersionUID = 1341057570967782488L;
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private DuplicatePagesDialog duplicatePagesDialog;

    @Autowired
    private ComicRepository comicRepository;

    private JList<String> hashList = new JList<>();
    private HashListModel hashListModel = new HashListModel();
    private JPanel coverImage = new JPanel();
    private Map<String,
                List<Page>> hashes;

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.logger.debug("Initializing duplicate pages panel...");
        this.setLayout(new BorderLayout());
        this.add(this.createContent(), BorderLayout.CENTER);
        this.add(this.createButtonBar(), BorderLayout.SOUTH);
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
                DuplicatePagesPanel.this.showSelectedPage();
            }

            @Override
            public void componentShown(ComponentEvent e)
            {}
        });
    }

    private JPanel createButtonBar()
    {
        JPanel result = new JPanel();
        JButton delete = new JButton(new AbstractAction()
        {
            private static final long serialVersionUID = 1L;

            @Override
            public void actionPerformed(ActionEvent e)
            {
                DuplicatePagesPanel.this.logger.debug("Marking pages as deleted...");
                DuplicatePagesPanel.this.markPagesAsDeleted(true);
            }
        });
        delete.setText(this.messageSource.getMessage("dialog.button.delete.label", null, this.getLocale()));

        JButton undelete = new JButton(new AbstractAction()
        {
            private static final long serialVersionUID = 1L;

            @Override
            public void actionPerformed(ActionEvent e)
            {
                DuplicatePagesPanel.this.logger.debug("Marking pages as not deleted...");
                DuplicatePagesPanel.this.markPagesAsDeleted(false);
            }
        });
        undelete.setText(this.messageSource.getMessage("dialog.button.undelete.label", null, this.getLocale()));

        JButton cancel = new JButton(new AbstractAction()
        {
            private static final long serialVersionUID = 1L;

            @Override
            public void actionPerformed(ActionEvent e)
            {
                DuplicatePagesPanel.this.logger.debug("Finished deletion operation...");
                DuplicatePagesPanel.this.duplicatePagesDialog.setVisible(false);
            }
        });
        cancel.setText(this.messageSource.getMessage("dialog.button.close.label", null, this.getLocale()));

        result.setLayout(new BoxLayout(result, BoxLayout.LINE_AXIS));
        result.add(delete);
        result.add(undelete);
        result.add(cancel);
        return result;
    }

    private JPanel createContent()
    {
        JPanel result = new JPanel();

        result.setLayout(new BoxLayout(result, BoxLayout.LINE_AXIS));
        result.add(this.getHashListPanel());
        result.add(new JScrollPane(this.coverImage));

        return result;
    }

    private JPanel getHashListPanel()
    {
        JPanel result = new JPanel();

        result.setLayout(new BoxLayout(result, BoxLayout.Y_AXIS));
        result.add(new JLabel(this.messageSource.getMessage("dialog.duplicate-pages.hash.label", null,
                                                            this.getLocale())));

        this.hashList.addListSelectionListener(this);
        this.hashList.setModel(this.hashListModel);
        this.hashList.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);

        result.add(new JScrollPane(this.hashList));

        return result;
    }

    protected void markPagesAsDeleted(boolean deleted)
    {
        if (this.hashList.getSelectedIndex() > -1)
        {
            List<Page> pages = this.hashes.get(this.hashList.getSelectedValue());

            for (Page page : pages)
            {
                this.logger.debug("Marking page as " + (deleted ? "" : "un") + "deleted for comic: " + page.getComic());
                page.markDeleted(deleted);
                this.comicRepository.save(page.getComic());
            }
        }
    }

    /**
     * Sets the page hashes that have been found and the list of comics to which
     * they're related.
     *
     * @param hashes
     *            the page hashes
     */
    public void setHashes(Map<String,
                              List<Page>> hashes)
    {
        this.logger.debug("Setting page hashes");

        this.hashes = hashes;
        this.hashListModel.setHashes(hashes.keySet());
        this.hashList.clearSelection();
    }

    private void showSelectedPage()
    {
        this.coverImage.removeAll();
        if (this.hashList.getSelectedIndex() > -1)
        {
            Page page = this.hashes.get(this.hashList.getSelectedValue()).get(0);

            this.logger.debug("Showing selected page: " + page);
            this.coverImage.add(new JScrollPane(new JLabel(new ImageIcon(page.getImage(this.coverImage.getWidth(), -1)))));
            this.repaint();
            this.revalidate();
        }
    }

    @Override
    public void valueChanged(ListSelectionEvent event)
    {
        this.showSelectedPage();
    }
}
