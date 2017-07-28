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

import javax.swing.BoxLayout;
import javax.swing.JLabel;

import org.comixed.tasks.Worker;
import org.comixed.tasks.Worker.State;
import org.comixed.tasks.WorkerListener;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

/**
 * <code>WorkerQueueDetails</code> shows the status of the {@link Worker} as it
 * processes tasks.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class WorkerQueueDetailsPanel extends DetailsPanel implements
                                     InitializingBean,
                                     WorkerListener
{
    private static final long serialVersionUID = -6309623580223095684L;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private Worker worker;

    private JLabel queueState = new JLabel();

    @Override
    public void afterPropertiesSet() throws Exception
    {
        this.logger.debug("Laying out UI components");
        this.worker.addWorkerListener(this);
        this.buildLayout();
        this.updateQueueState();
    }

    private void buildLayout()
    {
        this.logger.debug("Laying out UI components");
        this.setLayout(new BoxLayout(this, BoxLayout.PAGE_AXIS));
        this.add(this.queueState);
    }

    @Override
    public void queueChanged()
    {
        this.updateQueueState();
    }

    private void updateQueueState()
    {
        this.logger.debug("Updating queue details");
        String stateText = (worker.getState() == State.IDLE) ? messageSource.getMessage("view.details.queue.state.idle",
                                                                                        null, getLocale())
                                                             : (worker.getState() == State.RUNNING) ? messageSource.getMessage("view.details.queue.state.running",
                                                                                                                               null,
                                                                                                                               getLocale())
                                                                                                    : messageSource.getMessage("view.details.queue.state.stopped",
                                                                                                                               null,
                                                                                                                               getLocale());
        this.queueState.setText(messageSource.getMessage("view.details.queue.size.label", new Object[]
        {stateText,
         worker.queueSize()}, getLocale()));
    }

    @Override
    public void workerStateChanged()
    {
        this.updateQueueState();
    }
}
