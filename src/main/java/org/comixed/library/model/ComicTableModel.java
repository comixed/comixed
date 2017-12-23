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

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import javax.swing.table.DefaultTableModel;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 * <code>ComicTableModel</code> provides the model for viewing the set of comics
 * in the library.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
@EnableConfigurationProperties
@PropertySource("classpath:details-view.properties")
@ConfigurationProperties(prefix = "comic.details-view",
                         ignoreUnknownFields = false)
public class ComicTableModel extends DefaultTableModel implements
                             InitializingBean,
                             ComicSelectionListener
{
    /**
     * <code>ColumnDefinition</code> captures the details for a single column in
     * the details view.
     *
     * @author Darryl L. Pierce
     *
     */
    public static class ColumnDefinition
    {
        private String name;
        private String method;

        public String getMethod()
        {
            return this.method;
        }

        public String getName()
        {
            return this.name;
        }

        public void setMethod(String method)
        {
            this.method = method;
        }

        public void setName(String label)
        {
            this.name = label;
        }
    }

    private static final long serialVersionUID = -2124724909306232112L;

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private MessageSource messageSource;
    @Autowired
    private ComicSelectionModel comicSelectionModel;
    List<ColumnDefinition> columnNames = new ArrayList<>();

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.logger.debug("afterPropertiesSet()");
        this.comicSelectionModel.addComicSelectionListener(this);
    }

    @Override
    public void comicListChanged()
    {
        this.fireTableDataChanged();
        this.comicSelectionModel.fireListChangedEvent();
    }

    @Override
    public int getColumnCount()
    {
        return this.columnNames.size();
    }

    @Override
    public String getColumnName(int column)
    {
        String name = this.columnNames.get(column).getName();
        String key = "view.table." + name + ".label";

        this.logger.debug("Fetching translated column name: key=" + key);
        return this.messageSource.getMessage(key, null, name, Locale.getDefault());
    }

    public List<ColumnDefinition> getColumnNames()
    {
        return this.columnNames;
    }

    /**
     * Returns the comic at the given index.
     *
     * @param index
     *            the index
     * @return the comic
     */
    public Comic getComicAt(int index)
    {
        if ((index < 0)
            || (index > this.comicSelectionModel.getComicCount())) throw new IndexOutOfBoundsException("Invalid comic: index=" + index);
        return this.comicSelectionModel.getComic(index);
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
            if (column < this.columnNames.size())
            {
                try
                {
                    Method method = comic.getClass().getMethod(this.columnNames.get(column).getMethod());

                    return method.invoke(comic);
                }
                catch (IllegalAccessException
                       | IllegalArgumentException
                       | InvocationTargetException
                       | NoSuchMethodException
                       | SecurityException error)
                {
                    this.logger.error(error.getLocalizedMessage());
                    throw new RuntimeException(error);
                }
            }
            else throw new RuntimeException("invalid or unknown column: " + column);
        }

        return null;
    }

    @Override
    public void selectionChanged()
    {/* do nothing */}
}
