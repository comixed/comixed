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

package org.comixed.tasks;

import org.apache.log4j.Logger;
import org.comixed.adaptors.StatusAdaptor;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * <code>AbstractWorkerTask</code> provides a foundation for creating new
 * {@link WorkerTask} types.
 *
 * @author Darryl L. Pierce
 *
 */
public abstract class AbstractWorkerTask implements
                                         WorkerTask
{
    protected static final Logger logger = Logger.getLogger(AbstractWorkerTask.class);

    @Autowired
    private StatusAdaptor statusAdaptor;

    public AbstractWorkerTask()
    {}

    protected void showStatusText(String message)
    {
        this.statusAdaptor.updateStatusText(message);
    }
}
