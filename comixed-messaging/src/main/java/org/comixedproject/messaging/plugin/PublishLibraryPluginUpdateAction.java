/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.messaging.plugin;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.AbstractPublishAction;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.model.plugin.LibraryPlugin;
import org.comixedproject.views.View;
import org.springframework.stereotype.Component;

/**
 * <code>PublishLibraryPluginUpdateAction</code> publishes changes to the plugin list.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class PublishLibraryPluginUpdateAction extends AbstractPublishAction<List<LibraryPlugin>> {
  static final String PUBLISH_LIBRARY_PLUGIN_UPDATES_TOPIC = "/topic/plugin/list-update";

  @Override
  public void publish(final List<LibraryPlugin> object) throws PublishingException {
    log.debug("Publishing updated plugin list");
    this.doPublish(PUBLISH_LIBRARY_PLUGIN_UPDATES_TOPIC, object, View.LibraryPluginList.class);
  }
}
