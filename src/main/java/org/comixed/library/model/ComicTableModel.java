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

package org.comixed.library.model;

import java.util.Locale;

import javax.swing.table.DefaultTableModel;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

/**
 * <code>ComicTableModel</code> provides the model for viewing the set of comics
 * in the library.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class ComicTableModel extends DefaultTableModel implements
                             InitializingBean,
                             ComicSelectionListener
{
    private static final int ARCHIVE_TYPE = 14;
    private static final int TEAMS = 13;
    private static final int SUMMARY = 12;
    private static final int STORY_ARCS = 11;
    private static final int PAGE_COUNT = 10;
    private static final int LOCATIONS = 9;
    private static final int ISSUE_NUMBER = 8;
    private static final int FILENAME = 7;
    private static final int DESCRIPTION = 6;
    private static final int LAST_READ_DATE = 5;
    private static final int ADDED_DATE = 4;
    private static final int COVER_DATE = 3;
    private static final int PUBLISHER = 2;
    private static final int VOLUME = 1;
    private static final int NAME = 0;
    private static final long serialVersionUID = -2124724909306232112L;
    static final String[] COLUMN_NAMES =
    {"name",
     "volume",
     "publisher",
     "date_published",
     "date_added",
     "date_last_ready",
     "description",
     "filename",
     "issue_number",
     "locations",
     "pages",
     "story_arcs",
     "summary",
     "teams",
     "archive_type"};

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private ComicSelectionModel comicSelectionModel;

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.comicSelectionModel.addComicSelectionListener(this);
    }

    @Override
    public int getColumnCount()
    {
        return COLUMN_NAMES.length;
    }

    @Override
    public String getColumnName(int column)
    {
        return this.messageSource.getMessage("view.table." + COLUMN_NAMES[column] + ".label", null,
                                             Locale.getDefault());
    }

    @Override
    public int getRowCount()
    {
        return this.comicSelectionModel != null ? this.comicSelectionModel.getComicCount() : 0;
    }

    @Override
    public Object getValueAt(int row, int column)
    {
        this.logger.debug("Getting value at " + row + "x" + column);
        Comic comic = (this.comicSelectionModel != null) ? this.comicSelectionModel.getComic(row) : null;

        if (comic != null)
        {
            switch (column)
            {
                case NAME:
                    return comic.getSeries();
                case VOLUME:
                    return comic.getVolume();
                case PUBLISHER:
                    return comic.getPublisher();
                case COVER_DATE:
                    return comic.getCoverDate();
                case ADDED_DATE:
                    return comic.getDateAdded();
                case LAST_READ_DATE:
                    return comic.getDateLastRead();
                case DESCRIPTION:
                    return comic.getDescription();
                case FILENAME:
                    return comic.getFilename();
                case ISSUE_NUMBER:
                    return comic.getIssueNumber();
                case LOCATIONS:
                    return comic.getLocations();
                case PAGE_COUNT:
                    return comic.getPageCount();
                case STORY_ARCS:
                    return comic.getStoryArcs();
                case SUMMARY:
                    return comic.getSummary();
                case TEAMS:
                    return comic.getTeams();
                case ARCHIVE_TYPE:
                    return comic.getArchiveType();
            }
        }

        return null;
    }

    @Override
    public void selectionChanged()
    {/* do nothing */}

    @Override
    public void comicListChanged()
    {
        this.fireTableDataChanged();
    }
}
